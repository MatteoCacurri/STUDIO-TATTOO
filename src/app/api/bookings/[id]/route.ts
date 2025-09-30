import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// DELETE /api/bookings/:id → elimina prenotazione
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  await prisma.booking.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

// PATCH /api/bookings/:id → aggiorna prenotazione
const PatchSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  datetime: z.string().optional(),
  tattoo: z.string().optional(),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { datetime, ...rest } = parsed.data;
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      ...rest,
      ...(datetime ? { datetime: new Date(datetime) } : {}),
    },
  });

  return NextResponse.json(updated);
}
