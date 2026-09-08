import "server-only";
import { put, del } from "@vercel/blob";

/**
 * Document storage (PRD §34). Vercel Blob in any environment that has a token
 * — adding Blob storage to the Vercel project sets BLOB_READ_WRITE_TOKEN
 * automatically. Local development without a token falls back to the public
 * folder, which is fine for a laptop and never used on a serverless host
 * (its filesystem is read-only).
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export interface StoredFile {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

export class UploadError extends Error {}

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-80);
}

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function storeFile(file: File, keyPrefix: string): Promise<StoredFile> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
    );
  }
  if (file.type && !ACCEPTED_MIME.includes(file.type)) {
    throw new UploadError("Upload a PDF, Word or Excel document, or a JPG, PNG or WebP image.");
  }

  const pathname = `${keyPrefix}/${Date.now()}-${safeName(file.name)}`;

  if (storageConfigured()) {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    });
    return {
      url: blob.url,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new UploadError(
      "Document storage is not configured. Add Vercel Blob to the project so BLOB_READ_WRITE_TOKEN is available.",
    );
  }

  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const target = join(process.cwd(), "public", "uploads", pathname);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${pathname}`,
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function deleteFile(url: string) {
  if (!storageConfigured() || url.startsWith("/uploads/")) return;
  try {
    await del(url);
  } catch (error) {
    console.error("[storage] delete failed:", (error as Error).message);
  }
}
