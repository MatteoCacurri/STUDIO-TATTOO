import ArtistShowcase from "@/components/ArtistShowcase";

export type Artist = {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  videoUrl?: string | null;
  backgroundUrl?: string | null;
};

type WorkItem = {
  id: number | string;
  artistId: number;
  title?: string | null;
  mediaUrl: string;
};

async function fetchWorks(artistId: number): Promise<WorkItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/works?artistId=${artistId}&take=12`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as WorkItem[];
  } catch {
    return [];
  }
}

export default async function ArtistCard({ artist }: { artist: Artist }) {
  const works = await fetchWorks(artist.id);
  return <ArtistShowcase artist={artist} works={works} />;
}
