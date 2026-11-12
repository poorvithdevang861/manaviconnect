"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { mediaUrl } from "@/lib/api";

const ACCEPT = "image/jpeg,image/png,image/webp";

/** Picks one image (JPEG, PNG or WebP) and previews it. Validation mirrors the API's upload rules. */
export function ImagePicker({
  file,
  onChange,
  currentUrl,
  maxMb = 5,
  label = "Choose image",
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  maxMb?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) return setError("Only JPEG, PNG or WebP images");
    if (f.size > maxMb * 1024 * 1024) return setError(`Image must be under ${maxMb} MB`);
    onChange(f);
  };

  const shown = preview ?? mediaUrl(currentUrl);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="w-24 h-16 rounded-lg object-cover border border-zinc-200" />
        ) : (
          <div className="w-24 h-16 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-400">
            <ImagePlus size={18} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-press px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200"
          >
            {shown ? "Replace" : label}
          </button>
          {file && (
            <button type="button" onClick={() => onChange(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700" aria-label="Remove selected image">
              <X size={14} />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className={`text-[11px] ${error ? "text-red-600" : "text-zinc-500"}`}>{error || `JPEG, PNG or WebP, up to ${maxMb} MB.`}</p>
    </div>
  );
}
