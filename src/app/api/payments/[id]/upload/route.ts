import type { NextRequest } from "next/server";
import { success, error } from "@/lib/api/response";
import { validateReceiptFile, uploadReceiptFile } from "@/lib/storage";
import prisma from "@/lib/prisma";

/**
 * POST /api/payments/:id/upload
 *
 * Uploads a payment receipt file for a payment in pending or rejected status.
 * Public endpoint (no coordinator authentication required).
 *
 * Request: multipart/form-data with field `file`.
 *
 * Flow:
 * 1. Locate payment (404 if not found)
 * 2. Validate status (allowed: pending, rejected; blocked: under_review, confirmed)
 * 3. Validate file (size, mime type, magic bytes via validateReceiptFile)
 * 4. Compress image when necessary & upload to storage bucket
 * 5. Create a new Receipt record in database
 * 6. Return created Receipt data ({ id, original_name, mime_type, file_size, uploaded_at })
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

    // 2. Validate status (Allowed: pending, rejected. Blocked: under_review, confirmed)
    if (payment.status !== "pending" && payment.status !== "rejected") {
      return error(
        `Upload is not allowed when payment status is ${payment.status}`,
        400
      );
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

    // 4 & 5. Compress, upload to storage bucket, and create Receipt record
    const uploadResult = await uploadReceiptFile(
      id,
      file,
      validation.mimeType
    );

    if (!uploadResult.ok) {
      return error(uploadResult.message, 500);
    }

    // 6. Return created Receipt data
    return success({
      id: uploadResult.receipt.id,
      original_name: uploadResult.receipt.originalName,
      mime_type: uploadResult.receipt.mimeType,
      file_size: uploadResult.receipt.fileSize,
      uploaded_at: uploadResult.receipt.uploadedAt,
    });
  } catch (err) {
    console.error("[POST /payments/:id/upload] Error:", err);
    return error("Internal server error", 500);
  }
}
