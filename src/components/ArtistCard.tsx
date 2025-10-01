import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";

export type Artist = {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
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
