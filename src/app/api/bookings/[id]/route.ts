import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const UpdateSchema = z.object({
  artistId: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  datetime: z.string().min(1).optional(),
  tattoo: z.string().min(1).optional(),
  phone: z.string().min(6).max(32).optional(),
  skinTone: z.string().min(1).optional().or(z.literal(null)),
  bodyImage: z.string().min(1).optional().or(z.literal(null)),
  references: z.array(z.string()).optional(),
  palette: z.enum(["BIANCO_NERO", "COLORI"]).optional(),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional(),
});

function resolveUploadPath(filePath: string | null) {
  if (!filePath || !filePath.startsWith("/uploads/")) return null;
  const relative = filePath.replace(/^\//, "");
  return path.join(process.cwd(), "public", relative);
}

async function deleteFileIfExists(filePath: string | null) {
  const absolute = resolveUploadPath(filePath);
  if (!absolute) return;
  try {
    await unlink(absolute);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("DELETE /api/bookings file cleanup error", absolute, err);
    }
  }
}

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
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "booking non trovato" }, { status: 404 });

  await prisma.booking.delete({ where: { id } });

  await deleteFileIfExists(booking.bodyImage);
  if (Array.isArray(booking.references)) {
    for (const ref of booking.references) {
      await deleteFileIfExists(ref);
    }
  }

  return NextResponse.json({ ok: true });
}
