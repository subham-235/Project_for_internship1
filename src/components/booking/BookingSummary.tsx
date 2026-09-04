import type { Doctor } from "@/types/doctor";
import { ShieldCheck } from "lucide-react";

export default function BookingSummary({ doctor, date, time }: { doctor: Doctor; date: string; time: string }) {
  const formattedDate = date
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`))
    : "Select a date";

  return (
    <aside className="h-fit rounded-xl border border-[var(--line)] bg-white p-6 soft-shadow lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Appointment summary</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)]">{doctor.initials}</span>
        <div><p className="font-semibold">{doctor.name}</p><p className="text-sm text-[var(--muted)]">{doctor.specialty}</p></div>
      </div>
      <dl className="mt-6 space-y-4 text-sm">
        <div><dt className="text-[var(--muted)]">Date</dt><dd className="mt-1 font-medium">{formattedDate}</dd></div>
        <div><dt className="text-[var(--muted)]">Time</dt><dd className="mt-1 font-medium">{time || "Select a slot"}</dd></div>
        <div><dt className="text-[var(--muted)]">Location</dt><dd className="mt-1 font-medium">{doctor.location}</dd></div>
        <div className="border-t border-[var(--line)] pt-4"><dt className="text-[var(--muted)]">Total payable</dt><dd className="mt-1 text-xl font-semibold">₹{doctor.fee}</dd><p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700"><ShieldCheck size={13} /> Secure demo checkout</p></div>
      </dl>
    </aside>
  );
}
