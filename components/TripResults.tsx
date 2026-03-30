"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import type { TripFormData } from "@/types";
import FlightResults from "@/components/FlightResults";
import SaveTripButton from "@/components/SaveTripButton";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

interface TripData {
  summary: string;
  highlights: string[];
  topRestaurants: string[];
  totalAttractions: number;
  costRange: { min: number; max: number };
  days: DayData[];
  costBreakdown: CostBreakdownData;
  localTips: string[];
  weatherNote?: string;
  bestTimeToVisit?: string;
}

interface DayData {
  dayNumber: number;
  date: string;
  theme: string;
  morning: Slot;
  afternoon: Slot;
  evening: Slot;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
}

interface Slot {
  activity: string;
  description: string;
  duration: string;
  costIls: number;
  tip?: string;
}

interface Meal {
  name: string;
  costPerPersonIls: number;
  tier: "mid" | "luxury";
}

interface CostBreakdownData {
  accommodation: {
    central: { name: string; perNightIls: number; rooms: number; totalIls: number };
    budget: { name: string; perNightIls: number; rooms: number; totalIls: number };
  };
  food: {
    midRange: { perPersonPerDayIls: number; totalIls: number };
    luxury: { perPersonPerDayIls: number; totalIls: number };
  };
  activities: { perPersonPerDayIls: number; totalIls: number };
  transport: { perPersonPerDayIls: number; totalIls: number };
  combos: {
    budgetMid: number;
    budgetLuxury: number;
    centralMid: number;
    centralLuxury: number;
  };
}

function fmt(n: number) {
  return n.toLocaleString("he-IL");
}

export default function TripResults({ form }: { form: TripFormData }) {
  const [raw, setRaw] = useState("");
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    async function generate() {
      try {
        const res = await fetch("/api/generate-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("שגיאת שרת");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setRaw(accumulated);
        }

        // Parse JSON from accumulated response
        const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setTrip(parsed);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה לא ידועה");
      } finally {
        setLoading(false);
      }
    }

    generate();
  }, [form]);

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-400">{error}</p>
        <p className="text-gray-500 text-sm mt-2">בדוק שמפתח GROQ_API_KEY מוגדר ב-.env.local</p>
      </div>
    );
  }

  if (loading || !trip) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl animate-bounce">✈️</div>
        <h2 className="text-xl font-bold text-white">מייצר את הטיול שלך...</h2>
        <p className="text-gray-400 text-sm">
          AI מתכנן מסלול מותאם אישית ל{form.destination}
        </p>
        {raw && (
          <div className="max-w-lg mx-auto mt-6 p-4 bg-gray-900 rounded-lg text-right">
            <p className="text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-wrap line-clamp-6">
              {raw.slice(-300)}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 pb-16">

      {/* Summary Card */}
      <Card className="bg-blue-900/30 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🗺️ {form.destination} · {form.days} ימים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-200">{trip.summary}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-blue-800/50 rounded-full px-3 py-1 text-blue-200">
              🏛️ {trip.totalAttractions} אטרקציות
            </span>
            <span className="bg-blue-800/50 rounded-full px-3 py-1 text-blue-200">
              👥 {form.travelers.count} נוסעים
            </span>
            <span className="bg-blue-800/50 rounded-full px-3 py-1 text-blue-200">
              💰 ₪{fmt(trip.costRange.min)}–₪{fmt(trip.costRange.max)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-1">✨ הייליייטס</p>
            <ul className="space-y-1">
              {trip.highlights?.map((h, i) => (
                <li key={i} className="text-sm text-gray-200">• {h}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-1">🍽️ מסעדות מומלצות</p>
            <div className="flex flex-wrap gap-2">
              {trip.topRestaurants?.map((r, i) => (
                <span key={i} className="text-xs bg-gray-800 rounded px-2 py-1 text-gray-300">{r}</span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Itinerary */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">📅 מסלול יום-יום</h2>
        {trip.days?.map((day) => (
          <Card key={day.dayNumber} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">
                יום {day.dayNumber} — {day.theme}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "🌅 בוקר", slot: day.morning },
                { label: "☀️ צהריים", slot: day.afternoon },
                { label: "🌙 ערב", slot: day.evening },
              ].map(({ label, slot }) => (
                <div key={label} className="border-r-2 border-blue-700 pr-3">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-white">{slot?.activity}</p>
                  <p className="text-xs text-gray-400">{slot?.description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>⏱ {slot?.duration}</span>
                    <span>₪{fmt(slot?.costIls ?? 0)}</span>
                  </div>
                  {slot?.tip && (
                    <p className="text-xs text-amber-400 mt-1">💡 {slot.tip}</p>
                  )}
                </div>
              ))}

              {/* Meals */}
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2 font-medium">🍴 ארוחות</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  {[
                    { label: "בוקר", meal: day.meals?.breakfast },
                    { label: "צהריים", meal: day.meals?.lunch },
                    { label: "ערב", meal: day.meals?.dinner },
                  ].map(({ label, meal }) => (
                    <div key={label} className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400">{label}</p>
                      <p className="text-white font-medium truncate">{meal?.name}</p>
                      <p className="text-green-400">₪{fmt(meal?.costPerPersonIls ?? 0)}</p>
                      {meal?.tier === "luxury" && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">💰 פירוט עלויות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Accommodation */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">🏨 לינה</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">מרכזי / תיירותי</p>
                <p className="text-white font-medium text-sm">{trip.costBreakdown?.accommodation?.central?.name}</p>
                <p className="text-green-400 text-sm">₪{fmt(trip.costBreakdown?.accommodation?.central?.perNightIls ?? 0)} / לילה</p>
                <p className="text-gray-400 text-xs">סה"כ: ₪{fmt(trip.costBreakdown?.accommodation?.central?.totalIls ?? 0)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">לא-מרכזי / תקציבי</p>
                <p className="text-white font-medium text-sm">{trip.costBreakdown?.accommodation?.budget?.name}</p>
                <p className="text-green-400 text-sm">₪{fmt(trip.costBreakdown?.accommodation?.budget?.perNightIls ?? 0)} / לילה</p>
                <p className="text-gray-400 text-xs">סה"כ: ₪{fmt(trip.costBreakdown?.accommodation?.budget?.totalIls ?? 0)}</p>
              </div>
            </div>
          </div>

          {/* Food */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">🍽️ אוכל ({form.days} ימים × {form.travelers.count} נוסעים)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">רגיל</p>
                <p className="text-white text-sm">₪{fmt(trip.costBreakdown?.food?.midRange?.perPersonPerDayIls ?? 0)} / נוסע / יום</p>
                <p className="text-green-400 text-sm font-bold">₪{fmt(trip.costBreakdown?.food?.midRange?.totalIls ?? 0)} סה"כ</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">⭐ יוקרתי</p>
                <p className="text-white text-sm">₪{fmt(trip.costBreakdown?.food?.luxury?.perPersonPerDayIls ?? 0)} / נוסע / יום</p>
                <p className="text-green-400 text-sm font-bold">₪{fmt(trip.costBreakdown?.food?.luxury?.totalIls ?? 0)} סה"כ</p>
              </div>
            </div>
          </div>

          {/* Activities & Transport */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">🎟️ פעילויות</p>
              <p className="text-green-400 font-bold">₪{fmt(trip.costBreakdown?.activities?.totalIls ?? 0)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">🚌 תחבורה</p>
              <p className="text-green-400 font-bold">₪{fmt(trip.costBreakdown?.transport?.totalIls ?? 0)}</p>
            </div>
          </div>

          {/* Combo totals */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">📊 סה"כ לפי קומבינציה</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "תקציבי + רגיל", key: "budgetMid" as const },
                { label: "תקציבי + יוקרתי", key: "budgetLuxury" as const },
                { label: "מרכזי + רגיל", key: "centralMid" as const },
                { label: "מרכזי + יוקרתי ⭐", key: "centralLuxury" as const },
              ].map(({ label, key }) => (
                <div key={key} className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-gray-400">{label}</p>
                  <p className="text-white font-bold">₪{fmt(trip.costBreakdown?.combos?.[key] ?? 0)}</p>
                  <p className="text-gray-500">₪{fmt(Math.round((trip.costBreakdown?.combos?.[key] ?? 0) / form.travelers.count))} לנוסע</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local Tips */}
      {trip.localTips?.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">💡 טיפים מקומיים</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {trip.localTips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-300">• {tip}</li>
              ))}
            </ul>
            {trip.weatherNote && (
              <p className="text-sm text-blue-300 mt-3">🌤️ {trip.weatherNote}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save + Share */}
      <SaveTripButton form={form} tripData={trip} />

      {/* Flights */}
      <FlightResults form={form} />

      {/* Map */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">🗺️ מפה אינטראקטיבית</CardTitle>
        </CardHeader>
        <CardContent>
          <TripMap
            center={[48.8566, 2.3522]}
            markers={
              trip.days?.flatMap((day) =>
                [day.morning, day.afternoon, day.evening]
                  .filter((s) => s?.activity)
                  .map((s, i) => ({
                    lat: 48.8566 + (Math.random() - 0.5) * 0.05,
                    lng: 2.3522 + (Math.random() - 0.5) * 0.05,
                    name: s.activity,
                    description: s.description,
                  }))
              ) ?? []
            }
          />
        </CardContent>
      </Card>

    </div>
  );
}
