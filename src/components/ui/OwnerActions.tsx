"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react";
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
          <button type="button" onClick={handleDelete} disabled={busy} className={btnDanger}>
            {busy ? <IconLoader2 size={14} stroke={1.6} className="animate-spin" /> : <IconTrash size={14} stroke={1.6} />}
            Delete
          </button>
        </div>
      ) : (
        <>
          {editHref && (
            <Link href={editHref} className={btnSecondary}>
              <IconPencil size={14} stroke={1.6} />
              Edit
            </Link>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label={`Delete ${noun}`}
            >
              <IconTrash size={16} stroke={1.6} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
