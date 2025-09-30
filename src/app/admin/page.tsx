"use client";

import { useMemo, useState, useEffect } from "react";

type Booking = {
  id: number;
  name: string;
  email: string;
  datetime: string; // ISO
  tattoo: string;
  status: "Nuovo" | "Confermato" | "Fatto";
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
        b.tattoo.toLowerCase().includes(q.toLowerCase());
      const dok =
        (!from || new Date(b.datetime) >= new Date(from)) &&
        (!to || new Date(b.datetime) <= new Date(to));
      return qok && dok;
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

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Data/Ora</th>
              <th>Tatuaggio</th>
              <th>Status</th>
              <th className="text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.name}</td>
                <td className="truncate max-w-[16ch]">{b.email}</td>
                <td>{formatDate(b.datetime)}</td>
                <td className="truncate max-w-[24ch]">{b.tattoo}</td>
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
                <td colSpan={7} className="text-center py-10 text-base-content/60">
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
