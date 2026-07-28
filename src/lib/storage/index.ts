/**
 * @module storage
 *
 * Public API for the receipt upload infrastructure.
 *
 * Usage in route handlers:
 * ```ts
 * import {
 *   validateReceiptFile,
 *   uploadReceiptFile,
 *   getReceiptSignedUrl,
 *   removeReceiptFile,
 * } from "@/lib/storage";
 * ```
 */

export { validateReceiptFile } from "./validate";
export type { ValidationResult } from "./validate";

export {
  uploadReceiptFile,
  getReceiptSignedUrl,
  removeReceiptFile,
} from "./upload";
export type { UploadResult, SignedUrlResult, RemoveResult } from "./upload";

export { RECEIPTS_BUCKET, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES, SIGNED_URL_EXPIRES_IN } from "./constants";
export type { AllowedMimeType } from "./constants";
