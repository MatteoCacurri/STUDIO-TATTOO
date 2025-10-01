import Link from "next/link";
import ArtistCard from "@/components/ArtistCard";


async function getArtists() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/artists`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-4">
      {/* HERO */}
      <section className="py-20 md:py-28">
        <div className="text-center">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[1.05]">
            Prenota il tuo prossimo <span className="text-primary">tatuaggio</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            Richieste rapide, gestione prenotazioni e pannello admin. Semplice, moderno, fatto per studi professionali.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/book" className="btn btn-primary btn-lg hover-float">Prenota ora</Link>
            <Link href="/admin" className="btn btn-outline btn-lg border-white/20 hover:border-white/40 hover-float">Vai all’admin</Link>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Calendario smart", desc: "Organizza richieste e date in un attimo." },
            { title: "Design accattivante", desc: "Esperienza scura, colori audaci e dettagli glass." },
            { title: "Admin potente", desc: "Filtri, stati, azioni rapide e ricerca." },
          ].map((f, i) => (
            <div key={i} className="card glass hover-float">
              <div className="card-body">
                <h3 className="card-title">{f.title}</h3>
                <p className="text-base-content/70">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section className="my-16">
        <div className="card glass">
          <div className="card-body items-center text-center">
            <h2 className="font-display text-3xl md:text-4xl">Pronto a lasciare il segno?</h2>
            <p className="text-base-content/70 mt-2 max-w-2xl">Bastano pochi secondi per inviare una proposta: data, dimensione e stile. Ti ricontattiamo noi.</p>
            <div className="card-actions mt-6">
              <Link href="/book" className="btn btn-primary btn-wide hover-float">Inizia ora</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

{/* — Sezioni artisti — */}
<div className="space-y-10 mt-10">
  {(await getArtists()).map((a: any) => (
    <ArtistCard key={a.id} artist={a} />
  ))}
</div>

