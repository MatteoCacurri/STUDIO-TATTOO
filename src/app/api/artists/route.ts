import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const artists = await prisma.artist.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, bio: true, avatarUrl: true, instagramUrl: true }
  });
  return NextResponse.json(artists);
}
