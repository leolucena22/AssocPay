import type { NextRequest } from "next/server";
import { z } from "zod";
import { success, error } from "@/lib/api/response";
import { RECEIPTS_BUCKET, removeReceiptFile } from "@/lib/storage";
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

// ─── Helper: extract storage path from signed/public URL ─────────────────────

function extractStoragePath(url: string): string | null {
  const match = url.match(/payments\/[^?]+/);
  return match ? match[0] : null;
}

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
 * 5. Clean up previous receipt file from storage if resubmitting after rejection
 * 6. Update notes, receipt_url, and change status to under_review
 * 7. Return updated payment fields: { id, status, notes, receipt_url }
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
      select: {
        id: true,
        status: true,
        receipts: {
          where: { deletedAt: null },
          orderBy: { uploadedAt: "desc" },
          take: 1,
          select: { fileUrl: true },
        },
      },
    });

    if (!payment) {
      return error("Payment not found", 404);
    }

    // 2. Validate status (must be pending)
    if (payment.status !== "pending") {
      return error("Payment is not in pending status", 400);
    }

    // 3. Validate that receipt_url belongs to domain (if configured), bucket & this payment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !receipt_url.startsWith(supabaseUrl)) {
      return error(
        "Receipt URL does not belong to the configured storage service",
        400
      );
    }

    if (!receipt_url.includes(`/${RECEIPTS_BUCKET}/`)) {
      return error("Receipt URL does not belong to the configured bucket", 400);
    }

    if (!receipt_url.includes(`/payments/${id}/`)) {
      return error("Receipt URL does not belong to this payment", 400);
    }

    // 4. Prevent reuse of receipt_url across different payments
    const existingReceipt = await prisma.receipt.findFirst({
      where: {
        fileUrl: receipt_url,
        paymentId: { not: id },
        deletedAt: null,
      },
    });

    if (existingReceipt) {
      return error(
        "Receipt URL has already been used for another payment",
        400
      );
    }

    // 5. Clean up old receipt file from storage if previously rejected and resubmitting a new one
    const latestReceipt = payment.receipts[0];
    if (latestReceipt && latestReceipt.fileUrl !== receipt_url) {
      const oldStoragePath = extractStoragePath(latestReceipt.fileUrl);
      if (oldStoragePath) {
        // Fire and forget removal — non-blocking, error logged internally
        removeReceiptFile(oldStoragePath).catch((err) =>
          console.error("[storage] Clean up old file error:", err)
        );
      }
    }

    // 6. Update payment details & change status to under_review
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        notes: notes ?? null,
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

    // 7. Return response
    return success({
      id: updatedPayment.id,
      status: updatedPayment.status,
      notes: updatedPayment.notes,
      receipt_url: receipt_url,
    });
  } catch (err) {
    console.error("[POST /payments/:id/pay] Error:", err);
    return error("Internal server error", 500);
  }
}
