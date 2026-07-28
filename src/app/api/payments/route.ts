import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "payments:list:";
const CACHE_TTL_SECONDS = 120; // 2 minutes
const MAX_LIMIT = 100;

// ─── Validation schemas ───────────────────────────────────────────────────────

const createSchema = z.object({
  member_id: z.string().uuid("member_id must be a valid UUID"),
  month_id: z.string().uuid("month_id must be a valid UUID"),
  status: z.enum(["pending", "under_review", "confirmed"]).optional(),
  overdue: z.boolean().optional(),
  amount: z.number().min(0, "amount must be positive").optional(),
  notes: z.string().nullable().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
  status: z.enum(["pending", "under_review", "confirmed"]).optional(),
  month_id: z.string().uuid("month_id must be a valid UUID").optional(),
  member_id: z.string().uuid("member_id must be a valid UUID").optional(),
});

// ─── POST /api/payments ───────────────────────────────────────────────────────

/**
 * POST /api/payments
 *
 * Creates a new payment.
 * Requires coordinator authentication.
 *
 * Body: { member_id, month_id, status?, overdue?, amount?, notes? }
 * Returns: 201 { id, member_id, month_id, status, overdue, amount, notes, created_at }
 */
export async function POST(request: NextRequest): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { member_id, month_id, status, overdue, amount, notes } = parsed.data;

  try {
    const payment = await prisma.payment.create({
      data: {
        memberId: member_id,
        monthId: month_id,
        ...(status !== undefined ? { status } : {}),
        ...(overdue !== undefined ? { overdue } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      select: {
        id: true,
        memberId: true,
        monthId: true,
        status: true,
        overdue: true,
        amount: true,
        notes: true,
        createdAt: true,
      },
    });

    cache.invalidate(CACHE_PREFIX);

    return success(
      {
        id: payment.id,
        member_id: payment.memberId,
        month_id: payment.monthId,
        status: payment.status,
        overdue: payment.overdue,
        amount: Number(payment.amount),
        notes: payment.notes,
        created_at: payment.createdAt,
      },
      201
    );
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2002") {
        return error("Payment already exists for this member and month", 409);
      }
      if (code === "P2003") {
        return error("Member or month not found", 404);
      }
    }

    return error("Internal server error", 500);
  }
}

// ─── GET /api/payments ────────────────────────────────────────────────────────

/**
 * GET /api/payments
 *
 * Lists payments with optional pagination and filters.
 * Requires coordinator authentication.
 *
 * Query params:
 *   - page      (default: 1)
 *   - limit     (default: 10, max: 100)
 *   - status    (optional, pending | under_review | confirmed)
 *   - month_id  (optional, UUID)
 *   - member_id (optional, UUID)
 *
 * Returns: 200 { data: Payment[], total, page, limit }
 */
export async function GET(request: NextRequest): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);

  const parsed = listQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    month_id: searchParams.get("month_id") ?? undefined,
    member_id: searchParams.get("member_id") ?? undefined,
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { page, limit, status, month_id, member_id } = parsed.data;

  const cacheKey = `${CACHE_PREFIX}${page}:${limit}:${status ?? ""}:${month_id ?? ""}:${member_id ?? ""}`;

  const cached = cache.get<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }>(cacheKey);

  if (cached) {
    return success(cached);
  }

  try {
    const where = {
      ...(status ? { status } : {}),
      ...(month_id ? { monthId: month_id } : {}),
      ...(member_id ? { memberId: member_id } : {}),
    };

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          memberId: true,
          monthId: true,
          status: true,
          overdue: true,
          amount: true,
          notes: true,
          createdAt: true,
          receipts: {
            where: { deletedAt: null },
            orderBy: { uploadedAt: "desc" },
            take: 1,
            select: { fileUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    const data = payments.map(
      (p: {
        id: string;
        memberId: string;
        monthId: string;
        status: string;
        overdue: boolean;
        amount: { toNumber(): number } | number;
        notes: string | null;
        createdAt: Date;
        receipts: { fileUrl: string }[];
      }) => ({
        id: p.id,
        member_id: p.memberId,
        month_id: p.monthId,
        status: p.status,
        overdue: p.overdue,
        amount: Number(p.amount),
        notes: p.notes,
        receipt_url: p.receipts[0]?.fileUrl ?? null,
        created_at: p.createdAt,
      })
    );

    const result = { data, total, page, limit };

    cache.set(cacheKey, result, CACHE_TTL_SECONDS);

    return success(result);
  } catch {
    return error("Internal server error", 500);
  }
}
