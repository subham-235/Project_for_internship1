"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Radio, UsersRound } from "lucide-react";
import type { Booking } from "@/types/booking";
import { checkInBooking, getBookingById, getQueueSnapshot } from "@/lib/client-storage";

export default function PatientLiveQueue({ booking }: { booking: Booking }) {
  const [current, setCurrent] = useState(booking);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setCurrent(getBookingById(booking.id) ?? booking);
      setNow(Date.now());
    };
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-bookings-change", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("schedula-bookings-change", refresh);
    };
  }, [booking]);

  if (current.status !== "confirmed" && !current.queue) return null;
  const snapshot = getQueueSnapshot(current.id);
  void now;

  const checkIn = () => {
    const updated = checkInBooking(current.id);
    if (!updated) {
      setError("Unable to join the queue. The appointment must be confirmed.");
      return;
    }
    setCurrent(updated);
    setError("");
  };

  if (!current.queue) {
    return (
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="flex items-center gap-2 text-xs font-bold text-blue-900"><Radio size={15} /> Live clinic queue</p><p className="mt-1 text-[11px] leading-5 text-blue-700">Check in to receive a token and live estimated waiting time.</p>{error && <p className="mt-1 text-[10px] font-bold text-rose-600">{error}</p>}</div>
        <button type="button" onClick={checkIn} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Join live queue</button>
      </div>
    );
  }

  if (current.queue.status === "completed") {
    return <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} /> Consultation completed</div>;
  }

  const isActive = current.queue.status === "in_consultation";
  return (
    <div className={`mt-5 overflow-hidden rounded-2xl border ${isActive ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3"><p className="flex items-center gap-2 text-xs font-bold"><span className={`relative flex size-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-blue-600"}`}><span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40" /></span>{isActive ? "Doctor is ready for you" : "You are checked in"}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900">{current.queue.token}</span></div>
      <div className="grid grid-cols-3 divide-x divide-black/5 p-4 text-center">
        <div><UsersRound size={16} className="mx-auto text-blue-600" /><p className="mt-1 text-lg font-black">{isActive ? 0 : snapshot?.peopleAhead ?? 0}</p><p className="text-[9px] font-bold uppercase text-slate-500">Ahead</p></div>
        <div><Clock3 size={16} className="mx-auto text-blue-600" /><p className="mt-1 text-lg font-black">{isActive ? "Now" : `${snapshot?.estimatedWaitMinutes ?? 5}m`}</p><p className="text-[9px] font-bold uppercase text-slate-500">Est. wait</p></div>
        <div><Radio size={16} className="mx-auto text-blue-600" /><p className="mt-1 text-sm font-black capitalize">{current.queue.status.replace("_", " ")}</p><p className="text-[9px] font-bold uppercase text-slate-500">Status</p></div>
      </div>
    </div>
  );
}
