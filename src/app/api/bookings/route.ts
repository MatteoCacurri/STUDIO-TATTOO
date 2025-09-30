import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  datetime: z.string().min(1), // ISO string
  tattoo: z.string().min(1),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional().default("Nuovo"),
});

// GET /api/bookings → lista tutte le prenotazioni
export async function GET() {
  const rows = await prisma.booking.findMany({
    orderBy: { datetime: "asc" },
  });
  return NextResponse.json(rows);
}

// POST /api/bookings → crea una nuova prenotazione
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { name, email, datetime, tattoo, status } = parsed.data;
  const created = await prisma.booking.create({
    data: {
      name,
      email,
      datetime: new Date(datetime),
      tattoo,
      status,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
