import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  datetime: z.string().min(1), // ISO string, es: "2025-10-12T15:00"
  tattoo: z.string().min(1),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional().default("Nuovo"),
});

// GET /api/bookings → lista prenotazioni
export async function GET() {
  try {
    const rows = await prisma.booking.findMany({ orderBy: { datetime: "asc" } });
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/bookings ERROR:", err?.message ?? err);
    return NextResponse.json({ error: "DB read error" }, { status: 500 });
  }
}

// POST /api/bookings → crea prenotazione
export async function POST(req: Request) {
  const envDb = process.env.DATABASE_URL; // DEBUG
  let body: unknown = null;

  try {
    body = await req.json();
  } catch {
    console.error("POST /api/bookings: body non JSON");
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    console.error("POST /api/bookings: zod error", parsed.error.flatten());
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { name, email, datetime, tattoo, status } = parsed.data;

  try {
    // DEBUG log chiave
    console.log("POST /api/bookings → about to INSERT", {
      db: envDb,
      name,
      email,
      datetime,
      tattoo,
      status,
    });

    const created = await prisma.booking.create({
      data: {
        name,
        email,
        datetime: new Date(datetime),
        tattoo,
        status,
      },
    });

    console.log("POST /api/bookings → created", created);

    // Ritorniamo l’oggetto creato, utile per verificare lato client
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/bookings DB ERROR:", err?.message ?? err);
    return NextResponse.json({ error: "DB write error" }, { status: 500 });
  }
}
