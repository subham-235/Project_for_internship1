import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import PatientChatbot from "@/components/chat/PatientChatbot";
import AppMotionShell from "@/components/motion/AppMotionShell";
import AppProviders from "@/components/providers/AppProviders";
import MobileQuickActions from "@/components/layout/MobileQuickActions";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Schedula | Clinical Appointment & Healthcare Platform",
  description:
    "Instant, verified doctor appointments across top hospital networks. Book in-clinic or video consultations with board-certified specialists.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="clinical-theme min-h-full flex flex-col font-sans">
        <AppProviders>
          <AppMotionShell>{children}</AppMotionShell>
          <PatientChatbot />
          <MobileQuickActions />
        </AppProviders>
      </body>
    </html>
  );
}
