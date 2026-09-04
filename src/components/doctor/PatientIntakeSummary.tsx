import { AlertCircle, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import type { Booking } from "@/types/booking";

export default function PatientIntakeSummary({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const intake = booking.intake;

  if (!intake) {
    return (
      <section className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
        <p className="flex items-center gap-2 text-xs font-bold text-amber-900"><AlertCircle size={15} /> Specialty intake incomplete</p>
        <p className="mt-1 text-[11px] leading-5 text-amber-800">The patient has not submitted the pre-visit questionnaire yet.</p>
      </section>
    );
  }

  const severityTone = intake.severity === "severe" ? "bg-rose-100 text-rose-700" : intake.severity === "moderate" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-blue-700"><ClipboardList size={14} /> Specialty intake</p><h4 className="mt-1 text-sm font-bold text-slate-900">{intake.specialty} pre-visit summary</h4></div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700"><CheckCircle2 size={11} /> Completed</span>
      </div>

      <div className={`mt-4 grid gap-2.5 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div className="rounded-xl bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Primary concern</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-800">{intake.primaryConcern}</p></div>
        <div className="rounded-xl bg-white p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Duration and severity</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-800">{intake.symptomDuration}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${severityTone}`}>{intake.severity}</span></div></div>
        {intake.answers.map((answer) => <div key={answer.questionId} className="rounded-xl bg-white p-3"><p className="text-[9px] font-bold uppercase leading-4 tracking-wide text-slate-400">{answer.label}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-800">{answer.value}</p></div>)}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[9px] text-slate-400"><Clock3 size={11} /> Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(intake.completedAt))}</p>
    </section>
  );
}
