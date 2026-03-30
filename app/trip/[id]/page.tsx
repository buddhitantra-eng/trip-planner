"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TripResults from "@/components/TripResults";
import AppHeader from "@/components/AppHeader";
import type { TripFormData } from "@/types";

function TripPageInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<TripFormData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("tripForm");
    if (raw) {
      try {
        setForm(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">✈️</div>
          <p className="text-white text-xl font-bold">טוען...</p>
          <p className="text-gray-500 text-sm">אם התוכן לא מופיע, <a href="/" className="text-blue-400 underline">חזור לדף הבית</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AppHeader subtitle={form.destination} />
      <TripResults form={form} />
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-5xl animate-pulse">✈️</div>
      </div>
    }>
      <TripPageInner />
    </Suspense>
  );
}
