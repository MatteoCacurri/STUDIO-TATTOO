"use client";
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
      <div className="aspect-[16/10]">
        <img src={items[index].mediaUrl} alt={items[index].title ?? `work-${index}`} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={"h-2 w-8 rounded-full " + (i === index ? "bg-white/90" : "bg-white/40")} aria-label={`Vai alla slide ${i+1}`} />
        ))}
      </div>
      <button onClick={() => setIndex((index - 1 + items.length) % items.length)} className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-ghost" aria-label="Prev">‹</button>
      <button onClick={() => setIndex((index + 1) % items.length)} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost" aria-label="Next">›</button>
    </div>
  );
}
