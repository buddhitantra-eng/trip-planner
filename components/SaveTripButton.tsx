"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import type { TripFormData } from "@/types";

interface SaveTripButtonProps {
  form: TripFormData;
  tripData: unknown;
  shareToken?: string;
}

export default function SaveTripButton({ form, tripData, shareToken }: SaveTripButtonProps) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSave() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("trips").insert({
        user_id: user.id,
        share_token: shareToken ?? crypto.randomUUID(),
        status: "ready",
        destination: form.destination,
        budget_ils: form.budgetIls,
        date_start: form.dateStart,
        date_end: form.dateEnd,
        flexible_dates: form.flexibleDates,
        travelers_count: form.travelers.count,
        travelers_type: form.travelers.type,
        age_range_min: parseInt(form.travelers.ageRange.split("-")[0]) || 18,
        age_range_max: parseInt(form.travelers.ageRange.split("-")[1]) || 99,
        interests: form.travelers.interests,
        origin_city: form.originCity,
        itinerary: tripData,
      });
      if (error) throw error;
      setSaved(true);
      toast.success("הטיול נשמר! 🎉");
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/trip/${shareToken ?? ""}`;
    navigator.clipboard.writeText(url);
    toast.success("קישור הועתק! 🔗");
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || saved}
          className={`flex-1 ${saved ? "bg-green-700" : "bg-blue-600 hover:bg-blue-500"}`}
        >
          {saved ? "✅ נשמר!" : saving ? "שומר..." : "💾 שמור טיול"}
        </Button>
        {shareToken && (
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            🔗 שתף
          </Button>
        )}
      </div>
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleSave}
      />
    </>
  );
}
