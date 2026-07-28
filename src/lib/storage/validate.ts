import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from "./constants";

// ─── Magic bytes (file signatures) ────────────────────────────────────────────
// Used to verify the actual content of the file, not just the declared MIME type.
// This prevents clients from renaming a dangerous file to an allowed extension.

const MAGIC_BYTES: Record<AllowedMimeType, { offset: number; bytes: number[] }[]> =
  {
    "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
    "image/png": [
      { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    ],
    "image/webp": [
      // RIFF....WEBP
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
    "application/pdf": [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  };

// ─── Result type ──────────────────────────────────────────────────────────────

export type ValidationResult =
  | { ok: true; mimeType: AllowedMimeType }
  | { ok: false; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesMagicBytes(
  buffer: Uint8Array,
  signatures: { offset: number; bytes: number[] }[]
): boolean {
  return signatures.every(({ offset, bytes }) =>
    bytes.every((byte, i) => buffer[offset + i] === byte)
  );
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Validates a receipt file against all security constraints:
 *
 * 1. Non-empty file.
 * 2. Size does not exceed MAX_FILE_SIZE_BYTES.
 * 3. Declared Content-Type is in the allowed list.
 * 4. Actual file bytes match the expected magic numbers for the declared type.
 *    (Prevents disguising a disallowed file as an allowed one.)
 *
 * Returns `{ ok: true, mimeType }` on success or `{ ok: false, message }` on
 * failure. The caller is responsible for returning the appropriate HTTP error.
 *
 * @param file  The File/Blob received from the multipart request.
 */
export async function validateReceiptFile(
  file: File
): Promise<ValidationResult> {
  // 1. Reject empty files.
  if (file.size === 0) {
    return { ok: false, message: "File must not be empty" };
  }

  // 2. Reject oversized files.
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const limitMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      ok: false,
      message: `File size exceeds the ${limitMB} MB limit`,
    };
  }

  // 3. Validate declared MIME type.
  const declaredMime = file.type as AllowedMimeType;

  if (!ALLOWED_MIME_TYPES.includes(declaredMime)) {
    return {
      ok: false,
      message: `File type "${file.type}" is not allowed. Accepted types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  // 4. Validate magic bytes — check actual file content, not just the declared type.
  //    Read only the first 12 bytes (enough for all signatures above).
  const header = await file.slice(0, 12).arrayBuffer();
  const buffer = new Uint8Array(header);

  const signatures = MAGIC_BYTES[declaredMime];

  if (!matchesMagicBytes(buffer, signatures)) {
    return {
      ok: false,
      message: "File content does not match the declared file type",
    };
  }

  return { ok: true, mimeType: declaredMime };
}
