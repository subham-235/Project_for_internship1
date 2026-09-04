import { jsPDF } from "jspdf";

import type { Booking } from "@/types/booking";
import type { Prescription } from "@/types/prescription";
import { doctors } from "@/lib/mock-data/doctors";
import { formatAppointmentFullDate, formatAppointmentTime } from "@/lib/appointment-utils";

const NAVY = [11, 19, 41] as const;
const BLUE = [37, 99, 235] as const;
const BLUE_SOFT = [239, 246, 255] as const;
const INK = [15, 23, 42] as const;
const MUTED = [100, 116, 139] as const;
const LINE = [203, 213, 225] as const;
const PAPER = [248, 250, 252] as const;
const GREEN = [22, 101, 52] as const;

function pdfSafe(value: string) {
  return value
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2022/g, "|");
}

export function createPrescriptionPdf(booking: Booking, prescription: Prescription) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const left = 15;
  const right = 195;
  const contentWidth = right - left;
  const issuedAt = new Date(prescription.updatedAt ?? prescription.createdAt);
  const doctor = doctors.find((item) => item.id === booking.doctorId);
  const qualification = pdfSafe(doctor?.education?.slice(-1)[0] ?? booking.specialty);
  const registration = doctor?.registrationNumber ?? "Registration held on file";
  const clinicLocation = booking.doctorLocation ?? doctor?.location ?? "Schedula Care Network";
  const recordReference = `${booking.id}-${prescription.id}`.replace(/[^a-z0-9]/gi, "").slice(-18).toUpperCase();
  let y = 0;
  let pageNumber = 1;

  const drawBrandMark = (x: number, top: number) => {
    pdf.setFillColor(...BLUE);
    pdf.roundedRect(x, top, 14, 14, 3, 3, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x + 5.8, top + 2.8, 2.4, 8.4, "F");
    pdf.rect(x + 2.8, top + 5.8, 8.4, 2.4, "F");
  };

  const drawFooter = () => {
    pdf.setDrawColor(...LINE);
    pdf.line(left, 281, right, 281);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.8);
    pdf.setTextColor(...MUTED);
    pdf.text("This electronically generated prescription is part of the Schedula appointment record.", left, 286);
    pdf.text(`Record ref: ${recordReference}  |  Page ${pageNumber}`, right, 286, { align: "right" });
    pdf.text("For emergencies, contact local emergency services. Do not use this document for self-medication.", left, 290);
  };

  const drawHeader = (continuation = false) => {
    pdf.setFillColor(...NAVY);
    pdf.rect(0, 0, 210, 7, "F");
    drawBrandMark(left, 15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(...NAVY);
    pdf.text("Schedula", left + 19, 21);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text("CONNECTED CLINICAL CARE", left + 19, 27);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...NAVY);
    pdf.text(continuation ? "PRESCRIPTION - CONTINUED" : "MEDICAL PRESCRIPTION", right, 20, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(`Issued: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(issuedAt)}`, right, 26, { align: "right" });
    pdf.setDrawColor(...LINE);
    pdf.line(left, 35, right, 35);
    y = 42;
  };

  const addPage = () => {
    drawFooter();
    pdf.addPage();
    pageNumber += 1;
    drawHeader(true);
  };

  const ensureSpace = (height: number) => {
    if (y + height > 276) addPage();
  };

  const label = (text: string, x: number, top: number) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.8);
    pdf.setTextColor(...MUTED);
    pdf.text(text.toUpperCase(), x, top);
  };

  const value = (text: string, x: number, top: number, maxWidth: number, bold = true) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...INK);
    pdf.text(pdf.splitTextToSize(pdfSafe(text || "-"), maxWidth).slice(0, 2), x, top);
  };

  const sectionHeading = (title: string) => {
    ensureSpace(12);
    pdf.setFillColor(...BLUE);
    pdf.rect(left, y - 3.5, 2.5, 7, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...NAVY);
    pdf.text(title.toUpperCase(), left + 6, y + 1);
    y += 8;
  };

  const textBlock = (title: string, text: string) => {
    const lines = pdf.splitTextToSize(pdfSafe(text || "Not specified"), contentWidth - 10);
    const height = Math.max(15, lines.length * 4 + 10);
    ensureSpace(height + 4);
    pdf.setFillColor(...PAPER);
    pdf.setDrawColor(...LINE);
    pdf.roundedRect(left, y, contentWidth, height, 2, 2, "FD");
    label(title, left + 5, y + 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...INK);
    pdf.text(lines, left + 5, y + 12);
    y += height + 4;
  };

  const drawMedicineTableHeader = () => {
    pdf.setFillColor(...NAVY);
    pdf.roundedRect(left, y, contentWidth, 9, 1.5, 1.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text("#", left + 4, y + 5.7);
    pdf.text("MEDICINE", left + 12, y + 5.7);
    pdf.text("DOSAGE / SCHEDULE", left + 76, y + 5.7);
    pdf.text("DURATION", left + 127, y + 5.7);
    pdf.text("INSTRUCTIONS", left + 151, y + 5.7);
    y += 9;
  };

  drawHeader();
  pdf.setFillColor(...PAPER);
  pdf.setDrawColor(...LINE);
  pdf.roundedRect(left, y, contentWidth, 35, 3, 3, "FD");
  pdf.line(105, y + 5, 105, y + 30);

  label("Prescribing doctor", left + 6, y + 7);
  value(booking.doctorName, left + 6, y + 13, 78);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text(pdf.splitTextToSize(`${qualification} | ${booking.specialty}`, 78), left + 6, y + 19);
  pdf.text(`Reg. no.: ${registration}`, left + 6, y + 25);
  pdf.text(pdf.splitTextToSize(clinicLocation, 78).slice(0, 1), left + 6, y + 30);

  label("Patient", 111, y + 7);
  value(booking.patientName, 111, y + 13, 76);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text(`Age: ${booking.patientAge} years`, 111, y + 19);
  pdf.text(`Patient ID: ${booking.patientId ?? booking.id}`, 111, y + 25);
  pdf.text(`Contact: ${booking.patientPhone || "-"}`, 111, y + 30);
  y += 40;

  pdf.setFillColor(...BLUE_SOFT);
  pdf.roundedRect(left, y, contentWidth, 15, 2, 2, "F");
  label("Consultation", left + 5, y + 5.5);
  value(`${formatAppointmentFullDate(booking.startsAt)} at ${formatAppointmentTime(booking.startsAt)}`, left + 5, y + 11, 72, false);
  label("Visit type", left + 83, y + 5.5);
  value(booking.appointmentType, left + 83, y + 11, 35, false);
  label("Appointment ID", left + 124, y + 5.5);
  value(booking.id, left + 124, y + 11, 50, false);
  y += 22;

  sectionHeading("Clinical details");
  const reasonLines = pdf.splitTextToSize(pdfSafe(booking.reason || "Not recorded"), 76);
  const diagnosisLines = pdf.splitTextToSize(pdfSafe(prescription.diagnosis || "Not recorded"), 76);
  const clinicalHeight = Math.max(20, Math.max(reasonLines.length, diagnosisLines.length) * 4.2 + 11);
  pdf.setDrawColor(...LINE);
  pdf.roundedRect(left, y, contentWidth, clinicalHeight, 2, 2, "S");
  pdf.line(105, y, 105, y + clinicalHeight);
  label("Presenting concern", left + 5, y + 6);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...INK);
  pdf.text(reasonLines, left + 5, y + 12);
  label("Diagnosis / assessment", 111, y + 6);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...INK);
  pdf.text(diagnosisLines, 111, y + 12);
  y += clinicalHeight + 10;

  ensureSpace(22);
  pdf.setFont("times", "bolditalic");
  pdf.setFontSize(26);
  pdf.setTextColor(...BLUE);
  pdf.text("Rx", left, y + 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text("Use medicines only as directed by the prescribing doctor.", left + 21, y + 6);
  y += 14;

  const medicines = prescription.medicines?.length
    ? prescription.medicines
    : prescription.medications.map((name, index) => ({ id: `legacy-${index}`, name, dosage: "As directed", duration: "As directed", instructions: "Follow doctor's advice" }));

  drawMedicineTableHeader();
  (medicines.length ? medicines : [{ id: "none", name: "No medicines prescribed", dosage: "-", duration: "-", instructions: "-" }]).forEach((medicine, index) => {
    const nameLines = pdf.splitTextToSize(pdfSafe(medicine.name), 58);
    const dosageLines = pdf.splitTextToSize(pdfSafe(medicine.dosage || "As directed"), 45);
    const durationLines = pdf.splitTextToSize(pdfSafe(medicine.duration || "As directed"), 19);
    const instructionLines = pdf.splitTextToSize(pdfSafe(medicine.instructions || "Follow doctor's advice"), 25);
    const rowHeight = Math.max(14, Math.max(nameLines.length, dosageLines.length, durationLines.length, instructionLines.length) * 4 + 6);
    if (y + rowHeight > 264) {
      addPage();
      pdf.setFont("times", "bolditalic");
      pdf.setFontSize(20);
      pdf.setTextColor(...BLUE);
      pdf.text("Rx", left, y + 5);
      y += 10;
      drawMedicineTableHeader();
    }
    if (index % 2 === 0) {
      pdf.setFillColor(...PAPER);
      pdf.rect(left, y, contentWidth, rowHeight, "F");
    }
    pdf.setDrawColor(...LINE);
    pdf.line(left, y + rowHeight, right, y + rowHeight);
    [left + 9, left + 73, left + 124, left + 148].forEach((x) => pdf.line(x, y, x, y + rowHeight));
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...INK);
    pdf.text(String(index + 1), left + 4.5, y + 6, { align: "center" });
    pdf.text(nameLines, left + 12, y + 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.7);
    pdf.text(dosageLines, left + 76, y + 6);
    pdf.text(durationLines, left + 127, y + 6);
    pdf.text(instructionLines, left + 151, y + 6);
    y += rowHeight;
  });
  y += 10;

  if (prescription.carePlan) {
    sectionHeading("Structured care plan");
    textBlock("Treatment goal", prescription.carePlan.treatmentGoal);
    textBlock("Self-care instructions", prescription.carePlan.selfCareInstructions);
    if (prescription.carePlan.recommendedTests) textBlock("Recommended tests", prescription.carePlan.recommendedTests);
    textBlock("Warning signs requiring review", prescription.carePlan.warningSigns);
    if (prescription.carePlan.followUpDate || prescription.carePlan.followUpNotes) {
      const followUp = [
        prescription.carePlan.followUpDate
          ? `Date: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(`${prescription.carePlan.followUpDate}T12:00:00`))}`
          : "",
        prescription.carePlan.followUpNotes,
      ].filter(Boolean).join(" | ");
      textBlock("Follow-up", followUp);
    }
    y += 5;
  }

  const noteLines = pdf.splitTextToSize(pdfSafe(prescription.notes || "No additional care instructions recorded."), 96);
  const closingHeight = Math.max(37, noteLines.length * 4.2 + 15);
  ensureSpace(closingHeight + 10);
  sectionHeading("Advice, follow-up and authorization");

  const closingTop = y;
  pdf.setFillColor(...BLUE_SOFT);
  pdf.setDrawColor(191, 219, 254);
  pdf.roundedRect(left, closingTop, 108, closingHeight, 2, 2, "FD");
  label("Care instructions", left + 5, closingTop + 6);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...INK);
  pdf.text(noteLines, left + 5, closingTop + 12);

  const authorizationLeft = left + 113;
  pdf.setDrawColor(...LINE);
  pdf.roundedRect(authorizationLeft, closingTop, 67, closingHeight, 2, 2, "S");
  pdf.setDrawColor(...GREEN);
  pdf.setLineWidth(0.55);
  pdf.circle(authorizationLeft + 13, closingTop + closingHeight / 2, 10, "S");
  pdf.setLineWidth(0.2);
  pdf.circle(authorizationLeft + 13, closingTop + closingHeight / 2, 8, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.8);
  pdf.setTextColor(...GREEN);
  pdf.text("SCHEDULA", authorizationLeft + 13, closingTop + closingHeight / 2 - 2.5, { align: "center" });
  pdf.setFontSize(6);
  pdf.text("VERIFIED", authorizationLeft + 13, closingTop + closingHeight / 2 + 2, { align: "center" });
  pdf.setFontSize(4);
  pdf.text("DIGITAL RECORD", authorizationLeft + 13, closingTop + closingHeight / 2 + 5.5, { align: "center" });

  pdf.setFont("times", "bolditalic");
  pdf.setFontSize(11.5);
  pdf.setTextColor(...BLUE);
  pdf.text(booking.doctorName, right - 4, closingTop + 10, { align: "right" });
  pdf.setDrawColor(...INK);
  pdf.line(authorizationLeft + 27, closingTop + 13.5, right - 4, closingTop + 13.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(5.6);
  pdf.setTextColor(...INK);
  pdf.text("DIGITALLY SIGNED", right - 4, closingTop + 18, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.4);
  pdf.setTextColor(...MUTED);
  pdf.text(pdf.splitTextToSize(qualification, 38).slice(0, 1), right - 4, closingTop + 22, { align: "right" });
  pdf.text("Reg. no.: " + registration, right - 4, closingTop + 26, { align: "right" });
  pdf.text(new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(issuedAt), right - 4, closingTop + 30, { align: "right" });

  drawFooter();
  return pdf;
}

export function downloadPrescriptionPdf(booking: Booking, prescription: Prescription) {
  const pdf = createPrescriptionPdf(booking, prescription);
  pdf.save(`Schedula-Prescription-${booking.id}.pdf`);
}
