import { NextRequest, NextResponse } from "next/server";
import {
  searchExactFlights,
  searchFlexibleFlights,
} from "@/lib/serpapi";
import { cityToIata } from "@/lib/iata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originCity,
      destination,
      dateStart,
      dateEnd,
      days,
      flexibleDates,
      flexibleMonth,
      travelersCount,
    } = body;

    const origin = cityToIata(originCity ?? "תל אביב");
    const dest = cityToIata(destination);

    if (flexibleDates && flexibleMonth) {
      const groups = await searchFlexibleFlights(
        origin,
        dest,
        flexibleMonth,
        days ?? 7,
        travelersCount ?? 1
      );
      return NextResponse.json({ flexible: groups, searchedAt: new Date().toISOString() });
    }

    const flights = await searchExactFlights(
      origin,
      dest,
      dateStart,
      dateEnd,
      travelersCount ?? 1,
      days ?? 7
    );
    return NextResponse.json({ exact: flights, searchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Flights error:", err);
    return NextResponse.json({ error: "שגיאה בחיפוש טיסות" }, { status: 500 });
  }
}
