// ─── Bucket ───────────────────────────────────────────────────────────────────

/** Name of the private Supabase Storage bucket used for payment receipts. */
export const RECEIPTS_BUCKET = "receipts";

// ─── Size limits ──────────────────────────────────────────────────────────────

/** Maximum allowed file size for receipt uploads (5 MB). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ─── Allowed types ────────────────────────────────────────────────────────────

/** MIME types accepted for receipt uploads. */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Maps each allowed MIME type to its canonical file extension. */
export const MIME_TO_EXTENSION: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

// ─── Signed URL ───────────────────────────────────────────────────────────────

/** How long (in seconds) a signed URL remains valid. Defaults to 1 hour. */
export const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour
