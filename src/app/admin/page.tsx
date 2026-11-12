"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, FileSpreadsheet, ImagePlus, Plus, Trash2 } from "lucide-react";
import { api, mediaUrl, type BulkUploadResult, type SpotlightSlide } from "@/lib/api";
import { errorText, useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spotlight } from "@/components/home/Spotlight";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Empty, ErrorBox, Loading, Notice } from "@/components/ui/States";
import { btnDanger, btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";

export default function AdminPage() {
  return (
    <RequireAuth admin>
      {() => (
        <div className={pageCls}>
          <PageHeader tag="Admin" title="Admin" description="Home-page spotlight, bulk member import and unpublished news." />
          <SpotlightEditor />
          <BulkImport />
          <Drafts />
        </div>
      )}
    </RequireAuth>
  );
}

function blankSlide(id: number): SpotlightSlide {
  return { id, image: "", sponsor: "", headline: "", description: "", cta: "", ctaLink: "", badge: "Sponsored", accentFrom: "#9a3412", accentTo: "#ea580c" };
}

function SpotlightEditor() {
  const { data, error, loading, reload } = useApi(() => api.spotlight.list(), []);
  const [slides, setSlides] = useState<SpotlightSlide[]>([]);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setSlides(data);
  }, [data]);

  const update = (i: number, patch: Partial<SpotlightSlide>) => setSlides((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setSlides((s) => {
      const next = [...s];
      [next[i], next[i + d]] = [next[i + d]!, next[i]!];
      return next;
    });

  const save = async () => {
    const missing = slides.findIndex((s) => !s.headline.trim());
    if (missing >= 0) return setStatus({ tone: "error", text: `Slide ${missing + 1} needs a headline.` });
    setBusy(true);
    setStatus(null);
    try {
      setSlides(await api.spotlight.replace(slides));
      setStatus({ tone: "success", text: "Spotlight saved. The home page now shows these slides." });
    } catch (err) {
      setStatus({ tone: "error", text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Home spotlight</h2>
          <p className="text-xs text-zinc-500">Saving replaces every slide. Removing a slide here deletes it.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={btnSecondary} onClick={() => setSlides((s) => [...s, blankSlide(Math.max(0, ...s.map((x) => x.id)) + 1)])}>
            <Plus size={13} />
            Add slide
          </button>
          <button type="button" className={btnPrimary} onClick={save} disabled={busy || loading}>
            {busy ? "Saving…" : "Save spotlight"}
          </button>
        </div>
      </div>
      {status && <Notice tone={status.tone}>{status.text}</Notice>}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : slides.length === 0 ? (
        <Empty title="No slides">The spotlight is hidden on the home page until you add one.</Empty>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <Card key={slide.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-zinc-500">Slide {i + 1}</span>
                <div className="flex gap-1.5">
                  <button type="button" className={btnSecondary} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                    <ArrowUp size={12} />
                  </button>
                  <button type="button" className={btnSecondary} disabled={i === slides.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                    <ArrowDown size={12} />
                  </button>
                  <button type="button" className={btnDanger} onClick={() => setSlides((s) => s.filter((_, j) => j !== i))} aria-label="Remove slide">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <Spotlight slides={[slide]} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Headline" required>
                  <TextInput value={slide.headline} onChange={(e) => update(i, { headline: e.target.value })} />
                </Field>
                <Field label="Sponsor">
                  <TextInput value={slide.sponsor} onChange={(e) => update(i, { sponsor: e.target.value })} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <TextInput value={slide.description} onChange={(e) => update(i, { description: e.target.value })} />
                </Field>
                <Field label="Button text">
                  <TextInput value={slide.cta} onChange={(e) => update(i, { cta: e.target.value })} placeholder="e.g. Apply now" />
                </Field>
                <Field label="Button link" hint="A page like /jobs/14 or a full https:// URL">
                  <TextInput value={slide.ctaLink} onChange={(e) => update(i, { ctaLink: e.target.value })} />
                </Field>
                <Field label="Badge">
                  <TextInput value={slide.badge} onChange={(e) => update(i, { badge: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Colour from">
                    <input type="color" value={slide.accentFrom} onChange={(e) => update(i, { accentFrom: e.target.value })} className="w-full h-9 rounded-lg border border-zinc-200 bg-white p-1" />
                  </Field>
                  <Field label="Colour to">
                    <input type="color" value={slide.accentTo} onChange={(e) => update(i, { accentTo: e.target.value })} className="w-full h-9 rounded-lg border border-zinc-200 bg-white p-1" />
                  </Field>
                </div>
              </div>
              <SlideImage slide={slide} onUploaded={(url) => update(i, { image: url })} onClear={() => update(i, { image: "" })} />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function SlideImage({ slide, onUploaded, onClear }: { slide: SpotlightSlide; onUploaded: (url: string) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onUploaded((await api.spotlight.upload(file)).image_url);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {mediaUrl(slide.image) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(slide.image)!} alt="" className="w-20 h-12 rounded-md object-cover border border-zinc-200" />
      )}
      <button type="button" className={btnSecondary} disabled={busy} onClick={() => ref.current?.click()}>
        <ImagePlus size={13} />
        {busy ? "Uploading…" : slide.image ? "Replace background image" : "Add background image"}
      </button>
      {slide.image && (
        <button type="button" className="text-zinc-500 hover:text-zinc-900" onClick={onClear}>
          Remove image
        </button>
      )}
      <span className="text-zinc-400">JPEG, PNG or WebP, up to 10 MB.</span>
      {error && <span className="text-red-600">{error}</span>}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function BulkImport() {
  const ref = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"template" | "upload" | null>(null);

  const download = async () => {
    setBusy("template");
    setError("");
    try {
      const blob = await api.auth.bulkTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "community_hub_user_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(null);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) return setError("Only .xlsx files are accepted");
    if (file.size > 5 * 1024 * 1024) return setError("File too large (max 5 MB)");
    setBusy("upload");
    setError("");
    setResult(null);
    try {
      setResult(await api.auth.bulkUpload(file));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Import members from Excel</h2>
        <p className="text-xs text-zinc-500">
          Each new member gets an email to set their password (valid 24 hours). Rows with an email that&apos;s already registered are skipped.
        </p>
      </div>
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={download} disabled={busy !== null}>
            <Download size={13} />
            {busy === "template" ? "Downloading…" : "Download template"}
          </button>
          <button type="button" className={btnPrimary} onClick={() => ref.current?.click()} disabled={busy !== null}>
            <FileSpreadsheet size={13} />
            {busy === "upload" ? "Importing…" : "Upload filled template"}
          </button>
          <input
            ref={ref}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge size="sm">{result.summary.total} rows</Badge>
              <Badge variant="verified" size="sm">{result.summary.created} created</Badge>
              <Badge size="sm">{result.summary.skipped} skipped</Badge>
              {result.summary.failed > 0 && <Badge variant="danger" size="sm">{result.summary.failed} failed</Badge>}
            </div>
            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 text-zinc-500 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Row</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Result</th>
                    <th className="px-3 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {result.rows.map((r) => (
                    <tr key={r.row}>
                      <td className="px-3 py-2 font-mono">{r.row}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 font-mono">{r.email}</td>
                      <td className="px-3 py-2">
                        <Badge variant={r.status === "created" ? "verified" : r.status === "failed" ? "danger" : "neutral"} size="sm">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-zinc-600">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

function Drafts() {
  const { data, error, loading, reload } = useApi(() => api.news.listAll({ limit: 100 }), []);
  const drafts = data?.articles.filter((a) => !a.is_published) ?? [];

  return (
    <section id="drafts" className="space-y-3 scroll-mt-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">News drafts</h2>
          <p className="text-xs text-zinc-500">Unpublished articles. Only admins can see these.</p>
        </div>
        <Link href="/news/new" className={btnSecondary}>
          <Plus size={13} />
          New article
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : drafts.length === 0 ? (
        <Empty title="No drafts" />
      ) : (
        <Card className="divide-y divide-zinc-100">
          {drafts.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link href={`/news/${a.id}`} className="text-sm font-medium text-zinc-900 hover:text-orange-600">
                  {a.title}
                </Link>
                <p className="text-[11px] text-zinc-400 font-mono">Created {formatDate(a.created_at)}</p>
              </div>
              <Link href={`/news/new?id=${a.id}`} className={btnSecondary}>
                Edit
              </Link>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}
