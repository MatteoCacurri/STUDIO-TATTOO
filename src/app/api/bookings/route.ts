import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const CreateSchema = z.object({
  artistId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6).max(32),
  datetime: z.string().min(1),
  tattoo: z.string().min(1),
  skinTone: z.string().min(1).optional(),
  palette: z.enum(["BIANCO_NERO", "COLORI"]).optional().default("COLORI"),
  status: z.enum(["Nuovo", "Confermato", "Fatto"]).optional().default("Nuovo"),
});

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

async function ensureUploadsDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function saveUploadedFile(file: File, prefix: string, dir: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.type && !file.type.startsWith("image/")) return null;

  const baseName = randomUUID();
  const providedExt = path.extname(file.name || "").toLowerCase();
  const fallbackExt = EXTENSION_BY_MIME[file.type] ?? "";
  const ext = providedExt || fallbackExt || ".bin";
  const fileName = `${prefix}-${baseName}${ext}`;
  const destination = path.join(dir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(destination, Buffer.from(arrayBuffer));

  return path.posix.join("/uploads", fileName);
}

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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    console.error("POST /api/bookings: formData error", err);
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const extractString = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const rawPayload = {
    artistId: extractString("artistId"),
    name: extractString("name"),
    email: extractString("email"),
    phone: extractString("phone"),
    datetime: extractString("datetime"),
    tattoo: extractString("tattoo"),
    skinTone: extractString("skinTone") || undefined,
    palette: extractString("palette") || undefined,
    status: extractString("status") || undefined,
  };

  const parsed = CreateSchema.safeParse(rawPayload);
  if (!parsed.success) {
    console.error("POST /api/bookings: zod error", parsed.error.flatten());
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { artistId, name, email, phone, datetime, tattoo, skinTone, palette, status } = parsed.data;
  const when = new Date(datetime);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Datetime non valido" }, { status: 400 });
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await ensureUploadsDir(uploadsDir);

    const bodyImageFile = formData.get("bodyImage");
    const referenceFiles = formData
      .getAll("referenceImages")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, 5);

    const bodyImagePath = bodyImageFile instanceof File
      ? await saveUploadedFile(bodyImageFile, "body", uploadsDir)
      : null;

    const referenceImagePaths: string[] = [];
    for (const entry of referenceFiles) {
      const stored = await saveUploadedFile(entry, "reference", uploadsDir);
      if (stored) referenceImagePaths.push(stored);
    }

    // DEBUG log chiave
    console.log("POST /api/bookings → about to INSERT", {
      db: envDb,
      artistId,
      name,
      email,
      phone,
      datetime: when.toISOString(),
      tattoo,
      skinTone,
      palette,
      bodyImagePath,
      referenceImagePaths,
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
        phone,
        datetime: when,
        tattoo,
        skinTone,
        palette,
        bodyImage: bodyImagePath,
        references: referenceImagePaths,
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
