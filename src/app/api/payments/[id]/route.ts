import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "payments:list:";
const CACHE_DETAIL_PREFIX = "payments:detail:";
const CACHE_TTL_SECONDS = 120; // 2 minutes

// ─── Validation schemas ───────────────────────────────────────────────────────

const updateSchema = z
  .object({
    status: z.enum(["pending", "under_review", "confirmed"]).optional(),
    overdue: z.boolean().optional(),
    amount: z.number().min(0, "amount must be positive").optional(),
    notes: z.string().nullable().optional(),
    receipt_url: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });

// ─── GET /api/payments/[id] ───────────────────────────────────────────────────

/**
 * GET /api/payments/:id
 *
 * Returns the detail of a single payment.
 * Requires coordinator authentication.
 *
 * Returns: 200 { id, member_id, month_id, status, overdue, amount, notes, receipt_url, created_at }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  const cacheKey = `${CACHE_DETAIL_PREFIX}${id}`;

  const cached = cache.get<{
    id: string;
    member_id: string;
    month_id: string;
    status: string;
    overdue: boolean;
    amount: number;
    notes: string | null;
    receipt_url: string | null;
    created_at: Date;
  }>(cacheKey);

  if (cached) {
    return success(cached);
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        memberId: true,
        monthId: true,
        status: true,
        overdue: true,
        amount: true,
        notes: true,
        receiptUrl: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return error("Payment not found", 404);
    }

    const data = {
      id: payment.id,
      member_id: payment.memberId,
      month_id: payment.monthId,
      status: payment.status,
      overdue: payment.overdue,
      amount: Number(payment.amount),
      notes: payment.notes,
      receipt_url: payment.receiptUrl,
      created_at: payment.createdAt,
    };

    cache.set(cacheKey, data, CACHE_TTL_SECONDS);

    return success(data);
  } catch {
    return error("Internal server error", 500);
  }
}

// ─── PATCH /api/payments/[id] ─────────────────────────────────────────────────

/**
 * PATCH /api/payments/:id
 *
 * Administrative update of a payment record (Approval / Rejection flow).
 * Requires coordinator authentication.
 *
 * Allowed status transitions:
 *   under_review -> confirmed  (Approval - flow completed)
 *   under_review -> pending    (Rejection - resets status to pending for re-submission)
 *
 * Any other transition (e.g. pending -> confirmed, confirmed -> pending, etc.) is blocked.
 *
 * Body: { status?, overdue?, amount?, notes?, receipt_url? }
 * Returns: 200 { id, member_id, month_id, status, overdue, amount, notes, receipt_url, created_at }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { status, overdue, amount, notes, receipt_url } = parsed.data;

  try {
    // 1. Locate payment & check current status
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingPayment) {
      return error("Payment not found", 404);
    }

    // 2. Closed flow rule: confirmed payments cannot be modified
    if (existingPayment.status === "confirmed") {
      return error("Cannot modify a confirmed payment", 400);
    }

    // 3. Status transition validation
    if (status !== undefined) {
      // Only under_review -> confirmed or under_review -> pending is allowed
      if (
        existingPayment.status !== "under_review" ||
        (status !== "confirmed" && status !== "pending")
      ) {
        return error(
          "Invalid status transition. Status can only transition from under_review to confirmed or pending",
          400
        );
      }
    }

    // 4. Perform update
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(overdue !== undefined ? { overdue } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(receipt_url !== undefined ? { receiptUrl: receipt_url } : {}),
      },
      select: {
        id: true,
        memberId: true,
        monthId: true,
        status: true,
        overdue: true,
        amount: true,
        notes: true,
        receiptUrl: true,
        createdAt: true,
      },
    });

    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    return success({
      id: payment.id,
      member_id: payment.memberId,
      month_id: payment.monthId,
      status: payment.status,
      overdue: payment.overdue,
      amount: Number(payment.amount),
      notes: payment.notes,
      receipt_url: payment.receiptUrl,
      created_at: payment.createdAt,
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Payment not found", 404);
    }

    return error("Internal server error", 500);
  }
}

// ─── DELETE /api/payments/[id] ────────────────────────────────────────────────

/**
 * DELETE /api/payments/:id
 *
 * Deletes a payment record.
 * Requires coordinator authentication.
 *
 * Returns: 204 No Content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    await prisma.payment.delete({ where: { id } });

    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    return success(null, 204);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Payment not found", 404);
    }

    return error("Internal server error", 500);
  }
}
