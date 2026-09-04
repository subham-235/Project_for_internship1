"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Play, Radio, Stethoscope, UsersRound } from "lucide-react";
import type { Booking } from "@/types/booking";
import { completeQueueConsultation, getQueueSnapshot, startBookingConsultation } from "@/lib/client-storage";

export default function DoctorLiveQueue({ bookings, onRefresh }: { bookings: Booking[]; onRefresh: () => void }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => onRefresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-bookings-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("schedula-bookings-change", refresh);
    };
  }, [onRefresh]);

  const queue = bookings
    .filter((booking) => booking.queue && booking.queue.status !== "completed")
    .sort((a, b) => new Date(a.queue!.checkedInAt).getTime() - new Date(b.queue!.checkedInAt).getTime());
  const active = queue.find((booking) => booking.queue?.status === "in_consultation");
  const waiting = queue.filter((booking) => booking.queue?.status === "waiting");

  const start = (booking: Booking) => {
    if (startBookingConsultation(booking.id)) onRefresh();
  };

  const finish = (booking: Booking) => {
    if (!completeQueueConsultation(booking.id)) return;
    onRefresh();
    router.push(`/doctor-dashboard/prescriptions?bookingId=${booking.id}&create=1`);
  };

  return (
    <section className="rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_8px_24px_rgba(11,19,41,0.04)]">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700"><Radio size={14} /> Live clinic queue</p><h2 className="mt-1 text-lg font-bold text-slate-900">Waiting room</h2><p className="mt-1 text-xs text-slate-500">Queue positions and patient ETAs update automatically.</p></div>
        <div className="flex gap-2"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">{waiting.length} waiting</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">{active ? "1 in consultation" : "Room ready"}</span></div>
      </header>

      {active && (
        <div className="m-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:m-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-600 text-white"><Stethoscope size={19} /></span><div><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">In consultation · {active.queue?.token}</p><p className="mt-1 font-bold text-slate-900">{active.patientName}</p><p className="mt-0.5 text-xs text-slate-600">{active.reason}</p></div></div><button type="button" onClick={() => finish(active)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white hover:bg-blue-700">Complete & create care plan <ArrowRight size={15} /></button></div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {waiting.map((booking, index) => {
          const snapshot = getQueueSnapshot(booking.id);
          return <div key={booking.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">{booking.queue?.token}</span><div><p className="text-sm font-bold text-slate-900">{booking.patientName}</p><p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500"><span className="inline-flex items-center gap-1"><UsersRound size={12} /> {snapshot?.peopleAhead ?? index} ahead</span><span className="inline-flex items-center gap-1"><Clock3 size={12} /> About {snapshot?.estimatedWaitMinutes ?? 5} min</span><span>{booking.appointmentType}</span></p></div><button type="button" disabled={Boolean(active) || index !== 0} onClick={() => start(booking)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"><Play size={14} /> Start consultation</button></div>;
        })}
        {!waiting.length && !active && <div className="px-5 py-10 text-center"><Radio size={24} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No patients checked in</p><p className="mt-1 text-xs text-slate-400">Confirmed patients appear here after joining the live queue.</p></div>}
      </div>
    </section>
  );
}
