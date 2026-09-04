import {
  AlertTriangle,
  CalendarDays,
  CalendarCheck2,
  ClipboardPlus,
  Clock3,
  FlaskConical,
  Goal,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";

import type {
  Booking,
} from "@/types/booking";

import type {
  Prescription,
} from "@/types/prescription";

import {
  formatAppointmentFullDate,
  formatAppointmentTime,
} from "@/lib/appointment-utils";

export default function PrescriptionView({
  booking,
  prescription,
}: {
  booking: Booking;
  prescription: Prescription;
}) {
  const medicines = prescription.medicines?.length
    ? prescription.medicines
    : prescription.medications.map((medicine, index) => ({
        id: `legacy-${index}`,
        name: medicine,
        dosage: "",
        duration: "",
        instructions: "",
      }));

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_12px_35px_rgba(11,19,41,0.06)]">
      <header className="bg-[#0B1329] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329]">
              <ClipboardPlus size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/60">
                Medical prescription
              </p>
              <h2 className="mt-1 text-lg font-bold">Schedula care record</h2>
            </div>
          </div>
          <p className="text-xs text-[#dbeafe]/65">
            Issued {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(prescription.updatedAt ?? prescription.createdAt))}
          </p>
        </div>
      </header>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F8FAFC] p-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <UserRound size={14} /> Patient
            </p>
            <p className="mt-2 font-bold">{booking.patientName}</p>
            <p className="mt-1 text-xs text-[#64748B]">Age {booking.patientAge}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <Stethoscope size={14} /> Prescriber
            </p>
            <p className="mt-2 font-bold">{booking.doctorName}</p>
            <p className="mt-1 text-xs text-[#64748B]">{booking.specialty}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-[#E2E8F0] px-4 py-3 text-xs font-medium text-[#64748B]">
          <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{formatAppointmentFullDate(booking.startsAt)}</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={14} />{formatAppointmentTime(booking.startsAt)}</span>
        </div>

        <section className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Clinical assessment</p>
          <div className="mt-2 rounded-xl bg-[#dbeafe] p-4 text-sm font-semibold leading-6 text-[#0B1329]">
            {prescription.diagnosis}
          </div>
        </section>

        <section className="mt-6">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            <Pill size={14} /> Rx - Medications
          </p>
          <div className="mt-3 space-y-2">
            {medicines.length ? (
              medicines.map((medicine, index) => (
                <div key={medicine.id} className="flex gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">{index + 1}</span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-bold leading-5">{medicine.name}</p>
                    {(medicine.dosage || medicine.duration) && (
                      <p className="mt-1 text-xs font-semibold text-[var(--brand)]">
                        {[medicine.dosage, medicine.duration].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {medicine.instructions && <p className="mt-1 text-xs leading-5 text-[#64748B]">{medicine.instructions}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[#E2E8F0] p-4 text-sm text-[#64748B]">No medications prescribed.</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D96B32]">Care instructions</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#0B1329]">{prescription.notes || "No additional instructions."}</p>
        </section>

        {prescription.carePlan && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/40">
            <div className="border-b border-blue-100 bg-blue-600 px-4 py-4 text-white sm:px-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Published care plan</p><h3 className="mt-1 text-base font-bold">Recovery and follow-up</h3></div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
              <div className="rounded-xl bg-white p-4 sm:col-span-2"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-blue-700"><Goal size={14} /> Treatment goal</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{prescription.carePlan.treatmentGoal}</p></div>
              <div className="rounded-xl bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Self-care instructions</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{prescription.carePlan.selfCareInstructions}</p></div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-rose-700"><AlertTriangle size={14} /> Warning signs</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-rose-900">{prescription.carePlan.warningSigns}</p></div>
              {prescription.carePlan.recommendedTests && <div className="rounded-xl bg-white p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-500"><FlaskConical size={14} /> Recommended tests</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{prescription.carePlan.recommendedTests}</p></div>}
              {(prescription.carePlan.followUpDate || prescription.carePlan.followUpNotes) && <div className="rounded-xl bg-white p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-500"><CalendarCheck2 size={14} /> Follow-up</p>{prescription.carePlan.followUpDate && <p className="mt-2 text-sm font-bold text-blue-700">{new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(`${prescription.carePlan.followUpDate}T12:00:00`))}</p>}<p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{prescription.carePlan.followUpNotes}</p></div>}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
