"use client";

import { useMemo, useState } from "react";

type Booking = {
  id: number;
  name: string;
  email: string;
  datetime: string; // ISO
  tattoo: string;
  status: "Nuovo" | "Confermato" | "Fatto";
};

// Dati fittizi iniziali (sostituisci con fetch alla tua API)
const SEED: Booking[] = [
  { id: 1, name: "Mario Rossi",    email: "mario@example.com",  datetime: "2025-10-12T15:00:00Z", tattoo: "Drago",   status: "Nuovo" },
  { id: 2, name: "Giulia Bianchi", email: "giulia@example.com", datetime: "2025-10-18T10:30:00Z", tattoo: "Rosa",    status: "Confermato" },
  { id: 3, name: "Luca Verdi",     email: "luca@example.com",   datetime: "2025-11-02T17:15:00Z", tattoo: "Scritta", status: "Fatto" },
];

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>(SEED);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [toDelete, setToDelete] = useState<Booking | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const data = useMemo(() => {
    return bookings.filter((b) => {
      const qok =
        !q ||
        b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.email.toLowerCase().includes(q.toLowerCase()) ||
        b.tattoo.toLowerCase().includes(q.toLowerCase());

      const t = new Date(b.datetime).getTime();
      const f = from ? new Date(from).getTime() : -Infinity;
      const tt = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1 : Infinity;

      return qok && t >= f && t <= tt;
    });
  }, [bookings, q, from, to]);

  function openDeleteModal(b: Booking) {
    setToDelete(b);
    (document.getElementById("delete_modal") as HTMLDialogElement)?.showModal();
  }

  function closeDeleteModal() {
    (document.getElementById("delete_modal") as HTMLDialogElement)?.close();
    setToDelete(null);
  }

  function confirmDelete() {
    if (!toDelete) return;
    // TODO: qui chiamerai la tua API DELETE /api/bookings/:id
    setBookings((prev) => prev.filter((x) => x.id !== toDelete.id));
    closeDeleteModal();
    setToast("Prenotazione cancellata");
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-6">
        <h1 className="font-display text-3xl">Admin prenotazioni</h1>
        <p className="text-base-content/70">Filtra, consulta e gestisci.</p>
      </div>

      {/* Toolbar filtri */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nome, email o tatuaggio..."
          className="input input-bordered bg-base-100/70 w-full sm:w-80"
        />
        <input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="input input-bordered bg-base-100/70 w-44" />
        <input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="input input-bordered bg-base-100/70 w-44" />
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => { setQ(""); setFrom(""); setTo(""); }} className="btn btn-ghost">Reset</button>
          <button type="button" className="btn btn-primary">+ Nuova prenotazione</button>
        </div>
      </div>

      {/* Tabella */}
      <div className="card glass overflow-x-auto">
        <div className="card-body p-0">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Data</th>
                <th>Tatuaggio</th>
                <th className="text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-base-content/60 py-10">
                    Nessuna prenotazione.
                  </td>
                </tr>
              )}

              {data.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-base-content/60">{badge(b.status)}</div>
                  </td>
                  <td>{b.email}</td>
                  <td>{formatDate(b.datetime)}</td>
                  <td>
                    <span className="badge badge-outline border-primary/40 text-primary">{b.tattoo}</span>
                  </td>
                  <td className="text-right space-x-2">
                    <button type="button" className="btn btn-xs btn-outline">Modifica</button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(b)}
                      className="btn btn-xs btn-error"
                    >
                      Cancella
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale conferma cancellazione */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confermi la cancellazione?</h3>
          <p className="py-2 text-base-content/70">
            {toDelete ? (
              <>Stai per cancellare la prenotazione di <b>{toDelete.name}</b> (“{toDelete.tattoo}”).</>
            ) : (
              "Stai per cancellare una prenotazione."
            )}
          </p>
          <div className="modal-action">
            <form method="dialog" className="space-x-2">
              <button type="button" onClick={closeDeleteModal} className="btn">Annulla</button>
              <button type="button" onClick={confirmDelete} className="btn btn-error">Cancella</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Chiudi" />
        </form>
      </dialog>

      {/* Toast */}
      {toast && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
