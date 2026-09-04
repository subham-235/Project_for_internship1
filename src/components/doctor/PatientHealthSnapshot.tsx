import { Activity, AlertTriangle, HeartPulse, Pill, ShieldAlert, UserRound } from "lucide-react";
import type { Booking } from "@/types/booking";

function display(value?: string) {
  return value?.trim() || "Not provided";
}

export default function PatientHealthSnapshot({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const profile = booking.patientProfile;

  if (!profile) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">No health profile shared</p><p className="mt-1 text-[11px] leading-5 text-slate-500">This booking was created without a saved patient health profile.</p></div>;
  }

  const clinicalItems = [
    { label: "Blood group", value: display(profile.bloodGroup), icon: HeartPulse, tone: "text-rose-600 bg-rose-50" },
    { label: "Height / weight", value: profile.heightCm || profile.weightKg ? `${profile.heightCm || "-"} cm / ${profile.weightKg || "-"} kg` : "Not provided", icon: Activity, tone: "text-blue-600 bg-blue-50" },
    { label: "Medical conditions", value: display(profile.medicalConditions), icon: ShieldAlert, tone: "text-amber-700 bg-amber-50" },
    { label: "Allergies", value: display(profile.allergies), icon: AlertTriangle, tone: "text-orange-700 bg-orange-50" },
    { label: "Current medications", value: display(profile.currentMedications), icon: Pill, tone: "text-violet-700 bg-violet-50" },
    { label: "Gender / DOB", value: `${display(profile.gender)} / ${display(profile.dateOfBirth)}`, icon: UserRound, tone: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Shared health profile</p><h4 className="mt-1 text-sm font-bold text-slate-900">Clinical information</h4></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">Booking snapshot</span></div>
      <div className={`mt-4 grid gap-2.5 ${compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {clinicalItems.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex min-w-0 gap-2.5 rounded-xl bg-slate-50 p-3"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}><Icon size={15} /></span><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-[11px] font-semibold leading-4 text-slate-800">{value}</p></div></div>)}
      </div>
      {(profile.emergencyContactName || profile.emergencyContactPhone) && <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2.5"><p className="text-[9px] font-bold uppercase tracking-wide text-rose-700">Emergency contact</p><p className="mt-1 text-[11px] font-semibold text-slate-800">{display(profile.emergencyContactName)} · {display(profile.emergencyContactRelation)} · {display(profile.emergencyContactPhone)}</p></div>}
      <p className="mt-3 text-[9px] leading-4 text-slate-400">Captured when the appointment was booked. Confirm critical information directly with the patient before clinical decisions.</p>
    </section>
  );
}
