import { ALLOWED_RESUME_MIME, ALLOWED_RESUME_EXT, env } from "./env";

export type FileValidationResult =
  | { ok: true; ext: string; mime: string }
  | { ok: false; error: string };

/**
 * Validate a resume upload against:
 *  - size limit
 *  - allowed extension
 *  - allowed MIME type
 *  - magic-byte signature (file content really is PDF or a ZIP-based DOCX)
 *
 * This runs server-side. Client-side checks are a UX convenience only.
 */
export function validateResume(opts: {
  filename: string;
  mime: string;
  size: number;
  buffer: Uint8Array;
}): FileValidationResult {
  const { filename, mime, size, buffer } = opts;

  if (size <= 0) return { ok: false, error: "The file appears to be empty." };
  if (size > env.maxUploadBytes) {
    const mb = (env.maxUploadBytes / (1024 * 1024)).toFixed(0);
    return { ok: false, error: `File is too large. Maximum size is ${mb} MB.` };
  }

  const lower = filename.toLowerCase();
  const ext = ALLOWED_RESUME_EXT.find((e) => lower.endsWith(e));
  if (!ext) {
    return { ok: false, error: "Only PDF and DOCX files are accepted." };
  }

  if (!ALLOWED_RESUME_MIME.includes(mime as (typeof ALLOWED_RESUME_MIME)[number])) {
    return { ok: false, error: "Unsupported file type. Please upload a PDF or DOCX." };
  }

  // Signature checks
  const sig = signature(buffer);
  if (ext === ".pdf") {
    if (sig !== "pdf") {
      return { ok: false, error: "The file is not a valid PDF." };
    }
  } else {
    // .docx is a ZIP container; .doc is an OLE compound file.
    if (ext === ".docx" && sig !== "zip") {
      return { ok: false, error: "The file is not a valid DOCX document." };
    }
    if (ext === ".doc" && sig !== "ole" && sig !== "zip") {
      return { ok: false, error: "The file is not a valid Word document." };
    }
  }

  return { ok: true, ext, mime };
}

function signature(buf: Uint8Array): "pdf" | "zip" | "ole" | "unknown" {
  if (buf.length < 4) return "unknown";
  // %PDF
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "pdf";
  }
  // PK\x03\x04 (ZIP, used by DOCX)
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    return "zip";
  }
  // D0 CF 11 E0 (OLE compound — legacy .doc)
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) {
    return "ole";
  }
  return "unknown";
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
