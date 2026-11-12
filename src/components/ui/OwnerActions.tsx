"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { errorText } from "@/lib/useApi";
import { btnDanger, btnSecondary } from "./styles";

/** Edit link + confirm-before-delete button, shown to the creator or an admin. */
export function OwnerActions({
  editHref,
  onDelete,
  noun,
}: {
  editHref?: string;
  onDelete?: () => Promise<void>;
  noun: string;
}) {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || !window.confirm(`Delete this ${noun}? This can't be undone from the app.`)) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      window.alert(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {editHref && (
        <Link href={editHref} className={btnSecondary}>
          <Pencil size={12} />
          Edit
        </Link>
      )}
      {onDelete && (
        <button type="button" onClick={handleDelete} disabled={busy} className={btnDanger}>
          <Trash2 size={12} />
          {busy ? "Deleting…" : "Delete"}
        </button>
      )}
    </div>
  );
}
