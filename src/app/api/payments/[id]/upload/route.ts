import type { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import {
  validateReceiptFile,
  uploadReceiptFile,
  getReceiptSignedUrl,
} from "@/lib/storage";
import prisma from "@/lib/prisma";

/**
 * POST /api/payments/:id/upload
 *
 * Uploads a payment receipt file for a pending payment.
 * Public endpoint (no coordinator authentication required).
 *
 * Request: multipart/form-data with field `file`.
 *
 * Flow:
 * 1. Find payment (404 if not found)
 * 2. Validate status (must be pending)
 * 3. Validate file (size, mime type, magic bytes via validateReceiptFile helper)
 * 4. Compress image when necessary & upload to storage bucket (via uploadReceiptFile helper)
 * 5. Return signed URL for receipt (does NOT save receipt_url to DB yet)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    // 1. Locate payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!payment) {
      return error("Payment not found", 404);
    }

    // 2. Validate status
    if (payment.status !== "pending") {
      return error("Payment is not in pending status", 400);
    }

    // Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return error("Invalid form data", 400);
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return error("File is required", 400);
    }

    // 3. Validate file
    const validation = await validateReceiptFile(file);
    if (!validation.ok) {
      return error(validation.message, 400);
    }

    // 4 & 5. Compress (if image) and upload to storage bucket
    const uploadResult = await uploadReceiptFile(
      id,
      file,
      validation.mimeType
    );

    if (!uploadResult.ok) {
      return error(uploadResult.message, 500);
    }

    // Generate signed URL
    const signedUrlResult = await getReceiptSignedUrl(
      uploadResult.storagePath
    );

    if (!signedUrlResult.ok) {
      return error(signedUrlResult.message, 500);
    }

    // 6. Return receipt URL
    return success({
      receipt_url: signedUrlResult.url,
    });
  } catch (err) {
    console.error("[POST /payments/:id/upload] Error:", err);
    return error("Internal server error", 500);
  }
}
