"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/AuthModal";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <a href="/" className="text-lg font-bold text-white">✈️ מתכנן הטיולים</a>
            {subtitle && <span className="text-sm text-gray-400 mr-3">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <a href="/my-trips" className="text-sm text-gray-400 hover:text-white transition-colors">
                  הטיולים שלי
                </a>
                <div
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                  title={user.email ?? ""}
                  onClick={handleLogout}
                >
                  {(user.email ?? "?")[0].toUpperCase()}
                </div>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAuth(true)}
              >
                התחברות
              </Button>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
