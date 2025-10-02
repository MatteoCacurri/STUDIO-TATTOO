"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

type Booking = {
  id: number;
  artistId: number;
  name: string;
  email: string;
  phone: string | null;
  skinTone: string | null;
  palette: "BIANCO_NERO" | "COLORI";
  datetime: string; // ISO
  tattoo: string;
  bodyImage: string | null;
  references: string[];
  status: "Nuovo" | "Confermato" | "Fatto";
  artist: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
};

const SKIN_TONE_META: Record<string, { label: string; gradient: string }> = {
  porcelain: { label: "Chiara", gradient: "from-[#fbe7d4] to-[#f2cba6]" },
  light: { label: "Media chiara", gradient: "from-[#f1c59b] to-[#d39f72]" },
  medium: { label: "Media", gradient: "from-[#c48c5a] to-[#a56a3b]" },
  deep: { label: "Scura", gradient: "from-[#8b5a2b] to-[#5a3613]" },
};

const PALETTE_LABEL: Record<Booking["palette"], string> = {
  BIANCO_NERO: "Bianco e nero",
  COLORI: "Colori",
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function badge(s: Booking["status"]) {
  const map = {
    Nuovo: "badge-info",
    Confermato: "badge-success",
    Fatto: "badge-neutral",
  } as const;
  return <span className={`badge ${map[s]} badge-sm`}>{s}</span>;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [artistFilter, setArtistFilter] = useState<string>("");
  const [toDelete, setToDelete] = useState<Booking | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/bookings", { cache: "no-store" });
        if (!res.ok) throw new Error("GET /api/bookings failed");
        const rows = await res.json();
        if (alive) setBookings(rows);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const data = useMemo(() => {
    return bookings.filter((b) => {
      const qok =
        !q ||
        b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.email.toLowerCase().includes(q.toLowerCase()) ||
        (b.phone?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        b.tattoo.toLowerCase().includes(q.toLowerCase()) ||
        (b.artist?.name?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        (b.skinTone?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        PALETTE_LABEL[b.palette].toLowerCase().includes(q.toLowerCase());
      const dok =
        (!from || new Date(b.datetime) >= new Date(from)) &&
        (!to || new Date(b.datetime) <= new Date(to));
      const aok = !artistFilter || String(b.artistId) === artistFilter;
      return qok && dok && aok;
    });
  }, [bookings, q, from, to, artistFilter]);

  const artistOptions = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    for (const b of bookings) {
      if (b.artist) map.set(b.artist.id, { id: b.artist.id, name: b.artist.name });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  function openDeleteModal(b: Booking) {
    setToDelete(b);
    (document.getElementById("delete_modal") as HTMLDialogElement)?.showModal();
  }

  function closeDeleteModal() {
    (document.getElementById("delete_modal") as HTMLDialogElement)?.close();
    setToDelete(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/bookings/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
      setBookings((prev) => prev.filter((x) => x.id !== toDelete.id));
      closeDeleteModal();
      setToast("Prenotazione cancellata");
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error(e);
      setToast("Errore cancellazione");
      setTimeout(() => setToast(null), 2000);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestione prenotazioni</h1>
        <p className="text-base-content/60">Filtra, aggiorna status, cancella.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          className="input input-bordered bg-base-100/70"
          placeholder="Cerca (nome, email, tatuaggio)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="date"
          className="input input-bordered bg-base-100/70"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="input input-bordered bg-base-100/70"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <select
          className="select select-bordered bg-base-100/70"
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
        >
          <option value="">Tutti gli artisti</option>
          {artistOptions.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Artista</th>
              <th>Cliente</th>
              <th>Contatti</th>
              <th>Data/Ora</th>
              <th>Tatuaggio</th>
              <th>Media</th>
              <th>Status</th>
              <th className="text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={b.artist?.avatarUrl ?? "/img/artist-placeholder.svg"}
                        alt={b.artist?.name ?? "Artista"}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{b.artist?.name ?? "—"}</p>
                      <p className="text-xs text-base-content/60">ID #{b.artistId}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{b.name}</span>
                    {(() => {
                      const tone = SKIN_TONE_META[b.skinTone ?? ""];
                      if (!tone) return null;
                      return (
                        <span className="inline-flex items-center gap-2 text-xs text-base-content/60">
                          <span
                            className={`h-3 w-3 rounded-full bg-gradient-to-br ${tone.gradient} shadow-inner shadow-black/30`}
                            aria-hidden="true"
                          />
                          {tone.label}
                        </span>
                      );
                    })()}
                    <span className="text-[11px] uppercase tracking-wide text-primary/80">
                      {PALETTE_LABEL[b.palette]}
                    </span>
                  </div>
                </td>
                <td className="max-w-[18ch]">
                  <div className="flex flex-col gap-1 text-sm">
                    <a href={`mailto:${b.email}`} className="truncate text-primary">
                      {b.email}
                    </a>
                    {b.phone ? (
                      <a href={`tel:${b.phone.replace(/\s+/g, "")}`} className="text-xs text-base-content/70">
                        {b.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-base-content/50">—</span>
                    )}
                  </div>
                </td>
                <td>{formatDate(b.datetime)}</td>
                <td className="truncate max-w-[24ch]">{b.tattoo}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {b.bodyImage && (
                      <a
                        href={b.bodyImage}
                        target="_blank"
                        rel="noreferrer"
                        className="tooltip"
                        data-tip="Zona da tatuare"
                      >
                        <Image
                          src={b.bodyImage}
                          alt="Zona da tatuare"
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                        />
                      </a>
                    )}
                    {b.references?.map((ref, idx) => (
                      <a
                        key={ref}
                        href={ref}
                        target="_blank"
                        rel="noreferrer"
                        className="tooltip"
                        data-tip={`Reference ${idx + 1}`}
                      >
                        <Image
                          src={ref}
                          alt={`Reference ${idx + 1}`}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                        />
                      </a>
                    ))}
                    {!b.bodyImage && (!b.references || b.references.length === 0) && (
                      <span className="text-xs text-base-content/50">—</span>
                    )}
                  </div>
                </td>
                <td>{badge(b.status)}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-sm" onClick={() => openDeleteModal(b)}>
                      Cancella
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-base-content/60">
                  Nessuna prenotazione trovata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal cancellazione */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confermi la cancellazione?</h3>
          <p className="py-4">
            Stai per cancellare la prenotazione #{toDelete?.id} di <b>{toDelete?.name}</b>.
          </p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn" onClick={closeDeleteModal}>Annulla</button>
              <button className="btn btn-error" onClick={confirmDelete}>Cancella</button>
            </form>
          </div>
        </div>
      </dialog>

      {toast && (
        <div className="toast toast-end">
          <div className="alert alert-info">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
