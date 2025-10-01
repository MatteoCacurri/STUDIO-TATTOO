import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  artistId: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  datetime: z.string().min(1).optional(),
  tattoo: z.string().min(1).optional(),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "id non valido" }, { status: 400 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { artistId, datetime, ...rest } = parsed.data;
  let when: Date | undefined = undefined;
  if (datetime) when = new Date(datetime);

  if (artistId || when) {
    const current = await prisma.booking.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "booking non trovato" }, { status: 404 });
    const checkArtist = artistId ?? current.artistId;
    const checkWhen = when ?? current.datetime;
    const conflict = await prisma.booking.findFirst({ where: { artistId: checkArtist, datetime: checkWhen, NOT: { id } } });
    if (conflict) return NextResponse.json({ error: "Slot non disponibile per questo artista" }, { status: 409 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { ...(artistId ? { artistId } : {}), ...(when ? { datetime: when } : {}), ...rest },
    include: {
      artist: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "id non valido" }, { status: 400 });
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
