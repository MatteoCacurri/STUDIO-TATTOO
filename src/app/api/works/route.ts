import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = Number(searchParams.get("artistId"));
  const take = Number(searchParams.get("take") ?? "20");
  const where = artistId ? { artistId } : {};
  const works = await prisma.work.findMany({
    where, orderBy: { id: "desc" }, take,
    select: { id: true, artistId: true, title: true, mediaUrl: true }
  });
  return NextResponse.json(works);
}
