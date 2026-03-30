import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-50 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
