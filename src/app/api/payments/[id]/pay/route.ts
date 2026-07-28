import type { NextRequest } from "next/server";
import { z } from "zod";
import { success, error } from "@/lib/api/response";
import { RECEIPTS_BUCKET } from "@/lib/storage";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "payments:list:";
const CACHE_DETAIL_PREFIX = "payments:detail:";

// ─── Validation schemas ───────────────────────────────────────────────────────

const paySchema = z.object({
  notes: z.string().nullable().optional(),
  receipt_url: z.string().url("receipt_url must be a valid URL"),
});

// ─── POST /api/payments/[id]/pay ──────────────────────────────────────────────

/**
 * POST /api/payments/:id/pay
 *
 * Public endpoint for members to confirm payment submission with a receipt.
 *
 * Body: { notes?, receipt_url }
 *
 * Flow:
 * 1. Locate payment (404 if not found)
 * 2. Validate status (allowed: pending; blocked: under_review, confirmed)
 * 3. Validate receipt_url belongs to the receipts bucket and to this payment
 * 4. Prevent receipt reuse across different payments
 * 5. Update notes, receipt_url, and change status to under_review
 * 6. Return updated payment fields: { id, status, notes, receipt_url }
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

  const { notes, receipt_url } = parsed.data;

  try {
    // 1. Locate payment & validate existence
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!payment) {
      return error("Payment not found", 404);
    }

    // 2. Validate status (must be pending)
    if (payment.status !== "pending") {
      return error("Payment is not in pending status", 400);
    }

    // 3. Validate that receipt_url belongs to configured bucket & this payment
    if (!receipt_url.includes(`/${RECEIPTS_BUCKET}/`)) {
      return error("Receipt URL does not belong to the configured bucket", 400);
    }

    if (!receipt_url.includes(`/payments/${id}/`)) {
      return error("Receipt URL does not belong to this payment", 400);
    }

    // 4. Prevent reuse of receipt_url across different payments
    const existingReceipt = await prisma.payment.findFirst({
      where: {
        receiptUrl: receipt_url,
        NOT: { id },
      },
    });

    if (existingReceipt) {
      return error("Receipt URL has already been used for another payment", 400);
    }

    // 5. Update payment details & change status to under_review
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        notes: notes ?? null,
        receiptUrl: receipt_url,
        status: "under_review",
      },
      select: {
        id: true,
        status: true,
        notes: true,
        receiptUrl: true,
      },
    });

    // Invalidate caches
    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    // 6. Return response
    return success({
      id: updatedPayment.id,
      status: updatedPayment.status,
      notes: updatedPayment.notes,
      receipt_url: updatedPayment.receiptUrl,
    });
  } catch (err) {
    console.error("[POST /payments/:id/pay] Error:", err);
    return error("Internal server error", 500);
  }
}
