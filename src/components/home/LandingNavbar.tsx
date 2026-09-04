"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  LogOut,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

import { clearCurrentUser, getCurrentUser, type StoredUser } from "@/lib/client-storage";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Find Doctors", href: "/doctors" },
  { label: "Specialties", href: "/#specialties" },
  { label: "Clinical Journey", href: "/#how-it-works" },
  { label: "For Clinicians", href: "/#for-everyone" },
];

export default function LandingNavbar() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setUser(getCurrentUser()), 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logout = () => {
    clearCurrentUser();
    setUser(null);
    setMobileOpen(false);
  };

  const portalHref = user?.role === "doctor" ? "/doctor-dashboard" : "/my-appointments";

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
      {/* Top Clinical Announcement Bar */}
      <div className="border-b border-blue-900/10 bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] font-medium sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              450+ Verified Specialists On-Duty
            </span>
            <span className="hidden items-center gap-1.5 text-slate-300 md:inline-flex">
              <ShieldCheck size={13} className="text-blue-400" />
              NABH & HIPAA Compliant Healthcare
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-1 text-slate-300 hover:text-white sm:flex">
              <MapPin size={12} className="text-cyan-400" />
              <span>Kolkata, WB</span>
            </div>
            <a
              href="tel:1800724338"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-300 transition hover:text-white"
            >
              <PhoneCall size={12} />
              <span>24/7 Hotline: 1800-SCHEDULA</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Navbar */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/90 shadow-[0_4px_24px_-2px_rgba(11,19,41,0.06)] backdrop-blur-md"
            : "border-slate-200/50 bg-white/70 backdrop-blur-sm"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled ? "h-16" : "h-18"
          }`}
        >
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Schedula home">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-sm shadow-blue-700/20 transition-transform group-hover:scale-105">
                <Stethoscope size={20} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-2xl leading-none tracking-tight text-slate-900">
                  Schedula<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Clinical Care
                </span>
              </div>
            </Link>

            <nav
              className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex"
              aria-label="Primary navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3.5 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              <Search size={13} className="text-blue-600" />
              <span>Search Doctors</span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                ⌘K
              </kbd>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={portalHref}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-bold text-blue-900 transition hover:bg-blue-100/80"
                >
                  <CalendarDays size={14} className="text-blue-700" />
                  {user.role === "doctor" ? "Doctor Workspace" : "My Appointments"}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Log out"
                  className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/doctors"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-700/25 transition hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
            >
              <span>Book Appointment</span>
              <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 bg-white shadow-xl md:hidden"
            >
              <nav className="space-y-1 px-4 py-4" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href={portalHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-800"
                  >
                    <CalendarDays size={16} /> Open Care Portal
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/doctors"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-blue-600/30"
                >
                  Book Instant Appointment
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
