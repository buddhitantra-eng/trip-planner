"use client";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex flex-row-reverse justify-around items-center px-4 pb-6 pt-3 bg-[#0f192f]/60 backdrop-blur-2xl rounded-t-[32px] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <a href="/" className={`flex flex-col items-center justify-center transition-colors ${pathname === "/" ? "text-[#53ddfc] relative after:content-[''] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-[#53ddfc] after:rounded-full" : "text-[#dde5fe]/50 hover:text-[#85adff]"}`}>
        <span className="material-symbols-outlined">home</span>
        <span className="font-label text-[12px] font-medium mt-1">ראשי</span>
      </a>
      <a href="/my-trips" className={`flex flex-col items-center justify-center transition-colors ${pathname === "/my-trips" ? "text-[#53ddfc] relative after:content-[''] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-[#53ddfc] after:rounded-full" : "text-[#dde5fe]/50 hover:text-[#85adff]"}`}>
        <span className="material-symbols-outlined">travel_explore</span>
        <span className="font-label text-[12px] font-medium mt-1">הטיולים שלי</span>
      </a>
      <a href="#" className="flex flex-col items-center justify-center text-[#dde5fe]/50 hover:text-[#85adff] transition-colors">
        <span className="material-symbols-outlined">notifications</span>
        <span className="font-label text-[12px] font-medium mt-1">התראות</span>
      </a>
      <a href="#" className="flex flex-col items-center justify-center text-[#dde5fe]/50 hover:text-[#85adff] transition-colors">
        <span className="material-symbols-outlined">person</span>
        <span className="font-label text-[12px] font-medium mt-1">פרופיל</span>
      </a>
    </nav>
  );
}
