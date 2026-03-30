"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TravelerType, AgeRange, Interest, TripFormData } from "@/types";

const INTERESTS: { value: Interest; label: string }[] = [
  { value: "attractions", label: "🏛️ אטרקציות ואתרים" },
  { value: "nightlife", label: "🎉 חיי לילה" },
  { value: "food", label: "🍽️ אוכל ומסעדות" },
  { value: "nature", label: "🌿 טבע וטיולים" },
  { value: "shopping", label: "🛍️ קניות" },
  { value: "culture", label: "🎭 תרבות ומוזיאונים" },
  { value: "beach", label: "🏖️ חוף וים" },
  { value: "adventure", label: "🧗 אקסטרים והרפתקאות" },
];

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() + i + 1);
  d.setDate(1);
  return {
    value: d.toISOString().slice(0, 7),
    label: d.toLocaleDateString("he-IL", { month: "long", year: "numeric" }),
  };
});

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

const today = new Date().toISOString().slice(0, 10);
const defaultStart = addDays(today, 30);

export default function TripForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Core date state: startDate + days are source of truth
  const [startDate, setStartDate] = useState(defaultStart);
  const [days, setDays] = useState(7);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [flexibleMonth, setFlexibleMonth] = useState(MONTHS[0].value);

  // Other form fields
  const [destination, setDestination] = useState("");
  const [originCity, setOriginCity] = useState("תל אביב");
  const [budgetIls, setBudgetIls] = useState(8000);
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelersType, setTravelersType] = useState<TravelerType>("couple");
  const [ageRange, setAgeRange] = useState<AgeRange>("25-35");
  const [interests, setInterests] = useState<Interest[]>(["attractions", "food"]);

  // Derived end date
  const endDate = addDays(startDate, days - 1);

  const handleStartDateChange = useCallback(
    (val: string) => {
      setStartDate(val);
      // keep days the same → endDate auto-updates via derived value
    },
    []
  );

  const handleEndDateChange = useCallback(
    (val: string) => {
      if (val >= startDate) {
        setDays(diffDays(startDate, val) + 1);
      }
    },
    [startDate]
  );

  const handleDaysChange = useCallback((val: number | readonly number[]) => {
    const v = Array.isArray(val) ? val[0] : val;
    setDays(v as number);
  }, []);

  const toggleInterest = useCallback((interest: Interest) => {
    setInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 4) return prev;
      return [...prev, interest];
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) return;
    setSubmitting(true);

    const formData: TripFormData = {
      destination: destination.trim(),
      originCity,
      budgetIls,
      dateStart: flexibleDates ? `${flexibleMonth}-01` : startDate,
      dateEnd: flexibleDates ? `${flexibleMonth}-28` : endDate,
      days,
      flexibleDates,
      flexibleMonth: flexibleDates ? flexibleMonth : undefined,
      travelers: {
        count: travelersCount,
        type: travelersType,
        ageRange,
        interests,
      },
    };

    try {
      sessionStorage.setItem("tripForm", JSON.stringify(formData));
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.tripId) {
        router.push(`/trip/${data.tripId}`);
      }
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto px-4 pb-12">

      {/* Section 1: Destination & Budget */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">✈️ יעד ותקציב</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">לאן טסים?</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="לאן טסים? (למשל: פריז, טוקיו, ניו יורק)"
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-right"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">עיר מוצא</Label>
            <Input
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="עיר מוצא (למשל: תל אביב)"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-right"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">
              תקציב כולל: ₪{budgetIls.toLocaleString("he-IL")}
            </Label>
            <Input
              type="number"
              value={budgetIls}
              onChange={(e) => setBudgetIls(Number(e.target.value))}
              min={1000}
              max={500000}
              step={500}
              className="bg-gray-800 border-gray-700 text-white text-right"
            />
            <p className="text-xs text-gray-500">תקציב לכל הנוסעים ביחד</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Travelers */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">👥 נוסעים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">מספר נוסעים</Label>
              <Input
                type="number"
                value={travelersCount}
                onChange={(e) => setTravelersCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                min={1}
                max={10}
                className="bg-gray-800 border-gray-700 text-white text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">סוג נוסע</Label>
              <Select value={travelersType} onValueChange={(v) => setTravelersType(v as TravelerType)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="solo">יחיד/ה</SelectItem>
                  <SelectItem value="couple">זוג</SelectItem>
                  <SelectItem value="family">משפחה עם ילדים</SelectItem>
                  <SelectItem value="friends">קבוצת חברים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">טווח גילאים</Label>
            <Select value={ageRange} onValueChange={(v) => setAgeRange(v as AgeRange)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="18-25">18–25</SelectItem>
                <SelectItem value="25-35">25–35</SelectItem>
                <SelectItem value="35-50">35–50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
                <SelectItem value="mixed">גילאים מעורבים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Interests */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">🎯 מה רוצים לעשות?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-3">בחרו עד 4 תחומי עניין</p>
          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map(({ value, label }) => {
              const checked = interests.includes(value);
              const disabled = !checked && interests.length >= 4;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "bg-blue-900/40 border-blue-600"
                      : disabled
                      ? "border-gray-700 opacity-40 cursor-not-allowed"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => !disabled && toggleInterest(value)}
                    className="border-gray-600"
                  />
                  <span className="text-sm text-gray-200">{label}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Dates */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">📅 תאריכים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">תאריכים גמישים</Label>
            <Switch
              checked={flexibleDates}
              onCheckedChange={setFlexibleDates}
            />
          </div>

          {flexibleDates ? (
            <div className="space-y-2">
              <Label className="text-gray-300">באיזה חודש?</Label>
              <Select value={flexibleMonth} onValueChange={(v) => v && setFlexibleMonth(v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">משך הטיול</Label>
                  <span className="text-blue-400 font-semibold">{days} ימים</span>
                </div>
                <Slider
                  value={[days]}
                  onValueChange={handleDaysChange}
                  min={1}
                  max={14}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>יום 1</span>
                  <span>14 ימים</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">תאריך יציאה</Label>
                  <Input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">תאריך חזרה</Label>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {days} לילות · {new Date(startDate).toLocaleDateString("he-IL")} – {new Date(endDate).toLocaleDateString("he-IL")}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={submitting || !destination.trim() || interests.length === 0}
        className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
      >
        {submitting ? "⏳ מכין את הטיול שלך..." : "✈️ תכננו לי טיול!"}
      </Button>
    </form>
  );
}
