import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  artistId: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  datetime: z.string().min(1),
  tattoo: z.string().min(1),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional().default("Nuovo"),
});

// GET /api/bookings → lista prenotazioni
export async function GET() {
  try {
    const rows = await prisma.booking.findMany({
      orderBy: { datetime: "asc" },
      include: {
        artist: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GET /api/bookings ERROR:", message);
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

  const { artistId, name, email, datetime, tattoo, status } = parsed.data;
  const when = new Date(datetime);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Datetime non valido" }, { status: 400 });
  }

  try {
    // DEBUG log chiave
    console.log("POST /api/bookings → about to INSERT", {
      db: envDb,
      artistId,
      name,
      email,
      datetime: when.toISOString(),
      tattoo,
      status,
    });

    const conflict = await prisma.booking.findFirst({
      where: { artistId, datetime: when },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Slot non disponibile per questo artista" },
        { status: 409 }
      );
    }

    const created = await prisma.booking.create({
      data: {
        artistId,
        name,
        email,
        datetime: when,
        tattoo,
        status,
      },
      include: {
        artist: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    console.log("POST /api/bookings → created", created);

    // Ritorniamo l’oggetto creato, utile per verificare lato client
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST /api/bookings DB ERROR:", message);
    return NextResponse.json({ error: "DB write error" }, { status: 500 });
  }
}
