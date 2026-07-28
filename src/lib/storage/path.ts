import { randomBytes } from "crypto";
import { MIME_TO_EXTENSION, type AllowedMimeType } from "./constants";

/**
 * Generates a secure, unpredictable storage path for a receipt file.
 *
 * Format: `payments/<paymentId>/<uuid>-<randomSuffix>.<ext>`
 *
 * Design decisions:
 * - paymentId scopes files to their payment context (easier lifecycle management).
 * - uuid (v4-style random) + random suffix makes the path impossible to enumerate.
 * - Extension is derived from the validated MIME type, never from client input.
 * - No personal data (name, phone, institution) is ever included.
 * - Path segments are hard-coded — no user input can inject ".." or extra slashes
 *   (path traversal is structurally impossible).
 *
 * @param paymentId  UUID of the payment this receipt belongs to.
 * @param mimeType   Validated MIME type used to select the correct extension.
 * @returns          Full storage path ready to be passed to the upload helper.
 */
export function generateReceiptPath(
  paymentId: string,
  mimeType: AllowedMimeType
): string {
  const uuid = crypto.randomUUID();
  const suffix = randomBytes(8).toString("hex");
  const ext = MIME_TO_EXTENSION[mimeType];

  // Sanitise paymentId: keep only alphanumeric and hyphens to prevent any
  // path traversal even if an unexpected value slips through.
  const safePaymentId = paymentId.replace(/[^a-zA-Z0-9-]/g, "");

  return `payments/${safePaymentId}/${uuid}-${suffix}.${ext}`;
}
