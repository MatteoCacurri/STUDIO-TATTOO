"use client";

import { useState } from "react";

export default function BookPage() {
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<null | "ok" | "err">(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setOk(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const datetime = String(data.get("datetime") || "");
    const description = String(data.get("description") || "");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          datetime,            // l’API converte in Date
          tattoo: description, // mapping: description -> tattoo (schema Prisma)
          status: "Nuovo",
        }),
      });
      if (!res.ok) throw new Error("POST /api/bookings failed");
      setOk("ok");
      form.reset();
    } catch (err) {
      console.error(err);
      setOk("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-bold mb-6">Prenota il tuo tatuaggio</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Nome e cognome</span></label>
          <input required name="name" placeholder="Mario Rossi" className="input input-bordered bg-base-100/70" />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Email</span></label>
          <input required type="email" name="email" placeholder="mario@example.com" className="input input-bordered bg-base-100/70" />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Data e ora</span></label>
          <input required type="datetime-local" name="datetime" className="input input-bordered bg-base-100/70" />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label"><span className="label-text">Descrizione</span></label>
          <textarea required name="description" placeholder="Descrivi il tatuaggio che vuoi fare" className="textarea textarea-bordered bg-base-100/70 h-28" />
          <label className="label"><span className="label-text-alt text-content/60">Indicaci zona del corpo e dimensioni (cm).</span></label>
        </div>

        <div className="sm:col-span-2 flex justify-end gap-3">
          <button type="reset" className="btn btn-ghost">Reset</button>
          <button type="submit" disabled={sending} className="btn btn-primary">
            {sending ? "Invio..." : "Invia prenotazione"}
          </button>
        </div>
      </form>

      {ok === "ok" && <div className="alert alert-success mt-6">Richiesta inviata! Ti ricontatteremo a breve.</div>}
      {ok === "err" && <div className="alert alert-error mt-6">Errore durante l’invio. Riprova.</div>}
    </main>
  );
}
