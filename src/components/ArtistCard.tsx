import Link from "next/link";
import Carousel from "./Carousel";
export type Artist = { id: number; name: string; bio?: string | null; avatarUrl?: string | null; };
export default async function ArtistCard({ artist }: { artist: Artist }) {
  const works = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/works?artistId=${artist.id}&take=8`, { cache: "no-store" }).then(r => r.json()).catch(() => [] as { id: number; mediaUrl: string; title?: string | null }[]);
  return (
    <section className="grid md:grid-cols-[280px,1fr] gap-6 p-6 rounded-3xl border bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-44 h-44 rounded-full overflow-hidden shadow-md">
          <img src={artist.avatarUrl ?? "/placeholder-avatar.jpg"} alt={artist.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold">{artist.name}</h3>
        {artist.bio && <p className="text-sm text-muted-foreground mt-2">{artist.bio}</p>}
        <Link href={`/book?artistId=${artist.id}`} className="btn btn-primary mt-4">Prenota con {artist.name}</Link>
      </div>
      <div className="min-h-[240px]">
        <Carousel items={works} />
      </div>
    </section>
  );
}
