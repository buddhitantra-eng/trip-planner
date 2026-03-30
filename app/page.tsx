import TripForm from "@/components/TripForm";
import AppHeader from "@/components/AppHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background bg-starfield">
      <AppHeader />

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-6 text-center">
        <h1 className="text-3xl font-extrabold font-headline text-on-background mb-2">
          תכנן את הטיול המושלם שלך
        </h1>
        <p className="text-on-surface-variant">
          AI יבנה לך מסלול יומי מלא עם טיסות, מפה ופירוט עלויות — תוך שניות
        </p>
      </div>

      {/* Form */}
      <TripForm />
    </div>
  );
}
