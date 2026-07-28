import type { NextRequest } from "next/server";
import { z } from "zod";
import { success, error } from "@/lib/api/response";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "payments:list:";
const CACHE_DETAIL_PREFIX = "payments:detail:";

// ─── Validation schemas ───────────────────────────────────────────────────────

const paySchema = z.object({
  notes: z.string().nullable().optional(),
});

// ─── POST /api/payments/[id]/pay ──────────────────────────────────────────────

/**
 * POST /api/payments/:id/pay
 *
 * Public endpoint for members to confirm payment submission for review.
 *
 * Body: { notes? }
 *
 * Flow:
 * 1. Locate payment (404 if not found)
 * 2. Validate status (allowed: pending, rejected; blocked: under_review, confirmed)
 * 3. Verify that at least one active receipt exists for this payment
 * 4. Update notes (if provided) and change status to under_review
 * 5. Invalidate caches and return updated payment data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = paySchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { notes } = parsed.data;

  try {
    // 1. Locate payment & validate existence
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!payment) {
      return error("Payment not found", 404);
    }

    // 2. Validate status (Allowed: pending, rejected. Blocked: under_review, confirmed)
    if (payment.status !== "pending" && payment.status !== "rejected") {
      return error(
        `Cannot submit payment for review when status is ${payment.status}`,
        400
      );
    }

    // 3. Verify at least one active receipt exists
    const activeReceiptCount = await prisma.receipt.count({
      where: {
        paymentId: id,
        deletedAt: null,
      },
    });

    if (activeReceiptCount === 0) {
      return error(
        "Payment must have at least one receipt to submit for review",
        400
      );
    }

    // 4. Update payment notes and change status to under_review
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...(notes !== undefined ? { notes: notes ?? null } : {}),
        status: "under_review",
      },
      select: {
        id: true,
        status: true,
        notes: true,
      },
    });

    // Invalidate caches
    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    // 5. Return response
    return success({
      id: updatedPayment.id,
      status: updatedPayment.status,
      notes: updatedPayment.notes,
    });
  } catch (err) {
    console.error("[POST /payments/:id/pay] Error:", err);
    return error("Internal server error", 500);
  }
}
