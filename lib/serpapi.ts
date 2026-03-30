export interface FlightResult {
  airline: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  durationMinutes: number;
  pricePerPersonIls: number;
  totalPriceIls: number;
  bookingUrl: string;
  departureDate: string;
  returnDate: string;
}

export interface WeeklyGroup {
  weekNumber: number;
  label: string; // e.g. "שבוע 1 (1–7 אוגוסט)"
  dateRange: string;
  avgPricePerPersonIls: number;
  cheapestDate: string;
  flights: FlightResult[];
  isCheapest: boolean;
}

export interface FlightSearchResult {
  exact?: FlightResult[];
  flexible?: WeeklyGroup[];
  searchedAt: string;
}

async function searchFlights(
  origin: string,
  destination: string,
  outboundDate: string,
  returnDate: string,
  travelers: number
): Promise<FlightResult[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY חסר");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", origin);
  url.searchParams.set("arrival_id", destination);
  url.searchParams.set("outbound_date", outboundDate);
  url.searchParams.set("return_date", returnDate);
  url.searchParams.set("currency", "ILS");
  url.searchParams.set("hl", "he");
  url.searchParams.set("api_key", key);
  if (travelers > 1) url.searchParams.set("adults", String(travelers));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  const data = await res.json();

  const rawFlights = data.best_flights ?? data.other_flights ?? [];
  return rawFlights.slice(0, 5).map((f: Record<string, unknown>) => {
    const legs = (f.flights as Record<string, unknown>[]) ?? [];
    const first = legs[0] ?? {};
    const last = legs[legs.length - 1] ?? {};
    const pricePerPerson = (f.price as number) ?? 0;
    return {
      airline: (first.airline as string) ?? "לא ידוע",
      departureTime: (first.departure_airport as Record<string, unknown>)?.time as string ?? "",
      arrivalTime: (last.arrival_airport as Record<string, unknown>)?.time as string ?? "",
      stops: legs.length - 1,
      durationMinutes: (f.total_duration as number) ?? 0,
      pricePerPersonIls: pricePerPerson,
      totalPriceIls: pricePerPerson * travelers,
      bookingUrl: (f.booking_token as string) ?? "",
      departureDate: outboundDate,
      returnDate,
    };
  });
}

export async function searchExactFlights(
  origin: string,
  destination: string,
  outboundDate: string,
  returnDate: string,
  travelers: number,
  tripDays: number
): Promise<FlightResult[]> {
  const results: FlightResult[] = [];

  // Main search
  try {
    const main = await searchFlights(origin, destination, outboundDate, returnDate, travelers);
    results.push(...main);
  } catch {
    // continue
  }

  // +3 days cheaper option
  try {
    const alt = addDaysToDate(outboundDate, 3);
    const altReturn = addDaysToDate(alt, tripDays);
    const nearby = await searchFlights(origin, destination, alt, altReturn, travelers);
    results.push(...nearby.slice(0, 2));
  } catch {
    // continue
  }

  return results.sort((a, b) => a.pricePerPersonIls - b.pricePerPersonIls);
}

export async function searchFlexibleFlights(
  origin: string,
  destination: string,
  month: string, // "2026-08"
  tripDays: number,
  travelers: number
): Promise<WeeklyGroup[]> {
  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const heMonths: Record<number, string> = {
    1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
    5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
    9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר",
  };
  const monthName = heMonths[mon] ?? String(mon);

  const weeks = [
    { num: 1, start: 1, end: 7 },
    { num: 2, start: 8, end: 14 },
    { num: 3, start: 15, end: 21 },
    { num: 4, start: 22, end: daysInMonth },
  ];

  const groups: WeeklyGroup[] = [];

  for (const week of weeks) {
    const outDate = `${month}-${String(week.start).padStart(2, "0")}`;
    const retDate = addDaysToDate(outDate, tripDays);
    let flights: FlightResult[] = [];
    try {
      flights = await searchFlights(origin, destination, outDate, retDate, travelers);
    } catch {
      // leave empty
    }

    const avg =
      flights.length > 0
        ? Math.round(flights.reduce((s, f) => s + f.pricePerPersonIls, 0) / flights.length)
        : 0;

    groups.push({
      weekNumber: week.num,
      label: `שבוע ${week.num} (${week.start}–${week.end} ${monthName})`,
      dateRange: `${week.start}–${week.end} ${monthName}`,
      avgPricePerPersonIls: avg,
      cheapestDate: flights[0]?.departureDate ?? outDate,
      flights: flights.slice(0, 3),
      isCheapest: false,
    });
  }

  // Mark cheapest non-zero week
  const nonZero = groups.filter((g) => g.avgPricePerPersonIls > 0);
  if (nonZero.length > 0) {
    const min = Math.min(...nonZero.map((g) => g.avgPricePerPersonIls));
    const cheapest = groups.find((g) => g.avgPricePerPersonIls === min);
    if (cheapest) cheapest.isCheapest = true;
  }

  return groups;
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
