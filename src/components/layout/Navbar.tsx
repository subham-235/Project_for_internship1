"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, LogOut, Menu, Stethoscope, User, X } from "lucide-react";
import { clearCurrentUser, getCurrentUser, type StoredUser } from "@/lib/client-storage";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setUser(getCurrentUser()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const logout = () => {
    clearCurrentUser();
    setUser(null);
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-sm shadow-blue-700/20 transition-transform group-hover:scale-105">
            <Stethoscope size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-xl font-bold tracking-tight text-slate-900">
              Schedula<span className="text-blue-600">.</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
              Clinical Portal
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/doctors"
            className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Find Doctors
          </Link>
          {user?.role === "patient" && (
            <>
              <Link
                href="/my-appointments"
                className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Appointments
              </Link>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Health Profile
              </Link>
            </>
          )}
          {user?.role === "doctor" && (
            <Link
              href="/doctor-dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-blue-800 transition hover:bg-blue-100"
            >
              <CalendarDays size={14} /> Clinical Workspace
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user?.role === "patient" && <NotificationBell user={user} />}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 sm:inline-flex">
                <User size={13} className="text-blue-600" />
                {user.name.split(" ")[0]}
              </span>
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
              className="hidden rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/doctors"
              className="brand-shimmer hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-700/20 transition hover:from-blue-700 hover:to-blue-800 sm:block"
          >
            Book Appointment
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0, y: reduceMotion ? 0 : -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: reduceMotion ? 0 : -6 }}
          className="overflow-hidden border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <Link
            href="/doctors"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          {user?.role === "patient" && (
            <>
              <Link
                href="/my-appointments"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Appointments
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Health Profile
              </Link>
            </>
          )}
          {user?.role === "doctor" && (
            <Link
              href="/doctor-dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"
            >
              Clinical Workspace
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log Out
            </button>
          )}
        </motion.nav>
      )}
      </AnimatePresence>
    </motion.header>
  );
}
