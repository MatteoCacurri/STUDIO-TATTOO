import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";

export type Artist = {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  instagramUrl?: string | null;
};

type WorkItem = {
  id: number | string;
  mediaUrl: string;
  title?: string | null;
};

async function fetchWorks(artistId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/works?artistId=${artistId}&take=8`,
      { cache: "no-store" }
    );
    if (!res.ok) return [] as WorkItem[];
    return (await res.json()) as WorkItem[];
  } catch {
    return [] as WorkItem[];
  }
}

export default async function ArtistCard({ artist }: { artist: Artist }) {
  const works = await fetchWorks(artist.id);
  const avatar = artist.avatarUrl && artist.avatarUrl.trim() ? artist.avatarUrl : "/img/artist-placeholder.svg";

  return (
    <section className="grid items-center gap-8 rounded-3xl border border-white/10 bg-base-100/40 p-6 backdrop-blur-md md:grid-cols-[300px,1fr]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative h-[220px] w-[220px] overflow-hidden rounded-[48px] border border-white/20 shadow-lg">
          <Image
            src={avatar}
            alt={artist.name}
            fill
            className="object-cover object-center"
            sizes="220px"
          />
        </div>
        <div>
          <h3 className="text-2xl font-semibold uppercase tracking-wide">{artist.name}</h3>
          {artist.bio && <p className="mt-2 text-sm text-base-content/70">{artist.bio}</p>}
        </div>
        <div className="flex flex-col items-center gap-2">
          {artist.instagramUrl ? (
            <a
              href={artist.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-base-100/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-base-content transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              aria-label={`Instagram di ${artist.name}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-primary-content transition group-hover:from-primary group-hover:to-secondary">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1.5a1.5 1.5 0 00-1.06 2.56 1.5 1.5 0 002.12-2.12A1.494 1.494 0 0017.5 5.5zM12 7.5A4.5 4.5 0 107.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 119.5 12 2.5 2.5 0 0112 9.5z"
                  />
                </svg>
              </span>
              Instagram
            </a>
          ) : (
            <span className="rounded-full border border-dashed border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-base-content/50">
              Instagram in arrivo
            </span>
          )}
        </div>
        <Link href={`/book?artistId=${artist.id}`} className="btn btn-secondary btn-wide">
          Prenota con {artist.name}
        </Link>
      </div>

      <div className="relative min-h-[260px]">
        {works.length ? (
          <Carousel items={works} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-base-200/40 p-6 text-sm text-base-content/60">
            Portfolio in aggiornamento.
          </div>
        )}
      </div>
    </section>
  );
}
