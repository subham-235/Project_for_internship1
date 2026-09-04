"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  LogOut,
  Menu,
  Stethoscope,
  X,
} from "lucide-react";

import { clearCurrentUser, getCurrentUser, type StoredUser } from "@/lib/client-storage";

const navItems = [
  { label: "Find Doctors", href: "/doctors" },
  { label: "Specialties", href: "/#specialties" },
  { label: "How It Works", href: "/#how-it-works" },
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
      {}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl"
            : "border-slate-200/70 bg-white/90 backdrop-blur-lg"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled ? "h-16" : "h-[72px]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-10">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Schedula home">
              <div className="grid size-10 place-items-center rounded-full bg-[var(--brand)] text-white shadow-sm shadow-blue-700/20 transition-transform group-hover:rotate-[-7deg] group-hover:scale-105">
                <Stethoscope size={20} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-2xl leading-none tracking-tight text-[var(--foreground)]">
                  Schedula<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Clinical Care
                </span>
              </div>
            </Link>

            <nav
              className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex"
              aria-label="Primary navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 transition hover:bg-white hover:text-[var(--foreground)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={portalHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--brand)]"
                >
                  <CalendarDays size={14} className="text-blue-700" />
                  {user.role === "doctor" ? "Workspace" : "Appointments"}
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
                className="rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-white hover:text-slate-900"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/doctors"
              className="brand-shimmer group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-xs font-bold text-white shadow-sm shadow-blue-700/25 transition hover:-translate-y-0.5 hover:bg-[var(--brand-deep)] hover:shadow-md"
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
            className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-slate-700 shadow-sm md:hidden"
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
