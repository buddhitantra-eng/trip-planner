import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function MyTripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: trips } = await supabase
    .from("trips")
    .select("id, destination, date_start, date_end, budget_ils, travelers_count, status, share_token, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <AppHeader subtitle="הטיולים שלי" />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">הטיולים שלי</h1>

        {!trips || trips.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🗺️</div>
            <p className="text-gray-400">עדיין אין טיולים שמורים</p>
            <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              תכנן טיול חדש ←
            </a>
          </div>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold text-lg">{trip.destination}</h2>
                    <p className="text-gray-400 text-sm">
                      {trip.date_start && new Date(trip.date_start).toLocaleDateString("he-IL")}
                      {" – "}
                      {trip.date_end && new Date(trip.date_end).toLocaleDateString("he-IL")}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {trip.travelers_count} נוסעים · תקציב ₪{trip.budget_ils?.toLocaleString("he-IL")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <a
                      href={`/trip/${trip.id}`}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      צפה בטיול
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/trip/${trip.id}`)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      🔗 שתף
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
