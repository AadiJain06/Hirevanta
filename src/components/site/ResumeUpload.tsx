"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024; // mirrors server default; server is source of truth
const ACCEPT = ".pdf,.docx,.doc";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface UploadedResume {
  key: string;
  filename: string;
  mime: string;
  size: number;
}

export function ResumeUpload({
  value,
  onChange,
}: {
  value: UploadedResume | null;
  onChange: (v: UploadedResume | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localName, setLocalName] = useState<string>("");

  function clientValidate(file: File): string | null {
    const lower = file.name.toLowerCase();
    if (!/\.(pdf|docx|doc)$/.test(lower)) {
      return "Only PDF and DOCX files are accepted.";
    }
    if (file.size > MAX_BYTES) {
      return `File is too large. Maximum size is ${humanSize(MAX_BYTES)}.`;
    }
    return null;
  }

  function upload(file: File) {
    const clientError = clientValidate(file);
    if (clientError) {
      setError(clientError);
      return;
    }
    setError(null);
    setLocalName(file.name);
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.ok) {
          onChange(res.data as UploadedResume);
          setProgress(100);
        } else {
          setError(res.error ?? "Upload failed. Please try again.");
          onChange(null);
        }
      } catch {
        setError("Upload failed. Please try again.");
        onChange(null);
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("Network error during upload. Please try again.");
      onChange(null);
    };
    xhr.send(form);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function remove() {
    onChange(null);
    setError(null);
    setProgress(0);
    setLocalName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {!value && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
            dragging
              ? "border-violetx bg-violetx/10"
              : "border-white/15 bg-white/[0.02] hover:border-violetx/50 hover:bg-white/[0.04]",
          )}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violetx/15 text-violetx-soft">
            <UploadCloud className="h-7 w-7" />
          </span>
          <span className="text-sm font-semibold text-white">
            Drag & drop your résumé, or{" "}
            <span className="gradient-text">browse files</span>
          </span>
          <span className="text-xs text-slate-500">
            PDF or DOCX · up to {humanSize(MAX_BYTES)}
          </span>
        </button>
      )}

      {uploading && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violetx-soft" />
            <span className="flex-1 truncate text-sm text-white">{localName}</span>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-brand-gradient transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {value && !uploading && (
        <div className="glass flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {value.filename}
            </p>
            <p className="text-xs text-slate-400">
              {humanSize(value.size)} ·{" "}
              {value.mime.includes("pdf") ? "PDF" : "DOCX"}
              <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-emerald-400" />
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={remove}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-400"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
