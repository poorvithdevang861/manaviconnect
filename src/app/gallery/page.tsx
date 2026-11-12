"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Upload, X } from "lucide-react";
import { api, mediaUrl, type GalleryPhoto } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText, useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { Empty, ErrorBox, Loading, Notice } from "@/components/ui/States";
import { UNDO_WINDOW, useToast } from "@/components/ui/Toast";
import { btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";

export default function GalleryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApi(() => api.gallery.list(), []);
  const [showUpload, setShowUpload] = useState(false);
  const [viewing, setViewing] = useState<GalleryPhoto | null>(null);

  const remove = (photo: GalleryPhoto) => {
    const restore = () => setData((prev) => [...(prev ?? []), photo].sort((a, b) => b.id - a.id));
    setData((prev) => prev?.filter((p) => p.id !== photo.id));
    setViewing(null);
    const timer = window.setTimeout(async () => {
      try {
        await api.gallery.remove(photo.id);
      } catch (err) {
        restore();
        toast.error(errorText(err));
      }
    }, UNDO_WINDOW);
    toast.show({
      message: "Photo deleted",
      action: {
        label: "Undo",
        onClick: () => {
          window.clearTimeout(timer);
          restore();
        },
      },
    });
  };

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Gallery"
        title="Photo gallery"
        description="Campus, reunions and everything in between."
        action={
          user ? (
            <button type="button" onClick={() => setShowUpload((s) => !s)} className={btnPrimary}>
              <Upload size={14} />
              Upload a photo
            </button>
          ) : (
            <Link href="/sign-in?next=/gallery" className={btnSecondary}>
              Sign in to upload
            </Link>
          )
        }
      />

      {showUpload && (
        <UploadForm
          onDone={(photo) => {
            setData((prev) => [photo, ...(prev ?? [])]);
            setShowUpload(false);
            toast.success("Photo added to the gallery");
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {loading ? (
        <Loading variant="grid" />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : data!.length === 0 ? (
        <Empty title="No photos yet">Old class photos, reunion pictures and campus shots all belong here.</Empty>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
          {data!.map((photo) => (
            <li key={photo.id}>
              <button type="button" onClick={() => setViewing(photo)} className="group block w-full text-left">
                <div className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(photo.photo_url)!} alt={photo.caption ?? ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
                <p className="mt-1.5 text-xs text-zinc-700 truncate">{photo.caption || <span className="text-zinc-400">No caption</span>}</p>
                <p className="text-[11px] text-zinc-400">{photo.uploader.name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={viewing.caption ?? "Photo"}
          className="fixed inset-0 z-50 bg-zinc-950/85 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setViewing(null)}
          onKeyDown={(e) => e.key === "Escape" && setViewing(null)}
        >
          <figure className="max-w-4xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(viewing.photo_url)!} alt={viewing.caption ?? ""} className="max-h-[75vh] w-auto mx-auto rounded-lg" />
            <figcaption className="flex items-center justify-between gap-3 text-sm text-white">
              <span>
                {viewing.caption && <strong className="font-semibold">{viewing.caption}</strong>}
                <span className="block text-xs text-white/60">
                  {viewing.uploader.name} · {formatDate(viewing.created_at)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {user && (user.id === viewing.uploaded_by || user.is_admin) && (
                  <button type="button" onClick={() => remove(viewing)} className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-red-600 text-white">
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setViewing(null)} autoFocus className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Close">
                  <X size={16} />
                </button>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

function UploadForm({ onDone, onCancel }: { onDone: (p: GalleryPhoto) => void; onCancel: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Choose a photo first");
    setBusy(true);
    setError("");
    try {
      onDone(await api.gallery.upload(file, caption.trim() || undefined));
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        <ImagePicker file={file} onChange={setFile} maxMb={10} label="Choose photo" />
        <Field label="Caption">
          <TextInput value={caption} maxLength={255} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Sports day, 2009" />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </Card>
  );
}
