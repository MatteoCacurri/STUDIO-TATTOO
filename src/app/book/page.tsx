"use client";

import { useState } from "react";

export default function BookPage() {
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<null | "ok" | "err">(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setOk(null);

    // TODO: qui aggancia la tua API reale (es. /api/bookings)
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setOk("ok");
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
      <div className="card glass">
        <div className="card-body">
          <h1 className="card-title font-display text-3xl">Prenota</h1>
          <p className="text-base-content/70">Inserisci i tuoi dati e la proposta.</p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
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
              <textarea required name="description" placeholder="Drago giapponese 10cm" className="textarea textarea-bordered bg-base-100/70 h-28" />
              <label className="label"><span className="label-text-alt text-base-content/60">Indicaci zona del corpo e dimensioni (cm).</span></label>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="reset" className="btn btn-ghost">Reset</button>
              <button disabled={sending} className="btn btn-primary">
                {sending ? "Invio..." : "Prenota"}
              </button>
            </div>
          </form>

          {ok === "ok" && (
            <div role="alert" className="alert alert-success mt-4">
              <span>Richiesta inviata! Ti risponderemo via email.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
