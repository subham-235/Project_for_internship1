"use client";

import { Drawer } from "vaul";
import Link from "next/link";
import { CalendarDays, LayoutDashboard, Menu, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, type StoredUser } from "@/lib/client-storage";

export default function MobileQuickActions() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setUser(getCurrentUser()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const portalHref = user?.role === "doctor" ? "/doctor-dashboard" : "/my-appointments";
  const portalLabel = user?.role === "doctor" ? "Doctor workspace" : "My appointments";

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-4 left-4 z-40 grid size-12 place-items-center rounded-2xl border border-white/50 bg-slate-950 text-white shadow-xl shadow-slate-950/20 active:scale-95 md:hidden"
          aria-label="Open quick actions"
        >
          <Menu className="size-5" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[91] rounded-t-[1.75rem] border border-slate-200 bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl outline-none">
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
          <Drawer.Title className="font-heading text-lg font-bold text-slate-950">Quick actions</Drawer.Title>
          <Drawer.Description className="mt-1 text-sm text-slate-500">Move through your care journey without losing your place.</Drawer.Description>
          <div className="mt-5 grid gap-2">
            <Drawer.Close asChild>
              <Link href="/doctors" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-brand"><Search className="size-4" /></span>
                Find a doctor
              </Link>
            </Drawer.Close>
            {user ? (
              <Drawer.Close asChild>
                <Link href={portalHref} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
                  <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-accent">
                    {user.role === "doctor" ? <LayoutDashboard className="size-4" /> : <CalendarDays className="size-4" />}
                  </span>
                  {portalLabel}
                </Link>
              </Drawer.Close>
            ) : (
              <Drawer.Close asChild>
                <Link href="/login" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
                  <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-accent"><UserRound className="size-4" /></span>
                  Sign in to your portal
                </Link>
              </Drawer.Close>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
