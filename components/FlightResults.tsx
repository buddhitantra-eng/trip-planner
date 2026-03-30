"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TripFormData } from "@/types";
import type { FlightResult, WeeklyGroup } from "@/lib/serpapi";

function fmt(n: number) {
  return n.toLocaleString("he-IL");
}

function durationLabel(mins: number) {
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
}

export default function FlightResults({ form }: { form: TripFormData }) {
  const [exact, setExact] = useState<FlightResult[]>([]);
  const [flexible, setFlexible] = useState<WeeklyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/flights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originCity: form.originCity,
            destination: form.destination,
            dateStart: form.dateStart,
            dateEnd: form.dateEnd,
            days: form.days,
            flexibleDates: form.flexibleDates,
            flexibleMonth: form.flexibleMonth,
            travelersCount: form.travelers.count,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.exact) setExact(data.exact);
        if (data.flexible) setFlexible(data.flexible);
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה בחיפוש טיסות");
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [form]);

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-8 text-center">
          <p className="text-gray-400 animate-pulse">✈️ מחפש טיסות...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-1">בדוק שמפתח SERPAPI_KEY מוגדר</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">✈️ טיסות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Exact date results */}
        {exact.length > 0 && exact.map((f, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{f.airline}</span>
              <div className="text-left">
                <p className="text-green-400 font-bold text-lg">₪{fmt(f.totalPriceIls)}</p>
                <p className="text-gray-400 text-xs">₪{fmt(f.pricePerPersonIls)} לאדם</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span>{f.departureTime}</span>
              <span className="text-gray-500">→</span>
              <span>{f.arrivalTime}</span>
              <span className="text-gray-500 text-xs">⏱ {durationLabel(f.durationMinutes)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${f.stops === 0 ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                {f.stops === 0 ? "ישיר" : `${f.stops} עצירות`}
              </span>
            </div>
            {f.bookingUrl && (
              <a
                href={`https://www.google.com/flights?q=${form.originCity}+to+${form.destination}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button size="sm" variant="outline" className="w-full text-xs border-gray-600 text-gray-300 hover:text-white">
                  הזמן טיסה ↗
                </Button>
              </a>
            )}
          </div>
        ))}

        {/* Flexible date results */}
        {flexible.length > 0 && flexible.map((week) => (
          <div
            key={week.weekNumber}
            className={`rounded-lg border p-4 space-y-2 ${
              week.isCheapest ? "border-green-600 bg-green-900/20" : "border-gray-700 bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{week.label}</p>
                {week.isCheapest && (
                  <span className="text-xs text-green-400">✅ הכי זול!</span>
                )}
              </div>
              {week.avgPricePerPersonIls > 0 ? (
                <div className="text-left">
                  <p className="text-green-400 font-bold">₪{fmt(week.avgPricePerPersonIls)}</p>
                  <p className="text-gray-400 text-xs">ממוצע לאדם</p>
                  <p className="text-gray-300 text-xs">₪{fmt(week.avgPricePerPersonIls * form.travelers.count)} סה"כ</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">אין תוצאות</p>
              )}
            </div>

            {week.flights.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400"
                onClick={() => setExpanded(expanded === week.weekNumber ? null : week.weekNumber)}
              >
                {expanded === week.weekNumber ? "▲ הסתר" : `▼ ${week.flights.length} אפשרויות`}
              </Button>
            )}

            {expanded === week.weekNumber && (
              <div className="space-y-2 pt-1">
                {week.flights.map((f, i) => (
                  <div key={i} className="bg-gray-700/50 rounded p-2 text-sm flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{f.airline}</p>
                      <p className="text-gray-400 text-xs">{f.departureDate} · {f.stops === 0 ? "ישיר" : `${f.stops} עצירות`}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-green-400">₪{fmt(f.totalPriceIls)}</p>
                      <p className="text-gray-400 text-xs">₪{fmt(f.pricePerPersonIls)} לאדם</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {exact.length === 0 && flexible.length === 0 && (
          <p className="text-gray-400 text-center py-4">לא נמצאו טיסות. הוסף SERPAPI_KEY ל-.env.local</p>
        )}
      </CardContent>
    </Card>
  );
}
