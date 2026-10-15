import { describe, it, expect } from "vitest";
import { validateResume, humanFileSize } from "@/lib/file-validation";

const PDF_SIG = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]); // %PDF-1
const ZIP_SIG = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]); // PK..
const OLE_SIG = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0x00, 0x00]);
const JUNK = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

describe("validateResume", () => {
  it("accepts a valid PDF", () => {
    const res = validateResume({
      filename: "cv.pdf",
      mime: "application/pdf",
      size: PDF_SIG.length,
      buffer: PDF_SIG,
    });
    expect(res.ok).toBe(true);
  });

  it("accepts a valid DOCX (zip signature)", () => {
    const res = validateResume({
      filename: "cv.docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: ZIP_SIG.length,
      buffer: ZIP_SIG,
    });
    expect(res.ok).toBe(true);
  });

  it("accepts a legacy .doc (OLE signature)", () => {
    const res = validateResume({
      filename: "cv.doc",
      mime: "application/msword",
      size: OLE_SIG.length,
      buffer: OLE_SIG,
    });
    expect(res.ok).toBe(true);
  });

  it("rejects a disallowed extension", () => {
    const res = validateResume({
      filename: "cv.exe",
      mime: "application/pdf",
      size: PDF_SIG.length,
      buffer: PDF_SIG,
    });
    expect(res.ok).toBe(false);
  });

  it("rejects a PDF extension with a non-PDF signature", () => {
    const res = validateResume({
      filename: "fake.pdf",
      mime: "application/pdf",
      size: JUNK.length,
      buffer: JUNK,
    });
    expect(res.ok).toBe(false);
  });

  it("rejects a disallowed MIME type", () => {
    const res = validateResume({
      filename: "cv.pdf",
      mime: "image/png",
      size: PDF_SIG.length,
      buffer: PDF_SIG,
    });
    expect(res.ok).toBe(false);
  });

  it("rejects files over the size limit", () => {
    const res = validateResume({
      filename: "cv.pdf",
      mime: "application/pdf",
      size: 50 * 1024 * 1024,
      buffer: PDF_SIG,
    });
    expect(res.ok).toBe(false);
  });

  it("rejects an empty file", () => {
    const res = validateResume({
      filename: "cv.pdf",
      mime: "application/pdf",
      size: 0,
      buffer: new Uint8Array(0),
    });
    expect(res.ok).toBe(false);
  });
});

describe("humanFileSize", () => {
  it("formats bytes, KB and MB", () => {
    expect(humanFileSize(512)).toBe("512 B");
    expect(humanFileSize(2048)).toBe("2.0 KB");
    expect(humanFileSize(5 * 1024 * 1024)).toBe("5.00 MB");
  });
});
