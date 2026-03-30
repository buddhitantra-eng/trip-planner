"use client";
import { useEffect, useState } from "react";
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
      <header className="fixed top-0 w-full z-50 bg-[#060e1f]/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(6,14,31,0.4)]">
        <div className="flex flex-row-reverse justify-between items-center px-6 py-4 w-full max-w-none">
          <div className="flex items-center gap-3">
            <a href="/">
              <span className="text-2xl font-black bg-gradient-to-l from-[#85adff] to-[#53ddfc] bg-clip-text text-transparent font-headline">A.G.S</span>
            </a>
          </div>
          {subtitle && (
            <span className="text-sm text-on-surface-variant font-medium">{subtitle}</span>
          )}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <a href="/my-trips" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">travel_explore</span>
                  הטיולים שלי
                </a>
                <div
                  className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-primary text-sm font-bold cursor-pointer hover:border-primary/50 transition-colors"
                  title={user.email ?? ""}
                  onClick={handleLogout}
                >
                  {(user.email ?? "?")[0].toUpperCase()}
                </div>
              </>
            ) : (
              <button
                className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => setShowAuth(true)}
              >
                <span className="material-symbols-outlined text-sm">person</span>
                התחברות
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
