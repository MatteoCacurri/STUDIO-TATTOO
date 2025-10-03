import Link from "next/link";

type HourSlot = {
  day: string;
  hours: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const HOURS: HourSlot[] = [
  { day: "Lunedì - Venerdì", hours: "10:00 – 19:00" },
  { day: "Sabato", hours: "10:00 – 17:00" },
  { day: "Domenica", hours: "Chiuso" },
  { day: "Festivi", hours: "Su appuntamento" },
];

const FAQS: FaqItem[] = [
  {
    question: "Come funziona la prenotazione?",
    answer:
      "Compila il form nella sezione Prenota indicando artista, idea e disponibilità. Ti ricontatteremo entro 24 ore con una conferma e le indicazioni per la caparra.",
  },
  {
    question: "Quanto tempo serve per un nuovo tatuaggio?",
    answer:
      "Dipende dalla complessità del progetto e dalla disponibilità dell'artista. In media fissiamo il primo appuntamento entro 2-3 settimane.",
  },
  {
    question: "Posso portare un disegno già pronto?",
    answer:
      "Certamente! Portalo in studio o allegalo nel form di prenotazione. Lo adattiamo insieme per garantire resa e guarigione ottimali.",
  },
  {
    question: "Fate anche coperture o restyling di tatuaggi esistenti?",
    answer:
      "Sì, valutiamo ogni caso singolarmente. Prenota una consulenza indicando foto del tatuaggio da coprire così possiamo consigliarti la soluzione migliore.",
  },
];

type Social = {
  name: string;
  href: string;
  icon: JSX.Element;
  label: string;
};

const SOCIALS: Social[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    label: "Seguici su Instagram",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1.5a1.5 1.5 0 00-1.06 2.56 1.5 1.5 0 002.12-2.12A1.494 1.494 0 0017.5 5.5zM12 7.5A4.5 4.5 0 107.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 119.5 12 2.5 2.5 0 0112 9.5z"
        />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    label: "Seguici su Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M13 3h4a1 1 0 011 1v3a1 1 0 01-1 1h-3v3h3.5a1 1 0 01.98 1.197l-.5 3a1 1 0 01-.98.803H14v7a1 1 0 01-1 1h-3a1 1 0 01-1-1v-7H7a1 1 0 01-1-1v-3a1 1 0 011-1h2V8a5 5 0 015-5z"
        />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/",
    label: "Seguici su TikTok",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M14.5 3a1 1 0 01.97-.999 7.5 7.5 0 006.03 5.935 1 1 0 01.83.985v3.079a1 1 0 01-1.28.961 10.42 10.42 0 01-3.02-.982v4.521a5.5 5.5 0 11-5.5-5.5c.169 0 .336.008.5.024V3zm-2.5 9.024A3.5 3.5 0 1015.5 15v-6.22a12.4 12.4 0 01-1.5-.689v4.433a1 1 0 01-1.402.915 2.5 2.5 0 10.598 1.628c0-.172-.015-.34-.042-.5H12z"
        />
      </svg>
    ),
  },
];

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1282.1057867496697!2d12.774098289826686!3d41.94840236962585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sit!2sit!4v1759405104506!5m2!1sit!2sit";

export default function ContactPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <video
        src="/img/SFONDO_CONTATTI.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/70" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <header className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-primary sm:text-sm">Contattaci</p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-base-content sm:text-4xl md:text-5xl">
            Passa in studio, scrivici o prenota una consulenza.
          </h1>
          <p className="mt-4 text-base text-base-content/70 sm:text-lg md:max-w-2xl">
            Siamo nel cuore della città: fissiamo appuntamenti su misura e rispondiamo alle tue domande
            ogni giorno. Qui trovi tutte le informazioni utili per raggiungerci e prepararti al meglio.
          </p>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-xl">
            <iframe
              title="Mappa Studio"
              src={MAP_EMBED_URL}
              loading="lazy"
              allowFullScreen
              className="h-[360px] w-full border-0 md:h-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_20px_30px_-15px_rgba(0,0,0,0.9)]">
                <span className="text-lg font-semibold text-primary-content">C4</span>
              </div>
            </div>
          </div>

          <div className="card glass border border-white/10">
            <div className="card-body gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary">Lo studio</p>
                <h2 className="mt-2 text-2xl font-semibold">C4os Tattoo Studio</h2>
                <p className="mt-2 text-sm text-base-content/70">
                  Via Torino 1, Milano (MI) &middot; Piano terra interno cortile
                </p>
              </div>
              <div className="grid gap-3 text-sm">
                {HOURS.map((slot) => (
                  <div
                    key={slot.day}
                    className="flex items-center justify-between rounded-2xl bg-base-100/60 px-4 py-3 text-base-content"
                  >
                    <span className="font-medium">{slot.day}</span>
                    <span className="text-base-content/70">{slot.hours}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Via+Torino+1,+Milano"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline hover-float"
                >
                  Apri su Google Maps
                </a>
                <Link href="/book" className="btn btn-primary hover-float">
                  Prenota una sessione
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[32px] border border-white/10 bg-base-100/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-base-content sm:text-3xl">Domande frequenti</h2>
          <p className="mt-2 text-sm text-base-content/70">
            Tutto quello che c&apos;è da sapere prima della sessione. Se non trovi la risposta, scrivici pure.
          </p>
          <div className="mt-6 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="collapse collapse-arrow rounded-2xl border border-white/10 bg-base-100/60"
              >
                <summary className="collapse-title text-base font-semibold text-base-content">
                  {faq.question}
                </summary>
                <div className="collapse-content text-sm text-base-content/70">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 card glass border border-white/10">
          <div className="card-body gap-6 md:flex md:items-center md:justify-between md:gap-10">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Resta in contatto con noi</h2>
              <p className="mt-2 text-sm text-base-content/70">
                Anteprime dei nuovi progetti, apertura agenda e dietro le quinte dal laboratorio.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="group flex items-center gap-2 rounded-full border border-white/10 bg-base-100/70 px-4 py-2 text-sm font-medium text-base-content transition-transform duration-200 hover:-translate-y-1 hover:border-primary hover:text-primary"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-primary-content transition-all duration-200 group-hover:from-primary group-hover:to-secondary">
                    {social.icon}
                  </span>
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
