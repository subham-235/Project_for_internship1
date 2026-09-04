"use client";

import Calendar from "react-calendar";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, RefreshCcw, Stethoscope, UserRound, X, XCircle } from "lucide-react";
import StatusBadge from "@/components/appointments/StatusBadge";
import type { DoctorSlot } from "@/types/availability";
import type { Booking, BookingStatus } from "@/types/booking";
import { formatAppointmentFullDate, formatAppointmentTime } from "@/lib/appointment-utils";
import { cancelBooking, confirmBooking, rescheduleBooking } from "@/lib/client-storage";
import { toast } from "sonner";
import PatientHealthSnapshot from "@/components/doctor/PatientHealthSnapshot";
import PatientIntakeSummary from "@/components/doctor/PatientIntakeSummary";

const statusOrder: BookingStatus[] = ["confirmed", "pending", "cancelled", "completed", "missed"];

const statusDot: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500",
  pending: "bg-amber-500",
  cancelled: "bg-rose-500",
  completed: "bg-emerald-500",
  missed: "bg-rose-500",
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function PatientScheduleDialog({
  booking,
  bookings,
  slots,
  onClose,
  onUpdated,
}: {
  booking: Booking;
  bookings: Booking[];
  slots: DoctorSlot[];
  onClose: () => void;
  onUpdated: (booking: Booking) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(booking.date);
  const [confirmation, setConfirmation] = useState<{ type: "confirm" } | { type: "cancel" } | { type: "reschedule"; slot: DoctorSlot } | null>(null);
  const [message, setMessage] = useState("");
  const [openedAt] = useState(() => Date.now());

  const isFuture = new Date(booking.startsAt).getTime() > openedAt;
  const canReschedule = booking.status === "confirmed" && isFuture;
  const canCancel = (booking.status === "confirmed" || booking.status === "pending") && isFuture;

  const appointmentsForDay = bookings
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const availableForDay = slots
    .filter((slot) => slot.date === selectedDate && slot.status === "available")
    .sort((a, b) => a.time.localeCompare(b.time));

  const applyAction = () => {
    if (!confirmation) return;

    const updated = confirmation.type === "confirm"
      ? confirmBooking(booking.id)
      : confirmation.type === "cancel"
        ? cancelBooking(booking.id)
        : rescheduleBooking(booking.id, confirmation.slot.id);

    setConfirmation(null);
    if (!updated) {
      setMessage("Unable to update this appointment. Refresh the dashboard and try again.");
      toast.error("Appointment update failed", { description: "Refresh the dashboard and try again." });
      return;
    }

    setSelectedDate(updated.date);
    setMessage(
      confirmation.type === "confirm"
        ? "Appointment confirmed. The patient has been notified."
        : confirmation.type === "cancel"
          ? "Appointment cancelled. The patient has been notified."
          : "New time proposed. The appointment is pending patient approval.",
    );
    if (confirmation.type === "confirm") {
      toast.success("Appointment confirmed", { description: "The patient has been notified of the confirmed visit." });
    } else if (confirmation.type === "cancel") {
      toast.success("Appointment cancelled", { description: "The patient has been notified and the slot was released." });
    } else {
      toast.success("New time sent for approval", { description: "The appointment stays pending until the patient confirms." });
    }
    onUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md sm:p-6" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="patient-schedule-title" onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-3 w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xl sm:my-8">
        <header className="flex items-start justify-between gap-5 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md">{initials(booking.patientName)}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Clinical Patient Profile</p>
              <h2 id="patient-schedule-title" className="font-editorial mt-1 text-2xl font-bold">{booking.patientName}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close patient details" className="grid size-10 place-items-center rounded-xl border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"><X size={19} /></button>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <aside className="border-b border-slate-200 bg-white p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-editorial text-xl font-bold text-slate-900">Patient Details</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} />
                {booking.status === "pending" && (
                  <button type="button" onClick={() => setConfirmation({ type: "confirm" })} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"><CheckCircle2 size={13} /> Confirm</button>
                )}
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex gap-3"><UserRound className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.patientAge} years</dd></div></div>
              <div className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-blue-600" /><div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</dt><dd className="mt-0.5 break-all font-bold text-slate-900">{booking.patientEmail}</dd></div></div>
              <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.patientPhone}</dd></div></div>
              <div className="flex gap-3"><Stethoscope className="mt-0.5 size-4 shrink-0 text-blue-600" /><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visit Type</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.appointmentType ?? "In-person"}</dd></div></div>
            </dl>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason for Visit</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700 font-medium">{booking.reason}</p>
            </div>

            <div className="mt-4">
              <PatientHealthSnapshot booking={booking} compact />
            </div>

            <div className="mt-4">
              <PatientIntakeSummary booking={booking} compact />
            </div>

            <div className="mt-4 rounded-2xl border-2 border-blue-500/80 bg-blue-50/80 p-4">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-900"><CalendarDays size={14} className="text-blue-700" /> Scheduled Slot</p>
              <p className="mt-1.5 text-xs font-bold text-slate-900">{formatAppointmentFullDate(booking.startsAt)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><Clock3 size={13} className="text-blue-700" /> {formatAppointmentTime(booking.startsAt)}</p>
            </div>

            {booking.rescheduleApprovalPending && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <p className="font-bold">Waiting for patient approval</p>
                <p className="mt-1 leading-5 text-[11px] text-amber-800">The proposed time is reserved but will remain pending until the patient confirms.</p>
              </div>
            )}

            {message && <div className={`mt-4 rounded-xl border p-3 text-xs font-semibold ${booking.status === "cancelled" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{message}</div>}

            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button type="button" disabled={!canReschedule} onClick={() => { setSelectedDate(booking.date); setMessage("Choose an available slot from the calendar to propose a new time."); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-50/60 px-4 py-3 text-xs font-bold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"><RefreshCcw size={14} /> Reschedule</button>
              <button type="button" disabled={!canCancel} onClick={() => setConfirmation({ type: "cancel" })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"><XCircle size={14} /> Cancel Visit</button>
            </div>
          </aside>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Schedule Context</p><h3 className="font-editorial mt-1 text-2xl font-bold text-slate-900">Appointment Roster</h3></div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                {statusOrder.map((status) => <span key={status} className="flex items-center gap-1.5 capitalize"><i className={`size-2 rounded-full ${statusDot[status]}`} />{status}</span>)}
                <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-600" />Available</span>
              </div>
            </div>

            <Calendar
              value={new Date(`${selectedDate}T12:00:00`)}
              onClickDay={(date) => setSelectedDate(dateKey(date))}
              locale="en-IN"
              minDetail="month"
              showNeighboringMonth
              className="schedula-calendar mt-6"
              tileClassName={({ date, view }) => view === "month" && dateKey(date) === booking.date ? "schedula-calendar__patient-date" : null}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                const key = dateKey(date);
                const statuses = statusOrder.filter((status) => bookings.some((item) => item.date === key && item.status === status));
                const hasAvailable = slots.some((slot) => slot.date === key && slot.status === "available");
                if (!statuses.length && !hasAvailable) return null;
                return <span className="mt-1 flex justify-center gap-0.5">{statuses.map((status) => <i key={status} className={`size-1.5 rounded-full ${statusDot[status]}`} />)}{hasAvailable && <i className="size-1.5 rounded-full bg-blue-600" />}</span>;
              }}
            />

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Schedule for {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${selectedDate}T12:00:00`))}</h4>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {appointmentsForDay.map((item) => <div key={item.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${item.id === booking.id ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20" : "border-slate-200 bg-white"}`}><div><p className="text-xs font-bold text-slate-900">{item.time}</p><p className="mt-0.5 text-[10px] text-slate-500 font-medium">{item.id === booking.id ? booking.patientName : "Other appointment"}</p></div><StatusBadge status={item.status} /></div>)}
                {availableForDay.map((slot) => <button type="button" disabled={!canReschedule} onClick={() => setConfirmation({ type: "reschedule", slot })} key={slot.id} className="flex items-center justify-between rounded-xl border border-dashed border-blue-400 bg-blue-50/50 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"><div><p className="text-xs font-bold text-blue-900">{slot.time}</p><p className="mt-0.5 text-[10px] text-blue-700">{canReschedule ? "Select to propose this time" : "Open time slot"}</p></div><span className="rounded-full bg-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-900">Available</span></button>)}
                {!appointmentsForDay.length && !availableForDay.length && <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs text-slate-400">No appointments or available slots on this date.</p>}
              </div>
            </div>
          </div>
        </div>

        {confirmation && (
          <div className="border-t border-slate-200 bg-white px-5 sm:px-7">
            <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{confirmation.type === "confirm" ? "Confirm this appointment?" : confirmation.type === "cancel" ? "Cancel this appointment?" : "Propose this new appointment time?"}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{confirmation.type === "confirm" ? "The visit will be marked as confirmed and the patient will be notified immediately." : confirmation.type === "cancel" ? "The slot will be released and the patient will be notified via SMS." : `${confirmation.slot.date} at ${confirmation.slot.time} will be reserved. The patient will receive a notification to confirm.`}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setConfirmation(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Go back</button>
                <button type="button" onClick={applyAction} className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${confirmation.type === "confirm" ? "bg-emerald-600 hover:bg-emerald-700" : confirmation.type === "cancel" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"}`}>{confirmation.type === "confirm" ? "Yes, confirm" : confirmation.type === "cancel" ? "Yes, cancel" : "Send for approval"}</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
