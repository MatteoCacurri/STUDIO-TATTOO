import { prisma } from "@/lib/prisma";

// Orari default: 10:00-18:00, slot da 60 minuti, Lun-Sab
const START_HOUR = 10;
const END_HOUR = 18;
const SLOT_MINUTES = 60;
const WORKING_DAYS = new Set([1,2,3,4,5,6]); // lun-sab

export async function getAvailabilityByDay(artistId: number, year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const next = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  const bookings = await prisma.booking.findMany({
    where: { artistId, datetime: { gte: first, lt: next } },
    orderBy: { datetime: "asc" }
  });

  const bookedISO = new Set(bookings.map(b => b.datetime.toISOString()));
  const days: Record<string, string[]> = {};
  for (let d = new Date(first); d < next; d.setUTCDate(d.getUTCDate() + 1) ) {
    const dow = d.getUTCDay();
    if (!WORKING_DAYS.has(dow)) continue;

    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;

    const slots: string[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const slot = new Date(Date.UTC(y, d.getUTCMonth(), d.getUTCDate(), h, 0, 0));
      const iso = slot.toISOString();
      if (!bookedISO.has(iso)) slots.push(iso);
    }
    if (slots.length) days[key] = slots;
  }
  return days;
}

