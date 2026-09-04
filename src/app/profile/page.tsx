"use client";


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ClipboardList,
  FileText,
  HeartPulse,
  Save,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { toast } from "sonner";
import {
  getBookingsForPatient,
  getCurrentUser,
  getPatientProfile,
  getPrescriptions,
  savePatientProfile,
} from "@/lib/client-storage";
import type { PatientProfile } from "@/types/user";

const fieldClass = "mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white";

function blankProfile(user: { id: string; name: string; email: string }): PatientProfile {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    updatedAt: "",
  };
}

export default function PatientProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [summary, setSummary] = useState({ prescriptions: 0, completed: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "patient") {
      router.replace("/login");
      return;
    }
    const bookings = getBookingsForPatient(user.id, user.email);
    const bookingIds = new Set(bookings.map((booking) => booking.id));
    setProfile(getPatientProfile(user.id) ?? blankProfile(user));
    setSummary({
      prescriptions: getPrescriptions().filter((item) => bookingIds.has(item.bookingId)).length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      reports: bookings.filter((booking) => Boolean(booking.attachment)).length,
    });
    setLoading(false);
  }, [router]);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const values = [
      profile.name,
      profile.email,
      profile.phone,
      profile.dateOfBirth,
      profile.gender,
      profile.bloodGroup,
      profile.heightCm,
      profile.weightKg,
      profile.emergencyContactName,
      profile.emergencyContactPhone,
    ];
    return Math.round((values.filter((value) => value.trim()).length / values.length) * 100);
  }, [profile]);

  const update = (field: keyof PatientProfile, value: string) => {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  };

  const save = () => {
    if (!profile) return;
    setError("");
    setMessage("");
    if (!profile.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (profile.phone && !/^[+\d][\d\s-]{7,}$/.test(profile.phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    if (profile.heightCm && Number(profile.heightCm) <= 0) {
      setError("Height must be greater than zero.");
      return;
    }
    if (profile.weightKg && Number(profile.weightKg) <= 0) {
      setError("Weight must be greater than zero.");
      return;
    }
    if (profile.emergencyContactPhone && !/^[+\d][\d\s-]{7,}$/.test(profile.emergencyContactPhone)) {
      setError("Enter a valid emergency contact number.");
      return;
    }
    setSaving(true);
    const success = savePatientProfile({
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    if (!success) {
      setError("Your profile could not be saved. Please try again.");
      toast.error("Profile update failed", { description: "Please review your details and try again." });
      return;
    }
    setMessage("Health profile updated successfully.");
    toast.success("Health profile updated", { description: "Your latest information is ready for future appointments." });
    window.setTimeout(() => setMessage(""), 3500);
  };

  if (loading || !profile) {
    return <main className="min-h-screen bg-[#F8FAFC] px-4 py-20"><div className="mx-auto max-w-6xl space-y-5"><Skeleton className="h-56 w-full rounded-2xl" /><div className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div></main>;
  }

  const summaries = [
    { label: "Total prescriptions", value: summary.prescriptions, icon: ClipboardList, tone: "accent" as const },
    { label: "Completed appointments", value: summary.completed, icon: HeartPulse, tone: "success" as const },
    { label: "Test reports", value: summary.reports, icon: FileText, tone: "brand" as const },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-7 sm:px-7">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[18px] bg-[#2563eb] p-6 text-white shadow-[0_18px_50px_rgba(11,19,41,0.14)] sm:p-8">
            <div className="absolute -right-20 -top-28 size-72 rounded-full border-[44px] border-white/6" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/75">Patient health record</p>
            <h1 className="relative mt-2 text-3xl font-bold tracking-tight">My profile</h1>
            <p className="relative mt-2 max-w-2xl text-sm leading-6 text-[#F8FAFC]/75">Keep your personal and medical information current so your care team has the right context.</p>
            <div className="relative mt-5 max-w-md">
              <div className="flex justify-between text-xs font-semibold"><span>Profile completeness</span><span>{completeness}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#dbeafe]" style={{ width: String(completeness) + "%" }} /></div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            {summaries.map((item) => <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} tone={item.tone} />)}
          </section>

          {(message || error) && <div role={error ? "alert" : "status"} className={"mt-5 rounded-xl border px-4 py-3 text-sm font-semibold " + (error ? "border-[#dbeafe] bg-[#F8FAFC] text-[#C9362D]" : "border-[#dbeafe] bg-[#F8FAFC] text-[#C9362D]")}>{error || message}</div>}

          <div className="mt-5 space-y-5">
            <FormSection icon={UserRound} title="Personal information" description="Basic contact and identity details.">
              <Field label="Full name"><input value={profile.name} onChange={(event) => update("name", event.target.value)} className={fieldClass} /></Field>
              <Field label="Email"><input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} className={fieldClass} /></Field>
              <Field label="Phone"><input value={profile.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" className={fieldClass} /></Field>
              <Field label="Date of birth"><input type="date" value={profile.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} className={fieldClass} /></Field>
              <Field label="Gender"><select value={profile.gender} onChange={(event) => update("gender", event.target.value)} className={fieldClass}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></Field>
            </FormSection>

            <FormSection icon={Activity} title="Physical details" description="Useful baseline information for consultations.">
              <Field label="Blood group"><select value={profile.bloodGroup} onChange={(event) => update("bloodGroup", event.target.value)} className={fieldClass}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Height (cm)"><input type="number" min="1" value={profile.heightCm} onChange={(event) => update("heightCm", event.target.value)} className={fieldClass} /></Field>
              <Field label="Weight (kg)"><input type="number" min="1" step="0.1" value={profile.weightKg} onChange={(event) => update("weightKg", event.target.value)} className={fieldClass} /></Field>
            </FormSection>

            <FormSection icon={HeartPulse} title="Medical information" description="Conditions, allergies, and medicines your doctor should know.">
              <Field label="Medical conditions" wide><textarea rows={3} value={profile.medicalConditions} onChange={(event) => update("medicalConditions", event.target.value)} placeholder="e.g. Hypertension, diabetes" className={fieldClass} /></Field>
              <Field label="Allergies" wide><textarea rows={3} value={profile.allergies} onChange={(event) => update("allergies", event.target.value)} placeholder="e.g. Penicillin, peanuts" className={fieldClass} /></Field>
              <Field label="Current medications" wide><textarea rows={3} value={profile.currentMedications} onChange={(event) => update("currentMedications", event.target.value)} placeholder="Medicine, dosage, frequency" className={fieldClass} /></Field>
            </FormSection>

            <FormSection icon={ShieldCheck} title="Insurance details" description="Optional coverage information for your records.">
              <Field label="Insurance provider"><input value={profile.insuranceProvider} onChange={(event) => update("insuranceProvider", event.target.value)} className={fieldClass} /></Field>
              <Field label="Policy number"><input value={profile.insurancePolicyNumber} onChange={(event) => update("insurancePolicyNumber", event.target.value)} className={fieldClass} /></Field>
              <Field label="Policy expiry"><input type="date" value={profile.insuranceExpiry} onChange={(event) => update("insuranceExpiry", event.target.value)} className={fieldClass} /></Field>
            </FormSection>

            <FormSection icon={UsersRound} title="Emergency contact" description="Who should be contacted in an emergency?">
              <Field label="Contact name"><input value={profile.emergencyContactName} onChange={(event) => update("emergencyContactName", event.target.value)} className={fieldClass} /></Field>
              <Field label="Relationship"><input value={profile.emergencyContactRelation} onChange={(event) => update("emergencyContactRelation", event.target.value)} className={fieldClass} /></Field>
              <Field label="Contact phone"><input value={profile.emergencyContactPhone} onChange={(event) => update("emergencyContactPhone", event.target.value)} className={fieldClass} /></Field>
            </FormSection>
          </div>

          <div className="sticky bottom-4 mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white/95 p-4 shadow-xl backdrop-blur">
            <p className="hidden items-center gap-2 text-xs text-[#64748B] sm:flex"><AlertCircle size={15} />Your information stays in this browser for this project.</p>
            <button type="button" onClick={save} disabled={saving} className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"><Save size={16} />{saving ? "Saving..." : "Save profile"}</button>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "block sm:col-span-2" : "block"}><span className="text-sm font-semibold">{label}</span>{children}</label>;
}

function FormSection({ icon: Icon, title, description, children }: { icon: typeof UserRound; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">
      <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[var(--brand)]"><Icon size={18} /></div><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs text-[#64748B]">{description}</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
