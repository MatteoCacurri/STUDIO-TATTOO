import { NextResponse } from "next/server";
import { getAvailabilityByDay } from "@/lib/availability";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = Number(searchParams.get("artistId"));
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (!artistId || !year || !month) {
    return NextResponse.json({ error: "artistId, year, month sono obbligatori" }, { status: 400 });
  }
  const days = await getAvailabilityByDay(artistId, year, month);
  return NextResponse.json(days);
}
