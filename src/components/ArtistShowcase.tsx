"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Artist } from "@/components/ArtistCard";

type WorkItem = {
  id: number | string;
  artistId: number;
  title?: string | null;
  mediaUrl: string;
};

type Props = {
  artist: Artist;
  works: WorkItem[];
};

type SocialLink = {
  name: string;
  href: string;
  icon: JSX.Element;
};

const ARTIST_SOCIALS: Record<number, SocialLink[]> = {
  1: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/cristiano.tatts/",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1.5a1.5 1.5 0 00-1.06 2.56 1.5 1.5 0 002.12-2.12A1.494 1.494 0 0017.5 5.5zM12 7.5A4.5 4.5 0 107.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 119.5 12 2.5 2.5 0 0112 9.5z"
          />
        </svg>
      ),
    },
  ],
  2: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/sdrains.tattoo/",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1.5a1.5 1.5 0 00-1.06 2.56 1.5 1.5 0 002.12-2.12A1.494 1.494 0 0017.5 5.5zM12 7.5A4.5 4.5 0 107.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 119.5 12 2.5 2.5 0 0112 9.5z"
          />
        </svg>
      ),
    },
  ],
};

const AUTO_PLAY_INTERVAL = 4500;
const FADE_DURATION = 220;

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function WorkMedia({ item, priority }: { item: WorkItem; priority?: boolean }) {
  if (isVideo(item.mediaUrl)) {
    return (
      <video
        key={item.mediaUrl}
        src={item.mediaUrl}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <Image
      key={item.mediaUrl}
      src={item.mediaUrl}
      alt={item.title ?? "Opera dell'artista"}
      fill
      priority={priority}
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}

function useAutoplay(length: number, isPaused: boolean, onTick: () => void) {
  useEffect(() => {
    if (length <= 1 || isPaused) return;
    const id = window.setInterval(onTick, AUTO_PLAY_INTERVAL);
    return () => window.clearInterval(id);
  }, [length, isPaused, onTick]);
}

function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [active]);
}

export default function ArtistShowcase({ artist, works }: Props) {
  const slides = useMemo(() => (works.length ? works : []), [works]);
  const hasSlides = slides.length > 0;
  const fallbackImage = artist.avatarUrl && artist.avatarUrl.trim() ? artist.avatarUrl : "/img/artist-placeholder.svg";

  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const showcaseId = useId();
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index, indexRef]);

  const changeTo = useCallback(
    (target: number) => {
      if (!hasSlides || isFading) return;
      const normalized = ((target % slides.length) + slides.length) % slides.length;
      setIsFading(true);
      window.setTimeout(() => {
        setIndex(normalized);
        indexRef.current = normalized;
        window.setTimeout(() => setIsFading(false), FADE_DURATION);
      }, FADE_DURATION);
    },
    [hasSlides, slides.length, isFading, indexRef]
  );

  const next = useCallback(() => {
    if (!hasSlides) return;
    changeTo(indexRef.current + 1);
  }, [changeTo, hasSlides, indexRef]);

  const prev = useCallback(() => {
    if (!hasSlides) return;
    changeTo(indexRef.current - 1);
  }, [changeTo, hasSlides, indexRef]);

  useAutoplay(slides.length, !hasSlides || modalOpen, next);
  useLockBodyScroll(modalOpen);

  useEffect(() => {
    if (!hasSlides) setIndex(0);
  }, [hasSlides]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const currentSlide = hasSlides ? slides[index] : null;
  const fadingOpacity = isFading ? "opacity-0" : "opacity-100";

  return (
    <section className="rounded-3xl border border-white/10 bg-base-100/40 p-5 backdrop-blur" data-motion="fade-up">
      <div className="grid items-center gap-6 md:grid-cols-[1.1fr,0.9fr]" data-motion-stagger="120">
        <div className="relative h-[260px] overflow-hidden rounded-[32px] border border-white/10 shadow-lg sm:h-[320px]" data-motion="fade-right">
          {currentSlide ? (
            <div className={`relative h-full w-full transition-opacity duration-300 ease-out ${fadingOpacity}`} key={currentSlide.id}>
              <WorkMedia item={currentSlide} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/40" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">Portfolio</p>
                  <h3 className="text-lg font-semibold">{currentSlide.title ?? `Opera #${index + 1}`}</h3>
                </div>
                <div className="flex gap-1">
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={fallbackImage}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          )}

          {hasSlides && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-xl text-white shadow-lg transition hover:bg-primary/70"
                aria-label="Opera precedente"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-xl text-white shadow-lg transition hover:bg-primary/70"
                aria-label="Opera successiva"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 text-center md:text-left" data-motion="fade-up">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-start" data-motion-stagger="80">
            <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-white/20 shadow-lg">
              <Image
                src={fallbackImage}
                alt={artist.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-base-content">{artist.name}</h2>
              {artist.bio && <p className="mt-1 text-sm text-base-content/70">{artist.bio}</p>}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {ARTIST_SOCIALS[artist.id]?.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="btn btn-sm btn-outline border-white/30 text-base-content hover:border-primary motion-pressable"
                target="_blank"
                rel="noreferrer"
              >
                <span className="flex items-center gap-2">
                  {social.icon}
                  <span>{social.name}</span>
                </span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <button
              type="button"
              className="btn btn-primary motion-pressable"
              onClick={() => setModalOpen(true)}
            >
              Guarda il portfolio
            </button>
            <Link href={`/book?artistId=${artist.id}`} className="btn btn-secondary motion-pressable">
              Prenota con {artist.name}
            </Link>
          </div>
        </div>
      </div>

      {modalOpen && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 px-4 py-10">
            <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-base-100 shadow-2xl">
              <div className="sticky top-4 z-20 flex justify-end px-6">
                <button
                  type="button"
                  className="rounded-full bg-black/50 p-2 text-white shadow-md transition hover:bg-primary motion-pressable"
                  onClick={() => setModalOpen(false)}
                  aria-label="Chiudi"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 px-6 pb-8 md:grid-cols-[1.3fr,0.7fr] md:px-10">
                <div className="relative h-[320px] overflow-hidden rounded-2xl border border-white/10 shadow-lg sm:h-[420px]">
                  {currentSlide ? (
                    <div className={`relative h-full w-full transition-opacity duration-300 ease-out ${fadingOpacity}`} key={`modal-${currentSlide.id}`}>
                      <WorkMedia item={currentSlide} priority />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-white">
                        <h3 className="text-xl font-semibold">{currentSlide.title ?? `Opera #${index + 1}`}</h3>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={fallbackImage}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}

                  {hasSlides && (
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <button
                        type="button"
                        onClick={prev}
                        className="rounded-full bg-black/35 p-2 text-2xl text-white shadow-lg transition hover:bg-primary/70 motion-pressable"
                        aria-label="Opera precedente"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="rounded-full bg-black/35 p-2 text-2xl text-white shadow-lg transition hover:bg-primary/70 motion-pressable"
                        aria-label="Opera successiva"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-4xl font-semibold uppercase tracking-wide text-base-content">{artist.name}</h2>
                    {artist.bio && <p className="mt-3 text-base text-base-content/70">{artist.bio}</p>}
                  </div>

                  {hasSlides && (
                    <div className="space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-base-100/60 p-4 max-h-56">
                      {slides.map((item, i) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => changeTo(i)}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition hover:border-primary/60 motion-pressable ${
                            i === index ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-base-content"
                          }`}
                        >
                          <span className="text-xs font-semibold text-base-content/60">#{i + 1}</span>
                          <span className="truncate">{item.title ?? `Opera ${i + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {ARTIST_SOCIALS[artist.id]?.map((social) => (
                      <a
                        key={`${showcaseId}-${social.name}`}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline border-white/30 text-base-content hover:border-primary"
                      >
                        <span className="flex items-center gap-2">
                          {social.icon}
                          <span>{social.name}</span>
                        </span>
                      </a>
                    ))}
                  </div>

                  <Link href={`/book?artistId=${artist.id}`} className="btn btn-primary btn-lg shadow-lg shadow-primary/30 motion-pressable">
                    Prenota una sessione con {artist.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
