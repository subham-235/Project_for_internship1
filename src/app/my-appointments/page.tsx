"use client";


import Link from "next/link";
import { motion } from "framer-motion";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  RefreshCcw,
  Star,
  Stethoscope,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";

import StatusBadge from "@/components/appointments/StatusBadge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PatientLiveQueue from "@/components/appointments/PatientLiveQueue";

import type { Booking } from "@/types/booking";

import type { Prescription } from "@/types/prescription";

import {
  approveRescheduledBooking,
  getBookingsForPatient,
  getCurrentUser,
  getPrescriptionByBookingId,
  getReviewByBookingId,
  saveDoctorReview,
} from "@/lib/client-storage";

import {
  formatAppointmentFullDate,
  formatAppointmentTime,
} from "@/lib/appointment-utils";

import {
  downloadPrescriptionPdf,
} from "@/lib/prescription-pdf";

type Tab = "upcoming" | "completed" | "cancelled" | "missed";

export default function MyAppointmentsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [tab, setTab] = useState<Tab>("upcoming");

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    const user = getCurrentUser();

    if (!user) {
      router.replace("/login");

      return;
    }

    if (user.role !== "patient") {
      router.replace("/doctor-dashboard");

      return;
    }

    setBookings(getBookingsForPatient(user.id, user.email));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const syncPatientRecords = () => {
      load();
      setSelectedPrescription((current) =>
        current ? getPrescriptionByBookingId(current.bookingId) : null,
      );
    };

    window.addEventListener("focus", syncPatientRecords);
    window.addEventListener("storage", syncPatientRecords);

    return () => {
      window.removeEventListener("focus", syncPatientRecords);
      window.removeEventListener("storage", syncPatientRecords);
    };
  }, [load]);

  const visible = useMemo(
    () =>
      bookings.filter((booking) => {
        if (tab === "upcoming") {
          return booking.status === "pending" || booking.status === "confirmed";
        }

        if (tab === "cancelled") return booking.status === "cancelled";
        if (tab === "missed") return booking.status === "missed";

        return booking.status === tab;
      }),
    [bookings, tab],
  );

  const downloadPrescription = (
    booking: Booking,
    prescription: Prescription,
  ) => {
    downloadPrescriptionPdf(
      booking,
      prescription,
    );
  };

  const submitReview = () => {
    if (!reviewBooking) {
      return;
    }

    const user = getCurrentUser();

    if (!user) {
      return;
    }

    const success = saveDoctorReview({
      id: `review-${Date.now()}`,

      bookingId: reviewBooking.id,

      doctorId: reviewBooking.doctorId,

      patientId: user.id,

      patientName: user.name,

      patientEmail: user.email,

      rating,

      comment: comment.trim(),

      createdAt: new Date().toISOString(),
    });

    if (success) {
      setMessage("Thank you. Your review has been submitted.");
      toast.success("Review published", { description: "The doctor’s live rating has been updated." });

      setReviewBooking(null);

      setComment("");

      setRating(5);

      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("You have already reviewed this appointment.");
      toast.error("Review already submitted", { description: "Each completed appointment can be reviewed once." });
    }
  };

  const approveNewTime = (booking: Booking) => {
    const user = getCurrentUser();

    if (!user || (booking.patientId && booking.patientId !== user.id)) {
      setMessage("Unable to approve this appointment.");
      toast.error("Approval failed", { description: "Please sign in again and retry." });
      return;
    }

    const updated = approveRescheduledBooking(booking.id);
    setMessage(
      updated
        ? "New appointment time approved. Your appointment is now confirmed."
        : "Unable to approve the new time. Please refresh and try again.",
    );
    if (updated) {
      toast.success("New time confirmed", { description: `${formatAppointmentFullDate(updated.startsAt)} at ${formatAppointmentTime(updated.startsAt)}` });
    } else {
      toast.error("Could not approve the new time", { description: "Refresh the page and try again." });
    }
    load();
  };

  const tabs: Tab[] = ["upcoming", "completed", "cancelled", "missed"];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-[var(--line)] bg-[var(--ivory)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Patient Portal
            </p>

            <h1 className="font-editorial mt-3 text-4xl tracking-tight sm:text-5xl">
              My Appointments
            </h1>

            <p className="mt-3 text-sm text-[var(--muted)]">
              Manage upcoming visits and access completed appointment
              information.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {message && (
            <div className="mb-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#C9362D]">
              {message}
            </div>
          )}

          <div className="flex flex-wrap border-b border-[var(--line)]">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`relative px-4 py-3 text-sm font-semibold capitalize ${
                  tab === item
                    ? "text-[var(--brand)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[var(--brand)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {visible.length > 0 ? (
              visible.map((booking) => {
                const prescription = getPrescriptionByBookingId(booking.id);

                const review = getReviewByBookingId(booking.id);

                return (
                  <article
                    key={booking.id}
                    className="rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-5 transition hover:border-[var(--brand-soft)] sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Stethoscope size={22} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold">
                              {booking.doctorName}
                            </h2>

                            <StatusBadge status={booking.status} />
                          </div>

                          <p className="mt-1 text-sm text-[var(--brand)]">
                            {booking.specialty}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />

                              {formatAppointmentFullDate(booking.startsAt)}
                            </span>

                            <span>
                              {formatAppointmentTime(booking.startsAt)}
                            </span>

                            <span>
                              {booking.appointmentType ?? "In-person"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <Link
                          href={`/my-appointments/${booking.id}/intake`}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${booking.intake ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white shadow-sm shadow-blue-600/20"}`}
                        >
                          <ClipboardList size={16} />
                          {booking.intake ? "Review intake" : "Complete intake"}
                        </Link>
                      )}

                      {booking.status === "completed" && (
                        <div className="flex flex-wrap gap-2">
                          {prescription ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPrescription(prescription)
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2.5 text-xs font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                              >
                                <FileText size={15} />
                                View Prescription
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  downloadPrescription(booking, prescription)
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2.5 text-xs font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                              >
                                <Download size={15} />
                                Download PDF
                              </button>
                            </>
                          ) : null}

                          {!review ? (
                            <button
                              type="button"
                              onClick={() => setReviewBooking(booking)}
                              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2.5 text-xs font-semibold hover:border-[#dbeafe] hover:text-[#D96B32]"
                            >
                              <Star size={15} />
                              Review Doctor
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-[#F8FAFC] px-3 py-2.5 text-xs font-semibold text-[#D96B32]">
                              <Star size={14} fill="currentColor" />
                              Reviewed
                            </span>
                          )}

                          <Link
                            href={`/booking/${booking.doctorId}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-xs font-semibold text-white"
                          >
                            <RefreshCcw size={15} />
                            Rebook
                          </Link>
                        </div>
                      )}

                      {booking.status === "pending" &&
                        booking.rescheduleApprovalPending && (
                          <button
                            type="button"
                            onClick={() => approveNewTime(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#237A45] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1C6338]"
                          >
                            <CheckCircle2 size={16} />
                            Approve new time
                          </button>
                        )}
                    </div>

                    {booking.status === "pending" &&
                      booking.rescheduleApprovalPending && (
                        <div className="mt-5 rounded-xl border border-[#E8CF68] bg-[#FFF8D9] px-4 py-3 text-sm text-[#6D5700]">
                          <strong>Doctor proposed a new time.</strong> Review the date and time above, then approve it to confirm your appointment.
                        </div>
                      )}

                    <PatientLiveQueue booking={booking} />

                    {booking.status === "completed" && (
                      <div
                        className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                          prescription
                            ? "border-[#dbeafe] bg-[#F8FAFC] text-[#C9362D]"
                            : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                        }`}
                      >
                        {prescription
                          ? "Prescription available"
                          : "Prescription Not Available"}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--line)] bg-white p-12 text-center">
                <CalendarDays size={28} className="mx-auto text-[#E2E8F0]" />

                <p className="mt-4 font-semibold">No {tab} appointments</p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Appointments matching this category will appear here.
                </p>

                {tab === "upcoming" && (
                  <Link
                    href="/doctors"
                    className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Find a doctor
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {selectedPrescription && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand)]">
                    Prescription
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {selectedPrescription.doctorName}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPrescription(null)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold"
                >
                  Close
                </button>
              </div>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">Diagnosis</dt>

                  <dd className="mt-1 font-medium">
                    {selectedPrescription.diagnosis}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">Medications</dt>

                  <dd className="mt-2">
                    {selectedPrescription.medications.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPrescription.medications.map(
                          (medicine, index) => (
                            <li
                              key={`${medicine}-${index}`}
                              className="rounded-lg bg-[#F8FAFC] px-3 py-2 font-medium"
                            >
                              {index + 1}. {medicine}
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <span className="text-[var(--muted)]">
                        No medications listed.
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">Advice</dt>

                  <dd className="mt-1 font-medium">
                    {selectedPrescription.notes || "No additional advice."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <Modal
          open={Boolean(reviewBooking)}
          onOpenChange={(open) => { if (!open) setReviewBooking(null); }}
          title={reviewBooking ? `Review ${reviewBooking.doctorName}` : "Review your doctor"}
          description="Share your experience from this completed appointment. Your rating updates the doctor’s profile and dashboard."
          className="max-w-md"
        >
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Your rating</legend>
            <div className="mt-3 flex gap-1.5" aria-label={`${rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((item) => (
                <motion.button
                  key={item}
                  type="button"
                  whileHover={{ y: -3, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setRating(item)}
                  className="rounded-lg p-1 text-amber-500 focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label={`Rate ${item} star${item === 1 ? "" : "s"}`}
                >
                  <Star size={30} fill={item <= rating ? "currentColor" : "none"} />
                </motion.button>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Optional comment</span>
            <textarea
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What went well?"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setReviewBooking(null)}>Cancel</Button>
            <Button type="button" onClick={submitReview}>Submit review</Button>
          </div>
        </Modal>
      </main>
    </>
  );
}
