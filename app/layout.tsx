import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "מתכנן טיולים | Trip Planner",
  description: "תכנן את הטיול המושלם שלך עם AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background font-body text-on-surface antialiased">
        {children}
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
