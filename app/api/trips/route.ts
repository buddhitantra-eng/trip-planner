import { NextRequest, NextResponse } from "next/server";
import type { TripFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: TripFormData = await req.json();

    if (!body.destination?.trim()) {
      return NextResponse.json({ error: "יעד נדרש" }, { status: 400 });
    }

    // TODO: save to Supabase once DB is set up
    // For now return a mock trip ID
    const tripId = crypto.randomUUID();

    return NextResponse.json({ tripId, shareToken: crypto.randomUUID() });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
