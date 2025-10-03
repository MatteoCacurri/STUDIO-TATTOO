"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Artist = {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  videoUrl?: string | null;
  backgroundUrl?: string | null;
  instagramUrl?: string | null;
};

type Availability = Record<string, string[]>;

type CalendarCell = {
  key: string | null;
  label: string;
  isCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];

const ARTIST_VIDEO_MAP: Record<number, string> = {
  1: "/img/video_hero.mp4",
  2: "/img/video_hero.mp4",
};

const ARTIST_BACKGROUND_MAP: Record<number, string> = {
  1: "/artists/cristiano_profile.jpg",
  2: "/artists/sdrains.jpg",
};

const DEFAULT_BACKGROUND_IMAGE = "/img/sfondo_prenotazione.jpg";
const PAGE_BACKGROUND_VIDEO = "/img/output.mp4";

const SKIN_TONES = [
  {
    value: "porcelain",
    label: "Chiara",
    description: "Pelle molto chiara o neutra",
    swatch: "from-[#fbe7d4] to-[#f2cba6]",
  },
  {
    value: "light",
    label: "Media chiara",
    description: "Tono leggermente dorato",
    swatch: "from-[#f1c59b] to-[#d39f72]",
  },
  {
    value: "medium",
    label: "Media",
    description: "Olivastra o abbronzata",
    swatch: "from-[#c48c5a] to-[#a56a3b]",
  },
  {
    value: "deep",
    label: "Scura",
    description: "Tono profondo e intenso",
    swatch: "from-[#8b5a2b] to-[#5a3613]",
  },
];

const DEFAULT_SKIN_TONE = SKIN_TONES[2]?.value ?? SKIN_TONES[0]?.value ?? "";

const PALETTE_OPTIONS = [
  {
    value: "COLORI",
    label: "Colori",
    description: "Palette vivace con sfumature e saturazioni complesse.",
    accent: "from-[#ff6f61] via-[#ff914d] to-[#ffd966]",
  },
  {
    value: "BIANCO_NERO",
    label: "Bianco e nero",
    description: "Contrasti netti e giochi di luce in scala di grigi.",
    accent: "from-[#f8fafc] via-[#cbd5f5] to-[#1f2937]",
  },
];

const DEFAULT_PALETTE = PALETTE_OPTIONS[0]?.value ?? "COLORI";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function buildCalendar(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (firstDay.getUTCDay() + 6) % 7; // set Monday as first day of the week
  const cells: CalendarCell[] = [];

  for (let i = 0; i < offset; i += 1) {
    cells.push({ key: null, label: "", isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${pad(month)}-${pad(day)}`;
    cells.push({ key, label: String(day), isCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: null, label: "", isCurrentMonth: false });
  }

  return cells;
}

function formatFullDate(isoDate: string) {
  try {
    const date = new Date(`${isoDate}T00:00`);
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}

export default function BookPage() {
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<null | "ok" | "err">(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<number | null>(null);

  const now = useMemo(() => new Date(), []);
  const [yearMonth, setYearMonth] = useState(() => ({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  }));
  const [availability, setAvailability] = useState<Availability>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [skinTone, setSkinTone] = useState(DEFAULT_SKIN_TONE);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);
  const [referencePreviews, setReferencePreviews] = useState<Array<{ url: string; name: string }>>([]);

  const todayKey = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingArtists(true);
    setArtistError(null);

    fetch("/api/artists", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("GET /api/artists failed");
        return res.json();
      })
      .then((rows: Artist[]) => {
        if (!alive) return;
        setArtists(rows);
      })
      .catch((err) => {
        console.error(err);
        if (alive) setArtistError("Impossibile caricare gli artisti.");
      })
      .finally(() => {
        if (alive) setLoadingArtists(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const { year, month } = yearMonth;

  useEffect(() => {
    if (!artistId) {
      setAvailability({});
      setSelectedDate(null);
      setSelectedTime("");
      return;
    }

    setLoadingAvailability(true);
    setAvailabilityError(null);
    const controller = new AbortController();

    fetch(`/api/availability?artistId=${artistId}&year=${year}&month=${month}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("GET /api/availability failed");
        return res.json();
      })
      .then((payload: Availability) => {
        setAvailability(payload ?? {});
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setAvailability({});
        setAvailabilityError("Calendario non disponibile al momento.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAvailability(false);
      });

    return () => controller.abort();
  }, [artistId, year, month]);

  const availableDateKeys = useMemo(
    () =>
      Object.entries(availability)
        .filter(([, slots]) => Array.isArray(slots) && slots.length > 0)
        .map(([day]) => day),
    [availability]
  );

  useEffect(() => {
    if (selectedDate && !availableDateKeys.includes(selectedDate)) {
      setSelectedDate(null);
    }
  }, [selectedDate, availableDateKeys]);

  useEffect(() => {
    return () => {
      if (bodyPreview) URL.revokeObjectURL(bodyPreview);
    };
  }, [bodyPreview]);

  useEffect(() => {
    return () => {
      referencePreviews.forEach((entry) => URL.revokeObjectURL(entry.url));
    };
  }, [referencePreviews]);

  const calendarCells = useMemo(
    () => buildCalendar(yearMonth.year, yearMonth.month),
    [yearMonth.year, yearMonth.month]
  );

  const selectedArtist = artistId ? artists.find((a) => a.id === artistId) ?? null : null;
  const selectedArtistVideo = selectedArtist
    ? (selectedArtist.videoUrl && selectedArtist.videoUrl.trim()
        ? selectedArtist.videoUrl
        : ARTIST_VIDEO_MAP[selectedArtist.id] ?? null)
    : null;
  const selectedArtistBackground = selectedArtist
    ? (selectedArtist.backgroundUrl && selectedArtist.backgroundUrl.trim()
        ? selectedArtist.backgroundUrl
        : ARTIST_BACKGROUND_MAP[selectedArtist.id] ?? null)
    : null;
  const backgroundSrc = selectedArtistBackground ?? DEFAULT_BACKGROUND_IMAGE;

  function handleArtistSelect(id: number) {
    setArtistId(id);
    const d = new Date();
    setYearMonth({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
    setSelectedDate(null);
    setSelectedTime("");
    setOk(null);
    setFormError(null);
  }

  function goToMonth(delta: number) {
    setYearMonth((current) => {
      const d = new Date(Date.UTC(current.year, current.month - 1 + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
    });
  }

  function handleBodyImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setBodyPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleReferenceImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files).slice(0, 5) : [];
    setReferencePreviews((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    });
  }

  function handleReset() {
    setSelectedDate(null);
    setSelectedTime("");
    setSkinTone(DEFAULT_SKIN_TONE);
    setPalette(DEFAULT_PALETTE);
    setFormError(null);
    setOk(null);
    setBodyPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setReferencePreviews((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return [];
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!artistId) {
      setFormError("Seleziona prima un artista.");
      return;
    }
    if (!selectedDate) {
      setFormError("Seleziona una data dal calendario.");
      return;
    }
    if (!selectedTime) {
      setFormError("Indica un orario preferito.");
      return;
    }

    const dateTimeString = `${selectedDate}T${selectedTime}`;
    const when = new Date(dateTimeString);
    if (Number.isNaN(when.getTime())) {
      setFormError("Data o orario non validi.");
      return;
    }

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSending(true);
    setOk(null);
    setFormError(null);

    const formData = new FormData(form);
    const trimmedName = String(formData.get("name") ?? "").trim();
    const trimmedEmail = String(formData.get("email") ?? "").trim();
    const trimmedPhone = String(formData.get("phone") ?? "").trim();
    const tattooDescription = String(formData.get("tattoo") ?? "").trim();
    const selectedTone = formData.get("skinTone");
    const selectedPalette = formData.get("palette");

    if (!selectedTone) {
      setSending(false);
      setFormError("Seleziona il tuo tono di pelle.");
      return;
    }

    if (!selectedPalette) {
      setSending(false);
      setFormError("Scegli se preferisci un progetto a colori o in bianco e nero.");
      return;
    }

    formData.set("artistId", String(artistId));
    formData.set("datetime", when.toISOString());
    formData.set("name", trimmedName);
    formData.set("email", trimmedEmail);
    formData.set("phone", trimmedPhone);
    formData.set("tattoo", tattooDescription);
    formData.set("palette", String(selectedPalette));

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("POST /api/bookings failed");

      setOk("ok");
      form.reset();
      setSkinTone(DEFAULT_SKIN_TONE);
      setPalette(DEFAULT_PALETTE);
      setSelectedDate(null);
      setSelectedTime("");
      setBodyPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setReferencePreviews((prev) => {
        prev.forEach((entry) => URL.revokeObjectURL(entry.url));
        return [];
      });
    } catch (err) {
      console.error(err);
      setOk("err");
      setFormError("Impossibile inviare la richiesta. Riprova tra qualche minuto.");
    } finally {
      setSending(false);
    }
  }

  const artistCards = (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {artists.map((artist) => {
        const isActive = artistId === artist.id;
        const avatar = artist.avatarUrl && artist.avatarUrl.trim() ? artist.avatarUrl : "/img/artist-placeholder.svg";
        return (
          <button
            key={artist.id}
            type="button"
            onClick={() => handleArtistSelect(artist.id)}
            className={`card glass overflow-hidden border transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive ? "border-primary shadow-xl" : "border-transparent"
            }`}
            aria-pressed={isActive}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={avatar}
                alt={artist.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 320px"
                priority={artists.length <= 2}
              />
            </div>
            <div className="card-body gap-3">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-xl">{artist.name}</h3>
                <span className="badge badge-outline">{isActive ? "Selezionato" : "Scegli"}</span>
              </div>
              {artist.bio && <p className="text-sm text-base-content/70">{artist.bio}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative isolate overflow-hidden">
      <video
        src={PAGE_BACKGROUND_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
      />
      <Image
        key={backgroundSrc}
        src={backgroundSrc}
        alt="Sfondo prenotazione"
        fill
        priority
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-black/70" aria-hidden="true" />

      <main className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Prenota il tuo tatuaggio</h1>
        <p className="mt-3 text-base-content/70">
          Scegli l&apos;artista, seleziona la data ideale e raccontaci il tatuaggio che hai in mente.
        </p>
      </header>

      {loadingArtists && (
        <div className="mt-10 text-center text-base-content/60">Carichiamo gli artisti...</div>
      )}
      {artistError && (
        <div className="alert alert-error mt-10">
          <span>{artistError}</span>
        </div>
      )}

      {!loadingArtists && !artistError && artists.length > 0 && !artistId && (
        <section>
          <h2 className="mt-10 text-lg font-semibold uppercase tracking-wide text-base-content/60">
            1 · Scegli il tuo tatuatore
          </h2>
          {artistCards}
        </section>
      )}

      {!loadingArtists && !artistError && artists.length === 0 && (
        <section className="mt-10 rounded-3xl border border-dashed border-white/15 bg-base-100/40 p-8 text-center">
          <h2 className="text-xl font-semibold text-base-content">Nessun artista disponibile al momento</h2>
          <p className="mt-3 text-sm text-base-content/70">
            Aggiungi un artista dal pannello admin per riattivare le prenotazioni oppure riprova più tardi.
          </p>
        </section>
      )}

      {artistId && selectedArtist && (
        <section className="mt-12 space-y-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl">
            {selectedArtistVideo ? (
              <video
                key={selectedArtistVideo}
                className="absolute inset-0 h-full w-full object-cover"
                src={selectedArtistVideo}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-base-300 via-base-200 to-base-300" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" aria-hidden="true" />

            <div className="relative flex flex-col gap-5 p-6 text-white md:flex-row md:items-center md:justify-between md:gap-8 md:p-8">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-white/30 shadow-lg md:h-20 md:w-20">
                  <Image
                    src={
                      selectedArtist.avatarUrl && selectedArtist.avatarUrl.trim()
                        ? selectedArtist.avatarUrl
                        : "/img/artist-placeholder.svg"
                    }
                    alt={selectedArtist.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">Hai scelto</p>
                  <h3 className="text-2xl font-semibold uppercase tracking-wide text-white">{selectedArtist.name}</h3>
                  {selectedArtist.bio && <p className="mt-1 text-sm text-white/80 max-w-lg">{selectedArtist.bio}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArtistId(null)}
                className="btn btn-outline btn-sm md:btn-md border-white/60 text-white hover:border-white"
              >
                Cambia artista
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide text-base-content/60">
              2 · Scegli data e orario
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-[2fr,1fr]">
              <div className="card glass border border-white/10">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm border-white/30 text-base-content"
                      onClick={() => goToMonth(-1)}
                    >
                      ‹ Mese prec.
                    </button>
                    <div className="font-medium tracking-wide">
                      {yearMonth.year} · {pad(yearMonth.month)}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm border-white/30 text-base-content"
                      onClick={() => goToMonth(1)}
                    >
                      Mese succ. ›
                    </button>
                  </div>

                  {availabilityError && (
                    <div className="alert alert-error mt-4">
                      <span>{availabilityError}</span>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-base-content/70 uppercase">
                    {WEEKDAY_LABELS.map((label, idx) => (
                      <span key={`${label}-${idx}`}>{label}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {calendarCells.map((cell, index) => {
                      if (!cell.key || !cell.isCurrentMonth) {
                        return <div key={index} className="h-10 rounded-xl border border-dashed border-white/10" />;
                      }

                      const isAvailable = availableDateKeys.includes(cell.key);
                      const isSelected = selectedDate === cell.key;
                      const isToday = cell.key === todayKey;

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          disabled={!isAvailable || loadingAvailability}
                          onClick={() => setSelectedDate(cell.key)}
                          className={`h-10 rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isSelected
                              ? "border-primary bg-primary/20 text-primary-foreground shadow-lg"
                              : isAvailable
                              ? "border-white/30 bg-white/5 text-base-content hover:border-primary/50 hover:bg-primary/10"
                              : "border-white/10 bg-white/0 text-base-content/40"
                          } ${isToday && !isSelected ? "ring-1 ring-white/40" : ""}`}
                        >
                          {cell.label}
                        </button>
                      );
                    })}
                  </div>

                  {loadingAvailability && (
                    <p className="mt-4 text-sm text-base-content/60">Aggiorno la disponibilità...</p>
                  )}
                  {!loadingAvailability && availableDateKeys.length === 0 && (
                    <p className="mt-4 text-sm text-base-content/60">
                      Nessun giorno disponibile in questo mese. Prova a cambiare mese.
                    </p>
                  )}
                </div>
              </div>

              <div className="card glass border border-white/10">
                <div className="card-body space-y-4">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-base-content/60">Data selezionata</p>
                    <p className="text-lg font-semibold">
                      {selectedDate ? formatFullDate(selectedDate) : "Nessuna data"}
                    </p>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Orario preferito</span>
                    </label>
                    <input
                      type="time"
                      className="input input-bordered bg-base-100 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      required
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        L&apos;orario verrà confermato dal tatuatore in fase di contatto.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} onReset={handleReset} className="card glass border border-white/10">
            <div className="card-body grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Nome e cognome</span>
                </label>
                <input
                  required
                  name="name"
                  placeholder="Mario Rossi"
                  className="input input-bordered bg-base-100/70"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="mario@example.com"
                  className="input input-bordered bg-base-100/70"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Telefono</span>
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  pattern="^[0-9+\\s().-]{6,}$"
                  placeholder="+39 333 1234567"
                  className="input input-bordered bg-base-100/70"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">Usiamo il numero solo per confermare o chiarire dettagli sul tatuaggio.</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase tracking-wide text-base-content/70">
                    Tono della pelle
                  </span>
                  <span className="text-xs text-primary">Aiutaci a valutare resa e palette</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {SKIN_TONES.map((tone) => {
                    const isActive = skinTone === tone.value;
                    return (
                      <label
                        key={tone.value}
                        className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                          isActive
                            ? "border-primary/80 bg-primary/10 shadow-lg shadow-primary/20"
                            : "border-white/15 bg-base-100/40 hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="skinTone"
                          value={tone.value}
                          checked={skinTone === tone.value}
                          onChange={() => setSkinTone(tone.value)}
                          required
                        />
                        <span
                          className={`h-12 w-12 rounded-full bg-gradient-to-br ${tone.swatch} shadow-inner shadow-black/20`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold text-base-content">
                            {tone.label}
                          </p>
                          <p className="text-xs text-base-content/70">{tone.description}</p>
                        </div>
                        {isActive && (
                          <span className="absolute right-4 top-4 text-xs font-semibold uppercase tracking-wider text-primary">
                            Scelto
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase tracking-wide text-base-content/70">
                    Palette preferita
                  </span>
                  <span className="text-xs text-base-content/60">Così prepariamo proposte coerenti</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {PALETTE_OPTIONS.map((option) => {
                    const selected = palette === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                          selected
                            ? "border-secondary/80 bg-secondary/10 shadow-lg shadow-secondary/20"
                            : "border-white/15 bg-base-100/40 hover:border-secondary/40 hover:bg-secondary/5"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="palette"
                          value={option.value}
                          checked={palette === option.value}
                          onChange={() => setPalette(option.value)}
                          required
                        />
                        <span
                          className={`h-12 w-12 rounded-full bg-gradient-to-br ${option.accent} shadow-inner shadow-black/10`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold text-base-content">{option.label}</p>
                          <p className="text-xs text-base-content/70">{option.description}</p>
                        </div>
                        {selected && (
                          <span className="absolute right-4 top-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                            Scelto
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Descrizione del tatuaggio</span>
                </label>
                <textarea
                  required
                  name="tattoo"
                  placeholder="Descrivi stile, zona del corpo, dimensioni..."
                  className="textarea textarea-bordered bg-base-100/70 h-28"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Più dettagli ci dai, più veloce sarà la conferma della proposta.
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">Foto della zona da tatuare</span>
                </label>
                <input
                  type="file"
                  name="bodyImage"
                  accept="image/*"
                  className="file-input file-input-bordered bg-base-100/70"
                  onChange={handleBodyImageChange}
                />
                <p className="mt-2 text-xs text-base-content/60">
                  Uno scatto nitido della parte del corpo ci aiuta a definire scala e adattamento del disegno.
                </p>
                {bodyPreview && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-base-100/40 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- preview locale di file */}
                    <img
                      src={bodyPreview}
                      alt="Anteprima zona corpo"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <span className="text-sm text-base-content/70">Anteprima caricata</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">Reference visive (fino a 5 immagini)</span>
                </label>
                <input
                  type="file"
                  name="referenceImages"
                  accept="image/*"
                  multiple
                  className="file-input file-input-bordered bg-base-100/70"
                  onChange={handleReferenceImagesChange}
                />
                <p className="mt-2 text-xs text-base-content/60">
                  Carica schizzi, moodboard o tatuaggi di riferimento per comunicarci atmosfera e direzione stilistica.
                </p>
                {referencePreviews.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {referencePreviews.length} / 5 caricati
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {referencePreviews.map((preview) => (
                        <div
                          key={preview.url}
                          className="flex w-[120px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-base-100/30 p-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- preview locale di file */}
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="h-16 w-full rounded-xl object-cover"
                          />
                          <p className="truncate text-xs text-base-content/70" title={preview.name}>
                            {preview.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <div className="md:col-span-2">
                  <div className="alert alert-error">
                    <span>{formError}</span>
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="reset"
                  className="btn btn-outline btn-secondary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary btn-wide md:btn-lg shadow-lg shadow-primary/30"
                >
                  {sending ? "Invio..." : "Invia la richiesta"}
                </button>
              </div>
            </div>
          </form>

          {ok === "ok" && (
            <div className="alert alert-success">
              <span>Richiesta inviata! Ti ricontatteremo a breve.</span>
            </div>
          )}
          {ok === "err" && (
            <div className="alert alert-error">
              <span>Si è verificato un errore. Riprova.</span>
            </div>
          )}
        </section>
      )}
      </main>
    </div>
  );
}
