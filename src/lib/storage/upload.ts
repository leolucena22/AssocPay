import { storage } from "./client";
import { RECEIPTS_BUCKET, SIGNED_URL_EXPIRES_IN } from "./constants";
import { generateReceiptPath } from "./path";
import { compressReceiptFile } from "./compress";
import type { AllowedMimeType } from "./constants";

// ─── Result types ─────────────────────────────────────────────────────────────

export type UploadResult =
  | { ok: true; storagePath: string }
  | { ok: false; message: string };

export type SignedUrlResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export type RemoveResult =
  | { ok: true }
  | { ok: false; message: string };

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a receipt file to the private Supabase Storage bucket.
 *
 * Steps:
 * 1. Generates a secure, unpredictable storage path (no personal data).
 * 2. Compresses images; PDFs pass through unchanged.
 * 3. Uploads with `upsert: false` to prevent overwriting existing files.
 *
 * Returns the storage path on success (store this in the database, not a URL).
 * Returns an error message on failure.
 *
 * @param paymentId  UUID of the payment (used to scope the path).
 * @param file       Validated File object from the multipart request.
 * @param mimeType   Validated MIME type — used for compression and path generation.
 */
export async function uploadReceiptFile(
  paymentId: string,
  file: File,
  mimeType: AllowedMimeType
): Promise<UploadResult> {
  try {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await compressReceiptFile(rawBuffer, mimeType);
    const storagePath = generateReceiptPath(paymentId, mimeType);

    const { error } = await storage
      .from(RECEIPTS_BUCKET)
      .upload(storagePath, compressed, {
        contentType: mimeType,
        upsert: false, // Prevent overwriting — each upload always gets a new path.
      });

    if (error) {
      console.error("[storage] Upload failed:", error.message);
      return { ok: false, message: "Failed to upload file" };
    }

    return { ok: true, storagePath };
  } catch (err) {
    console.error("[storage] Unexpected error during upload:", err);
    return { ok: false, message: "Failed to upload file" };
  }
}

// ─── Signed URL ───────────────────────────────────────────────────────────────

/**
 * Generates a short-lived signed URL for a receipt stored in the private bucket.
 *
 * The URL expires after SIGNED_URL_EXPIRES_IN seconds (default: 1 hour).
 * Files are never accessible via a permanent public URL.
 *
 * @param storagePath  The path previously returned by uploadReceiptFile.
 */
export async function getReceiptSignedUrl(
  storagePath: string
): Promise<SignedUrlResult> {
  try {
    const { data, error } = await storage
      .from(RECEIPTS_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN);

    if (error || !data?.signedUrl) {
      console.error("[storage] Signed URL generation failed:", error?.message);
      return { ok: false, message: "Failed to generate file URL" };
    }

    return { ok: true, url: data.signedUrl };
  } catch (err) {
    console.error("[storage] Unexpected error generating signed URL:", err);
    return { ok: false, message: "Failed to generate file URL" };
  }
}

// ─── Remove ───────────────────────────────────────────────────────────────────

/**
 * Removes a receipt file from the private bucket.
 *
 * Errors from Supabase are surfaced as `{ ok: false }` — callers should decide
 * whether a failed removal is fatal or can be logged and ignored.
 *
 * @param storagePath  The path previously returned by uploadReceiptFile.
 */
export async function removeReceiptFile(
  storagePath: string
): Promise<RemoveResult> {
  try {
    const { error } = await storage
      .from(RECEIPTS_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error("[storage] Remove failed:", error.message);
      return { ok: false, message: "Failed to remove file" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[storage] Unexpected error during removal:", err);
    return { ok: false, message: "Failed to remove file" };
  }
}
