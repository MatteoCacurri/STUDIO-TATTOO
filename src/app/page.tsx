import Image from "next/image";
import Link from "next/link";
import ArtistCard, { type Artist as ArtistType } from "@/components/ArtistCard";

async function getArtists(): Promise<ArtistType[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/artists`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

const highlights = [
  {
    title: "Precisione su appuntamento",
    description: "Ogni sessione è pensata su misura, dal primo contatto alla cura post tattoo.",
  },
  {
    title: "Stili distintivi",
    description: "Linee sottili, blackwork e realismo a colori. Trova l&apos;artista perfetto per te.",
  },
  {
    title: "Studio certificato",
    description: "Igiene, strumenti monouso e prodotti professionali: sicurezza prima di tutto.",
  },
];

const values = [
  {
    label: "20+ anni di esperienza combinata",
    text: "Un team che ha trasformato più di 3.000 idee in tatuaggi unici.",
  },
  {
    label: "Consulenze dedicate",
    text: "Ti aiutiamo a definire dimensione, stile e composizione prima di incidere l&apos;inchiostro.",
  },
  {
    label: "Supporto post sessione",
    text: "Indicazioni personalizzate per una guarigione perfetta e colori brillanti.",
  },
];

export default async function Home() {
  const artists = await getArtists();

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-base-100 to-base-300/30">
      <div className="absolute inset-x-0 top-[-200px] h-[400px] bg-gradient-radial from-primary/30 via-transparent to-transparent blur-3xl" aria-hidden="true" />

      <div className="container mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative isolate mt-16 overflow-hidden rounded-[48px] border border-white/5 bg-black/40 px-6 py-16 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl md:px-12 md:py-20">
          <video
            src="/img/video_hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black/80 via-black/60 to-primary/30" />
          <div className="max-w-3xl text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Studio Tattoo Creativo</p>
            <h1 className="mt-6 font-display text-4xl leading-tight md:text-6xl">
              Disegni originali, tecnica impeccabile, attenzione artigianale.
            </h1>
            <p className="mt-6 text-lg text-white/75 md:text-xl">
              Prenota una consulenza con il nostro team per trasformare la tua idea in un&apos;opera permanente.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/40">
                Prenota una sessione
              </Link>
              <a href="#team" className="btn btn-outline btn-lg border-white/40 text-white hover:border-white">
                Scopri il team
              </a>
            </div>
          </div>
        </section>

        {/* Studio overview */}
        <section className="mt-20 grid gap-12 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Lo studio</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Dai primi schizzi alla cura finale, ti accompagniamo in ogni passaggio.</h2>
            <p className="text-base text-base-content/70">
              Lavoriamo su appuntamento per dedicarti tempo e attenzione esclusivi. Prepariamo bozzetti personalizzati,
              studiamo il posizionamento migliore e utilizziamo pigmenti certificati per colori intensi che durano nel tempo.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-base-100/60 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-base-content/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
            <Image
              src="/img/studio-workspace.jpg"
              alt="Postazione di lavoro"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/50 px-5 py-4 text-sm text-white/80 backdrop-blur">
              &ldquo;L&apos;ambiente fa la differenza: sterilità, atmosfera e comfort per sessioni piacevoli.&rdquo;
            </div>
          </div>
        </section>

        {/* Valori */}
        <section className="mt-20 rounded-[40px] border border-white/10 bg-base-100/40 p-10 backdrop-blur">
          <div className="grid gap-10 md:grid-cols-3">
            {values.map((item) => (
              <div key={item.label} className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">{item.label}</h3>
                <p className="text-base text-base-content/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section id="team" className="mt-24 space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Il team</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Artisti specializzati, ognuno con la propria firma stilistica.</h2>
            <p className="text-base text-base-content/70 md:w-2/3 md:self-center">
              Sfoglia le gallerie e scegli chi rispecchia di più il tuo stile. Puoi prenotare direttamente dalla card di ogni artista.
            </p>
          </div>

          <div className="space-y-12">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
            {artists.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/20 bg-base-200/30 p-12 text-center text-base-content/60">
                Stiamo preparando le presentazioni del team.
              </div>
            )}
          </div>
        </section>

        {/* CTA finale */}
        <section className="my-24">
          <div className="card glass border border-primary/30 bg-primary/15">
            <div className="card-body items-center text-center gap-4 md:flex md:flex-row md:items-center md:justify-between md:text-left">
              <div>
                <h2 className="font-display text-3xl md:text-4xl">Pronto a iniziare il tuo prossimo tatuaggio?</h2>
                <p className="text-base-content/80 mt-2 max-w-2xl">
                  Raccontaci la tua idea: forma, stile, zona del corpo. Ti ricontatteremo con una proposta personalizzata.
                </p>
              </div>
              <Link href="/book" className="btn btn-primary btn-lg shadow-lg shadow-primary/40">
                Prenota ora
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
