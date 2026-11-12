"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { errorText } from "@/lib/useApi";
import { titleCase } from "@/lib/format";
import { btnDanger, btnSecondary } from "./styles";
import { useToast } from "./Toast";

/** Edit link + two-step delete, shown to the creator or an admin. */
export function OwnerActions({
  editHref,
  onDelete,
  noun,
}: {
  editHref?: string;
  onDelete?: () => Promise<void>;
  noun: string;
}) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!confirming || busy) return;
    const t = setTimeout(() => setConfirming(false), 5000);
    return () => clearTimeout(t);
  }, [confirming, busy]);

  const handleDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
      toast.success(`${titleCase(noun)} deleted`);
    } catch (err) {
      toast.error(errorText(err));
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2 animate-pop-in" role="group" aria-label={`Confirm delete ${noun}`}>
          <span className="text-xs text-zinc-600">Delete this {noun}?</span>
          <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={btnSecondary} autoFocus>
            Keep
          </button>
          <button type="button" onClick={handleDelete} disabled={busy} className={`${btnDanger} !bg-red-600 !text-white !border-red-600 hover:!bg-red-700`}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      ) : (
        <>
          {editHref && (
            <Link href={editHref} className={btnSecondary}>
              <Pencil size={12} />
              Edit
            </Link>
          )}
          {onDelete && (
            <button type="button" onClick={() => setConfirming(true)} className={btnDanger}>
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </>
      )}
    </div>
  );
}
