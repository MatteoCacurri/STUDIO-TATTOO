"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";

type Item = { id: number | string; mediaUrl: string; title?: string | null };

export default function Carousel({ items, auto = true, interval = 4000 }: { items: Item[]; auto?: boolean; interval?: number; }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!auto || items.length <= 1) return;
    timer.current = window.setInterval(() => setIndex(i => (i + 1) % items.length), interval);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [items.length, auto, interval]);
  if (!items?.length) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      <div className="relative aspect-[16/10]">
        <Image
          src={items[index].mediaUrl}
          alt={items[index].title ?? `work-${index}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={"h-2 w-8 rounded-full " + (i === index ? "bg-white/90" : "bg-white/40")} aria-label={`Vai alla slide ${i+1}`} />
        ))}
      </div>
      <button
        onClick={() => setIndex((index - 1 + items.length) % items.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-primary/60"
        aria-label="Prev"
      >
        ‹
      </button>
      <button
        onClick={() => setIndex((index + 1) % items.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/40 px-3 py-2 text-white backdrop-blur hover:bg-primary/60"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
