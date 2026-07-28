import sharp from "sharp";
import type { AllowedMimeType } from "./constants";

// ─── Compression settings ─────────────────────────────────────────────────────

/** JPEG quality (1–100). 82 is a good balance for readability vs. file size. */
const JPEG_QUALITY = 82;

/** WebP quality (1–100). 82 keeps text and fine details legible. */
const WEBP_QUALITY = 82;

/** PNG compression level (0–9). 8 gives strong compression without being slow. */
const PNG_COMPRESSION = 8;

/**
 * Compresses an image buffer using sharp.
 *
 * - JPEG/WebP: re-encoded with MozJPEG/WebP encoder at the configured quality.
 * - PNG: compressed with pngquant at the configured level.
 * - PDF: returned unchanged — binary format, no lossless compression applied.
 *
 * The output buffer always uses the same format as the input MIME type
 * (no format conversion). This keeps the extension consistent with the
 * content and avoids surprises downstream.
 *
 * @param buffer    Raw file bytes.
 * @param mimeType  Validated MIME type of the file.
 * @returns         Compressed buffer (or original buffer for PDFs).
 */
export async function compressReceiptFile(
  buffer: Buffer,
  mimeType: AllowedMimeType
): Promise<Buffer> {
  if (mimeType === "application/pdf") {
    // PDFs are not modified.
    return buffer;
  }

  const image = sharp(buffer);

  switch (mimeType) {
    case "image/jpeg":
      return image
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();

    case "image/png":
      return image
        .png({ compressionLevel: PNG_COMPRESSION, adaptiveFiltering: true })
        .toBuffer();

    case "image/webp":
      return image
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
  }
}
