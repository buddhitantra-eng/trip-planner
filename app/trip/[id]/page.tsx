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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-12">
        {/* Plane animation */}
        <div className="relative w-full max-w-lg">
          <div className="relative w-full h-1">
            <div className="absolute inset-0 border-t-2 border-dashed border-secondary/30 rounded-full"></div>
            <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-secondary to-primary w-1/2 rounded-full shadow-[0_0_15px_rgba(83,221,252,0.5)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
              <span className="material-symbols-outlined text-secondary text-3xl transform -rotate-90 drop-shadow-[0_0_10px_rgba(83,221,252,0.8)]">flight</span>
            </div>
          </div>
        </div>
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold font-headline text-on-background animate-pulse">מייצר את הטיול שלך...</h1>
          <p className="text-on-surface-variant">האלגוריתם שלנו בונה עבורך את החוויה המושלמת</p>
        </div>
        {/* Steps */}
        <div className="flex flex-row-reverse justify-between items-center w-full max-w-lg px-2">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(133,173,255,0.4)]">
              <span className="material-symbols-outlined text-on-primary text-xl">check</span>
            </div>
            <span className="text-primary text-sm font-bold">מתכנן מסלול</span>
          </div>
          <div className="flex-1 h-0.5 bg-primary/40 mx-2"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-secondary bg-surface-container-highest flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-secondary/20"></div>
              <span className="material-symbols-outlined text-secondary text-xl">travel_explore</span>
            </div>
            <span className="text-secondary text-sm font-bold">מחפש טיסות</span>
          </div>
          <div className="flex-1 h-0.5 bg-outline-variant mx-2"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">payments</span>
            </div>
            <span className="text-on-surface-variant/40 text-sm font-bold">מחשב עלויות</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm">אם התוכן לא מופיע, <a href="/" className="text-primary underline">חזור לדף הבית</a></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle={form.destination} />
      <TripResults form={form} />
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-5xl animate-pulse">flight</span>
      </div>
    }>
      <TripPageInner />
    </Suspense>
  );
}
