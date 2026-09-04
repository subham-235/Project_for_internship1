"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { CircleCheck, Clock3, FileText, OctagonAlert, X } from "lucide-react";

import Navbar from "@/components/layout/Navbar";

import type { Booking, BookingStatus } from "@/types/booking";

import { getLatestBooking } from "@/lib/client-storage";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* =========================================
   DATE
========================================= */

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(`${date}T00:00:00`));
}

/* =========================================
   DATE + TIME
========================================= */

function displayDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/* =========================================
   STATUS LABEL
========================================= */

function getStatusLabel(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";

    default:
      return status;
  }
}

/* =========================================
   STATUS STYLE
========================================= */

function getStatusStyle(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "missed":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";
  }
}

/* =========================================
   PAGE CONTENT
========================================= */

function getPageContent(status: BookingStatus) {
  switch (status) {
    case "pending":
      return {
        eyebrow: "Appointment request submitted",

        title: "Waiting for doctor confirmation",

        description:
          "Your appointment request has been submitted successfully. The selected slot is reserved while the doctor reviews your request.",

        pdfTitle: "Appointment Request Receipt",

        pdfSubtitle:
          "This appointment request is currently awaiting confirmation from the doctor.",

        button: "Download booking receipt",
      };

    case "confirmed":
      return {
        eyebrow: "Booking confirmed",

        title: "Appointment confirmed",

        description:
          "Your doctor has confirmed the appointment. Please keep your appointment information for your records.",

        pdfTitle: "Appointment Confirmation",

        pdfSubtitle: "Your appointment has been confirmed by the doctor.",

        button: "Download confirmation PDF",
      };

    case "completed":
      return {
        eyebrow: "Appointment completed",

        title: "Consultation completed",

        description:
          "Your consultation has been completed. You can continue to My Appointments to check your prescription, review the doctor or book another visit.",

        pdfTitle: "Completed Appointment Record",

        pdfSubtitle: "This consultation has been completed.",

        button: "Download appointment record",
      };

    case "cancelled":
      return {
        eyebrow: "Appointment cancelled",

        title: "Appointment cancelled",

        description:
          "This appointment has been cancelled. The reserved slot has been released and you may book another available appointment.",

        pdfTitle: "Cancelled Appointment Record",

        pdfSubtitle: "This appointment has been cancelled.",

        button: "Download appointment record",
      };

    case "missed":
      return {
        eyebrow: "Appointment missed",

        title: "Appointment marked as missed",

        description:
          "This appointment has been marked as missed. You can book another available slot with the doctor.",

        pdfTitle: "Missed Appointment Record",

        pdfSubtitle: "This appointment has been marked as missed.",

        button: "Download appointment record",
      };
  }
}

/* =========================================
   PAGE
========================================= */

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);

  const [pdfLoading, setPdfLoading] = useState(false);

  /* =========================================
     REFRESH BOOKING
  ========================================= */

  const refreshBooking = useCallback(() => {
    const latest = getLatestBooking();

    setBooking(latest);

    setLoading(false);
  }, []);

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    refreshBooking();
  }, [refreshBooking]);

  /* =========================================
     REFRESH WHEN WINDOW RETURNS TO FOCUS

     Example:
     Doctor confirms in another tab →
     patient returns here →
     status becomes Confirmed.
  ========================================= */

  useEffect(() => {
    const handleFocus = () => {
      refreshBooking();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "schedula-bookings" ||
        event.key === "schedula-latest-booking-id"
      ) {
        refreshBooking();
      }
    };

    window.addEventListener("focus", handleFocus);

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);

      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshBooking]);

  /* =========================================
     PDF
  ========================================= */

  const downloadConfirmationPdf = async () => {
    if (!booking) {
      return;
    }

    setPdfLoading(true);

    try {
      const statusLabel = getStatusLabel(booking.status);

      const pageContent = getPageContent(booking.status);

      /* =====================================
           QR DATA
        ===================================== */

      const qrDetails = [
        "SCHEDULA APPOINTMENT",

        "",

        `Appointment ID: ${booking.id}`,

        `Status: ${statusLabel.toUpperCase()}`,

        `Patient: ${booking.patientName}`,

        `Patient Email: ${booking.patientEmail}`,

        `Patient Phone: ${booking.patientPhone}`,

        `Doctor: ${booking.doctorName}`,

        `Specialty: ${booking.specialty}`,

        `Appointment Type: ${booking.appointmentType ?? "In-person"}`,

        `Date: ${displayDate(booking.date)}`,

        `Time: ${booking.time}`,

        `Location: ${booking.doctorLocation ?? "Schedula Clinic"}`,

        `Consultation Fee: INR ${booking.fee}`,

        `Reason: ${booking.reason}`,
      ].join("\n");

      const qrImage = await QRCode.toDataURL(qrDetails, {
        width: 500,

        margin: 1,
      });

      /* =====================================
           CREATE PDF
        ===================================== */

      const pdf = new jsPDF({
        orientation: "portrait",

        unit: "mm",

        format: "a4",
      });

      const PAGE_WIDTH = 210;

      const LEFT = 16;

      const RIGHT = 194;

      /* =====================================
           HEADER
        ===================================== */

      pdf.setFillColor(18, 61, 52);

      pdf.rect(0, 0, PAGE_WIDTH, 39, "F");

      pdf.setFillColor(185, 239, 207);

      pdf.roundedRect(LEFT, 10, 13, 13, 3, 3, "F");

      pdf.setTextColor(18, 61, 52);

      pdf.setFontSize(12);

      pdf.setFont("helvetica", "bold");

      pdf.text("S", LEFT + 6.5, 18.5, { align: "center" });

      pdf.setTextColor(255, 255, 255);

      pdf.setFontSize(18);

      pdf.setFont("helvetica", "bold");

      pdf.text("Schedula", LEFT + 18, 16);

      pdf.setFontSize(8);

      pdf.setFont("helvetica", "normal");

      pdf.setTextColor(209, 233, 224);

      pdf.text("Care, clearly scheduled.", LEFT + 18, 22);

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(9);

      pdf.setTextColor(255, 255, 255);

      pdf.text(pageContent.pdfTitle.toUpperCase(), RIGHT, 16, { align: "right" });

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(7.5);

      pdf.setTextColor(209, 233, 224);

      pdf.text(`Issued ${displayDateTime(new Date().toISOString())}`, RIGHT, 22, { align: "right" });

      /* =====================================
           TITLE
        ===================================== */

      pdf.setTextColor(25, 45, 40);

      pdf.setFontSize(18);

      pdf.setFont("helvetica", "bold");

      pdf.text(pageContent.pdfTitle, LEFT, 52);

      pdf.setFontSize(10);

      pdf.setFont("helvetica", "normal");

      pdf.setTextColor(90, 105, 100);

      const subtitleLines = pdf.splitTextToSize(pageContent.pdfSubtitle, 120);

      pdf.text(subtitleLines, LEFT, 59);

      const statusColors =
        booking.status === "confirmed"
          ? [23, 107, 85]
          : booking.status === "pending"
            ? [190, 125, 25]
            : booking.status === "cancelled"
              ? [190, 60, 70]
              : [65, 105, 150];

      pdf.setFillColor(statusColors[0], statusColors[1], statusColors[2]);

      pdf.roundedRect(LEFT, 70, 37, 9, 4.5, 4.5, "F");

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(7.5);

      pdf.setTextColor(255, 255, 255);

      pdf.text(statusLabel.toUpperCase(), LEFT + 18.5, 75.8, { align: "center" });

      /* =====================================
           QR CODE
        ===================================== */

      pdf.setFillColor(248, 251, 249);

      pdf.setDrawColor(220, 231, 226);

      pdf.roundedRect(150, 44, 44, 51, 3, 3, "FD");

      pdf.addImage(qrImage, "PNG", 153, 47, 38, 38);

      pdf.setFontSize(7);

      pdf.setTextColor(90, 105, 100);

      pdf.text("Scan to verify details", 172, 90, { align: "center" });

      /* =====================================
           DIVIDER
        ===================================== */

      pdf.setDrawColor(220, 228, 224);

      pdf.line(LEFT, 100, RIGHT, 100);

      let y = 111;

      /* =====================================
           PDF HELPERS
        ===================================== */

      const checkPage = (requiredSpace = 25) => {
        if (y + requiredSpace > 274) {
          pdf.addPage();

          pdf.setFillColor(18, 61, 52);

          pdf.rect(0, 0, PAGE_WIDTH, 22, "F");

          pdf.setTextColor(255, 255, 255);

          pdf.setFont("helvetica", "bold");

          pdf.setFontSize(11);

          pdf.text("Schedula", LEFT, 14);

          pdf.setFontSize(8);

          pdf.text(`${pageContent.pdfTitle} - continued`, RIGHT, 14, { align: "right" });

          y = 33;
        }
      };

      const addSectionTitle = (title: string) => {
        checkPage(15);

        pdf.setFillColor(23, 107, 85);

        pdf.roundedRect(LEFT, y - 5.5, 3, 8, 1.5, 1.5, "F");

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(11);

        pdf.setTextColor(18, 116, 91);

        pdf.text(title, LEFT + 7, y);

        y += 8;
      };

      const addField = (label: string, value: string) => {
        const lines = pdf.splitTextToSize(value || "-", 112);

        const rowHeight = Math.max(12, lines.length * 4.2 + 6);

        checkPage(rowHeight + 3);

        pdf.setFillColor(247, 250, 248);

        pdf.setDrawColor(225, 234, 230);

        pdf.roundedRect(LEFT, y - 5, RIGHT - LEFT, rowHeight, 2.5, 2.5, "FD");

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(8);

        pdf.setTextColor(110, 120, 116);

        pdf.text(label.toUpperCase(), LEFT + 5, y + 1.5);

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(10);

        pdf.setTextColor(30, 45, 40);

        pdf.text(lines, LEFT + 58, y + 1.5);

        y += rowHeight + 3;
      };

      /* =====================================
           BOOKING DETAILS
        ===================================== */

      addSectionTitle("Booking Details");

      addField("Appointment ID", booking.id);

      addField("Current Status", statusLabel);

      addField("Appointment Type", booking.appointmentType ?? "In-person");

      addField("Date", displayDate(booking.date));

      addField("Time", booking.time);

      /* =====================================
           DOCTOR
        ===================================== */

      y += 3;

      addSectionTitle("Doctor Details");

      addField("Doctor", booking.doctorName);

      addField("Specialty", booking.specialty);

      addField(
        "Clinic / Location",
        booking.doctorLocation ?? "Schedula Clinic",
      );

      addField("Consultation Fee", `INR ${booking.fee}`);

      /* =====================================
           PATIENT
        ===================================== */

      y += 3;

      addSectionTitle("Patient Details");

      addField("Patient Name", booking.patientName);

      addField("Age", `${booking.patientAge} years`);

      addField("Email", booking.patientEmail);

      addField("Phone", booking.patientPhone);

      addField("Reason for Consultation", booking.reason);

      /* =====================================
           RESCHEDULE INFORMATION
        ===================================== */

      if (booking.rescheduledAt) {
        y += 3;

        addSectionTitle("Rescheduling Information");

        if (booking.originalStartsAt) {
          addField(
            "Original Appointment",
            displayDateTime(booking.originalStartsAt),
          );
        }

        addField(
          "Current Appointment",
          `${displayDate(booking.date)} at ${booking.time}`,
        );

        addField("Rescheduled On", displayDateTime(booking.rescheduledAt));
      }

      /* =====================================
           MEDICAL DOCUMENT
        ===================================== */

      if (booking.attachment) {
        y += 3;

        addSectionTitle("Medical Document");

        addField("Attachment Name", booking.attachment.name);

        addField("File Type", booking.attachment.type);

        addField("File Size", formatFileSize(booking.attachment.size));
      }

      /* =====================================
           RECORD INFORMATION
        ===================================== */

      y += 3;

      addSectionTitle("Record Information");

      addField("Booking Created", displayDateTime(booking.createdAt));

      addField("Current Status", statusLabel);

      /* =====================================
           FOOTER
        ===================================== */

      checkPage(25);

      y += 4;

      pdf.setDrawColor(220, 228, 224);

      pdf.line(LEFT, y, RIGHT, y);

      y += 8;

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(8);

      pdf.setTextColor(110, 120, 116);

      pdf.text("Generated by Schedula", LEFT, y);

      pdf.text("Keep this document for your appointment records.", LEFT, y + 6);

      /* =====================================
           SAVE
        ===================================== */

      let filePrefix = "Schedula-Appointment";

      if (booking.status === "confirmed") {
        filePrefix = "Schedula-Confirmation";
      }

      if (booking.status === "pending") {
        filePrefix = "Schedula-Booking-Request";
      }

      pdf.save(`${filePrefix}-${booking.id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);

      alert("Unable to generate appointment PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  /* =========================================
     PAGE CONTENT
  ========================================= */

  const pageContent = booking ? getPageContent(booking.status) : null;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4">
          <div className="text-center">
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-[#dbeafe] border-t-[var(--brand)]" />

            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading appointment...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-12">
        <section className="w-full max-w-2xl rounded-[18px] border border-[var(--line)] bg-white p-6 text-center soft-shadow sm:p-10">
          {booking && pageContent && (
            <>
              {/* STATUS ICON */}

              <div
                className={`mx-auto grid size-16 place-items-center rounded-full border text-2xl font-semibold ${getStatusStyle(
                  booking.status,
                )}`}
              >
                {booking.status === "pending" ? <Clock3 size={24} /> : booking.status === "confirmed" || booking.status === "completed" ? <CircleCheck size={24} /> : booking.status === "cancelled" ? <X size={24} /> : <OctagonAlert size={24} />}
              </div>

              {/* HEADER */}

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                {pageContent.eyebrow}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {pageContent.title}
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
                {pageContent.description}
              </p>

              {/* PENDING MESSAGE */}

              {booking.status === "pending" && (
                <div className="mx-auto mt-6 max-w-lg rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-5 py-4 text-left">
                  <p className="text-sm font-semibold text-[#D96B32]">
                    What happens next?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#D96B32]">
                    Your selected appointment slot has been reserved. The doctor
                    can now confirm or decline the request.
                  </p>
                </div>
              )}

              {/* CONFIRMED MESSAGE */}

              {booking.status === "confirmed" && (
                <div className="mx-auto mt-6 max-w-lg rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-5 py-4 text-left">
                  <p className="text-sm font-semibold text-[#C9362D]">
                    Appointment ready
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#C9362D]">
                    Your doctor has accepted the appointment request. Please
                    arrive on time and keep your confirmation record.
                  </p>
                </div>
              )}

              {/* BOOKING CARD */}

              <div className="mx-auto mt-8 max-w-lg rounded-xl border border-[var(--line)] bg-[#FFFFFF] p-5 text-left">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                  <div>
                    <p className="font-semibold">{booking.doctorName}</p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {booking.specialty}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-[var(--brand)]">
                      {booking.appointmentType ?? "In-person"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      booking.status,
                    )}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted)]">Patient</dt>

                    <dd className="mt-1 font-medium">{booking.patientName}</dd>
                  </div>

                  <div>
                    <dt className="text-[var(--muted)]">Appointment ID</dt>

                    <dd className="mt-1 break-all font-medium">{booking.id}</dd>
                  </div>

                  <div>
                    <dt className="text-[var(--muted)]">Date</dt>

                    <dd className="mt-1 font-medium">
                      {displayDate(booking.date)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[var(--muted)]">Time</dt>

                    <dd className="mt-1 font-medium">{booking.time}</dd>
                  </div>

                  <div>
                    <dt className="text-[var(--muted)]">Appointment type</dt>

                    <dd className="mt-1 font-medium">
                      {booking.appointmentType ?? "In-person"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[var(--muted)]">Fee</dt>

                    <dd className="mt-1 font-medium">₹{booking.fee}</dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-[var(--muted)]">Clinic / Location</dt>

                    <dd className="mt-1 font-medium">
                      {booking.doctorLocation ?? "Schedula Clinic"}
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-[var(--muted)]">
                      Reason for consultation
                    </dt>

                    <dd className="mt-1 font-medium">{booking.reason}</dd>
                  </div>
                </dl>

                {/* RESCHEDULED */}

                {booking.rescheduledAt && (
                  <div className="mt-5 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#D96B32]">
                      Appointment rescheduled
                    </p>

                    <p className="mt-2 text-sm text-[#D96B32]">
                      Your current appointment is scheduled for{" "}
                      <span className="font-semibold">
                        {displayDate(booking.date)} at {booking.time}
                      </span>
                      .
                    </p>

                    {booking.originalStartsAt && (
                      <p className="mt-2 text-xs text-[#D96B32]">
                        Original: {displayDateTime(booking.originalStartsAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* ATTACHMENT */}

                {booking.attachment && (
                  <div className="mt-5 rounded-xl border border-[#dbeafe] bg-[#F8FAFC]/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#C9362D]">
                      Medical attachment
                    </p>

                    <p className="mt-2 break-all text-sm font-semibold">
                      <FileText size={15} className="mr-1 inline text-[var(--brand)]" /> {booking.attachment.name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatFileSize(booking.attachment.size)}

                      {" · "}

                      {booking.attachment.type}
                    </p>
                  </div>
                )}
              </div>

              {/* PDF BUTTON */}

              <button
                type="button"
                onClick={downloadConfirmationPdf}
                disabled={pdfLoading}
                className="mt-7 w-full rounded-xl bg-[var(--brand)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pdfLoading ? "Generating PDF..." : pageContent.button}
              </button>

              {/* NAVIGATION */}

              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/my-appointments"
                  className="rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  My Appointments
                </Link>

                <Link
                  href="/doctors"
                  className="rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  Find Doctors
                </Link>
              </div>
            </>
          )}

          {/* NO BOOKING */}

          {!booking && (
            <>
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F8FAFC] text-2xl">
                !
              </div>

              <h1 className="mt-6 text-2xl font-semibold">
                No recent booking found
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                We could not find a recently created appointment in this
                browser.
              </p>

              <Link
                href="/doctors"
                className="mt-7 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
              >
                Find a Doctor
              </Link>
            </>
          )}
        </section>
      </main>
    </>
  );
}
