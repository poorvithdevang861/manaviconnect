"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { mediaUrl, type SpotlightSlide } from "@/lib/api";

export function Spotlight({ slides }: { slides: SpotlightSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(index, slides.length - 1)]!;
  const image = mediaUrl(slide.image);
  const external = /^https?:/.test(slide.ctaLink);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-xl border border-zinc-200/80 text-white min-h-[180px] flex"
      style={{ background: `linear-gradient(120deg, ${slide.accentFrom}, ${slide.accentTo})` }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
      )}
      <div key={slide.id} className="relative p-6 sm:p-8 flex flex-col justify-center gap-2 max-w-2xl animate-fade-in">
        <div className="flex items-center gap-2 text-[11px] font-mono">
          {slide.badge && <span className="px-2 py-0.5 rounded-md bg-white/15 border border-white/25">{slide.badge}</span>}
          <span className="text-white/80">{slide.sponsor}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug">{slide.headline}</h2>
        {slide.description && <p className="text-sm text-white/85 leading-relaxed">{slide.description}</p>}
        {slide.cta && slide.ctaLink && (
          <div className="pt-2">
            <Link
              href={slide.ctaLink}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-zinc-900 hover:bg-zinc-100"
            >
              {slide.cta}
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
