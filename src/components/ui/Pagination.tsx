import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { btnSecondary } from "./styles";

export function Pagination({
  page,
  limit,
  total,
  onChange,
}: {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-between pt-2 text-xs text-zinc-500" aria-label="Pagination">
      <span className="font-mono">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <IconChevronLeft size={14} stroke={1.6} />
          Previous
        </button>
        <button type="button" className={btnSecondary} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
          <IconChevronRight size={14} stroke={1.6} />
        </button>
      </div>
    </nav>
  );
}
