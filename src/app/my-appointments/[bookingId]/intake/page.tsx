"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, Clock3, HeartPulse, LockKeyhole, Send, Stethoscope } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import type { Booking } from "@/types/booking";
import type { IntakeTemplate } from "@/lib/specialty-intake";
import { getSpecialtyIntakeTemplate } from "@/lib/specialty-intake";
import { createNotification, getBookingById, getCurrentUser, saveBooking } from "@/lib/client-storage";

const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function AppointmentIntakePage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [template, setTemplate] = useState<IntakeTemplate | null>(null);
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const found = getBookingById(params.bookingId);

    if (!user || user.role !== "patient") {
      router.replace("/login");
      return;
    }

    if (!found || (found.patientId && found.patientId !== user.id) || found.patientEmail.toLowerCase() !== user.email.toLowerCase()) {
      router.replace("/my-appointments");
      return;
    }

    if (found.payment?.status !== "paid") {
      router.replace(`/booking/${found.doctorId}`);
      return;
    }

    const intakeTemplate = getSpecialtyIntakeTemplate(found.specialty);
    setBooking(found);
    setTemplate(intakeTemplate);
    setPrimaryConcern(found.intake?.primaryConcern ?? found.reason);
    setSymptomDuration(found.intake?.symptomDuration ?? "");
    setSeverity(found.intake?.severity ?? "moderate");
    setConsent(found.intake?.consentToShare ?? false);
    setAnswers(Object.fromEntries(intakeTemplate.questions.map((question) => [question.id, found.intake?.answers.find((answer) => answer.questionId === question.id)?.value ?? ""])));
  }, [params.bookingId, router]);

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setError("");
  };

  const submit = () => {
    if (!booking || !template) return;
    setError("");

    if (!primaryConcern.trim() || !symptomDuration.trim()) {
      setError("Please describe your concern and how long it has been present.");
      return;
    }

    const missing = template.questions.find((question) => question.required && !answers[question.id]?.trim());
    if (missing) {
      setError(`Please complete: ${missing.label}`);
      return;
    }

    if (!consent) {
      setError("Please confirm that the intake can be shared with this doctor for the appointment.");
      return;
    }

    setSaving(true);
    const updated: Booking = {
      ...booking,
      intake: {
        specialty: booking.specialty,
        primaryConcern: primaryConcern.trim(),
        symptomDuration: symptomDuration.trim(),
        severity,
        answers: template.questions.map((question) => ({
          questionId: question.id,
          label: question.label,
          value: answers[question.id]?.trim() || "Not provided",
        })),
        consentToShare: true,
        completedAt: new Date().toISOString(),
      },
    };

    const saved = saveBooking(updated);
    setSaving(false);

    if (!saved) {
      setError("Unable to save the intake. Please try again.");
      return;
    }

    createNotification({
      recipientUserId: booking.doctorId,
      type: "booking",
      title: "Patient intake completed",
      message: `${booking.patientName} completed the ${booking.specialty} intake for the upcoming appointment.`,
      appointmentId: booking.id,
    });

    router.push("/booking-confirmation");
  };

  if (!booking || !template) {
    return <><Navbar /><main className="grid min-h-[calc(100vh-73px)] place-items-center bg-slate-50"><p className="text-sm font-semibold text-slate-500">Preparing your intake...</p></main></>;
  }

  const completedRequired = template.questions.filter((question) => question.required && answers[question.id]?.trim()).length;
  const requiredCount = template.questions.filter((question) => question.required).length + 3;
  const completedCount = completedRequired + Number(Boolean(primaryConcern.trim())) + Number(Boolean(symptomDuration.trim())) + Number(consent);
  const progress = Math.round((completedCount / requiredCount) * 100);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-7 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/booking-confirmation" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"><ArrowLeft size={16} /> Booking confirmation</Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"><CheckCircle2 size={14} /> Payment completed</span>
          </div>

          <section className="mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_55px_-38px_rgba(15,23,42,0.4)]">
            <header className="bg-[linear-gradient(120deg,#0f172a_0%,#172554_60%,#0c4a6e_100%)] px-5 py-7 text-white sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Step 2 of 2 · Pre-visit preparation</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{template.title}</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{template.description}</p>
                </div>
                <div className="min-w-52 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center justify-between text-xs font-bold"><span>Intake readiness</span><span>{progress}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} /></div>
                </div>
              </div>
            </header>

            <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 bg-slate-50/80 p-5 lg:border-b-0 lg:border-r sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Appointment</p>
                <h2 className="mt-2 font-bold text-slate-900">{booking.doctorName}</h2>
                <p className="mt-1 text-sm font-semibold text-blue-700">{booking.specialty}</p>
                <div className="mt-5 space-y-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Clock3 size={15} className="text-blue-600" /> {booking.date} · {booking.time}</p>
                  <p className="flex items-center gap-2"><Stethoscope size={15} className="text-blue-600" /> {booking.appointmentType}</p>
                  <p className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600" /> ₹{booking.fee} paid</p>
                </div>
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-blue-900"><ClipboardList size={15} /> Why complete this?</p>
                  <p className="mt-2 text-[11px] leading-5 text-blue-800">Your answers give the doctor useful context before the visit and reduce time spent repeating basic information.</p>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-900">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  This form is not an emergency assessment. Seek urgent local care for severe or rapidly worsening symptoms.
                </div>
              </aside>

              <div className="p-5 sm:p-8">
                <section>
                  <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><HeartPulse size={17} /></span><div><h2 className="font-bold">Current concern</h2><p className="text-xs text-slate-500">Required for every appointment.</p></div></div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="sm:col-span-2"><span className="text-xs font-bold text-slate-700">What would you like the doctor to help with? *</span><textarea rows={3} value={primaryConcern} onChange={(event) => { setPrimaryConcern(event.target.value); setError(""); }} className={fieldClass + " resize-none"} /></label>
                    <label><span className="text-xs font-bold text-slate-700">How long has this been present? *</span><input value={symptomDuration} onChange={(event) => { setSymptomDuration(event.target.value); setError(""); }} placeholder="For example: 5 days" className={fieldClass} /></label>
                    <label><span className="text-xs font-bold text-slate-700">Current severity *</span><select value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)} className={fieldClass}><option value="mild">Mild — manageable</option><option value="moderate">Moderate — affects daily activity</option><option value="severe">Severe — difficult to manage</option></select></label>
                  </div>
                </section>

                <section className="mt-8 border-t border-slate-100 pt-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">Questions for {booking.specialty}</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {template.questions.map((question) => (
                      <label key={question.id} className={question.type === "textarea" ? "sm:col-span-2" : ""}>
                        <span className="text-xs font-bold text-slate-700">{question.label}{question.required ? " *" : ""}</span>
                        {question.help && <span className="mt-1 block text-[10px] text-slate-400">{question.help}</span>}
                        {question.type === "textarea" ? <textarea rows={3} value={answers[question.id] ?? ""} onChange={(event) => updateAnswer(question.id, event.target.value)} className={fieldClass + " resize-none"} /> : question.type === "select" ? <select value={answers[question.id] ?? ""} onChange={(event) => updateAnswer(question.id, event.target.value)} className={fieldClass}><option value="">Select an answer</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select> : question.type === "yesno" ? <select value={answers[question.id] ?? ""} onChange={(event) => updateAnswer(question.id, event.target.value)} className={fieldClass}><option value="">Select an answer</option><option>Yes</option><option>No</option><option>Not sure</option></select> : <input value={answers[question.id] ?? ""} onChange={(event) => updateAnswer(question.id, event.target.value)} className={fieldClass} />}
                      </label>
                    ))}
                  </div>
                </section>

                <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setError(""); }} className="mt-1 size-4 accent-blue-600" />
                  <span><span className="flex items-center gap-2 text-xs font-bold text-slate-900"><LockKeyhole size={14} className="text-blue-600" /> Share this intake with {booking.doctorName}</span><span className="mt-1 block text-[11px] leading-5 text-slate-500">I confirm these answers are accurate to the best of my knowledge and consent to sharing them for this appointment.</span></span>
                </label>

                {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/booking-confirmation" className="text-center text-xs font-bold text-slate-500 hover:text-slate-800">Complete later</Link>
                  <button type="button" onClick={submit} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"><Send size={16} />{saving ? "Saving intake..." : booking.intake ? "Update intake" : "Submit intake"}</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
