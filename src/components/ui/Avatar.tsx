import { mediaUrl } from "@/lib/api";
import { initials } from "@/lib/format";

const SIZES = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-[11px]", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-lg" };

export function Avatar({ name, src, size = "sm" }: { name: string; src?: string | null; size?: keyof typeof SIZES }) {
  const url = mediaUrl(src);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`${SIZES[size]} rounded-full object-cover border border-zinc-200 shrink-0`} />;
  }
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-mono font-semibold shrink-0`}
    >
      {initials(name)}
    </span>
  );
}
