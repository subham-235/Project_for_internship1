"use client";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleUserRound,
  FileText,
  LayoutDashboard,
  ListChecks,
  Pencil,
  Pill,
  Plus,
  Search,
  Save,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

import PrescriptionPdfButton from "@/components/prescriptions/PrescriptionPdfButton";
import PrescriptionView from "@/components/prescriptions/PrescriptionView";
import {
  getBookingById,
  getBookingsForDoctor,
  getCurrentUser,
  getPrescriptions,
  getRegisteredDoctors,
  mergeDoctorProfiles,
  savePrescription,
} from "@/lib/client-storage";
import { doctors } from "@/lib/mock-data/doctors";
import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";
import type { Prescription, PrescriptionMedicine } from "@/types/prescription";

type PrescriptionRecord = {
  prescription: Prescription;
  booking: Booking;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function emptyMedicine(): PrescriptionMedicine {
  return {
    id: `medicine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    dosage: "",
    duration: "",
    instructions: "",
  };
}

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [formBookingId, setFormBookingId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [treatmentGoal, setTreatmentGoal] = useState("");
  const [selfCareInstructions, setSelfCareInstructions] = useState("");
  const [recommendedTests, setRecommendedTests] = useState("");
  const [warningSigns, setWarningSigns] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([emptyMedicine()]);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "doctor") {
      router.replace("/login");
      return;
    }
    const profiles = mergeDoctorProfiles(doctors, getRegisteredDoctors());
    const doctor = profiles.find((item) => item.userId === user.id) ??
      profiles.find((item) => item.id === user.id) ??
      profiles.find((item) => normalize(item.name) === normalize(user.name));
    if (!doctor) {
      router.replace("/doctor-dashboard");
      return;
    }
    const items = getPrescriptions()
      .filter((item) => item.doctorId === doctor.id || normalize(item.doctorName) === normalize(doctor.name))
      .map((prescription) => {
        const booking = getBookingById(prescription.bookingId);
        return booking ? { prescription, booking } : null;
      })
      .filter((item): item is PrescriptionRecord => item !== null)
      .sort((a, b) => new Date(b.prescription.updatedAt ?? b.prescription.createdAt).getTime() - new Date(a.prescription.updatedAt ?? a.prescription.createdAt).getTime());
    const completed = getBookingsForDoctor(doctor.id, doctor.name).filter(
      (booking) => booking.status === "completed",
    );
    setCompletedBookings(completed);
    setProfile(doctor);
    setRecords(items);
    setSelectedId(items[0]?.prescription.id ?? "");
    const query = new URLSearchParams(window.location.search);
    const requestedBookingId = query.get("bookingId");
    if (query.get("create") === "1" && requestedBookingId && completed.some((booking) => booking.id === requestedBookingId)) {
      setFormBookingId(requestedBookingId);
      setDiagnosis("");
      setInstructions("");
      setTreatmentGoal("");
      setSelfCareInstructions("");
      setRecommendedTests("");
      setWarningSigns("");
      setFollowUpDate("");
      setFollowUpNotes("");
      setMedicines([emptyMedicine()]);
      setFormOpen(true);
    }
    setLoading(false);
  }, [router]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return records;
    return records.filter(({ booking, prescription }) =>
      booking.patientName.toLowerCase().includes(search) ||
      prescription.diagnosis.toLowerCase().includes(search) ||
      prescription.medications.some((medicine) => medicine.toLowerCase().includes(search)),
    );
  }, [query, records]);

  const selected = records.find((item) => item.prescription.id === selectedId) ?? visible[0] ?? null;

  const refreshRecords = () => {
    if (!profile) return;
    const items = getPrescriptions()
      .filter((item) => item.doctorId === profile.id || normalize(item.doctorName) === normalize(profile.name))
      .map((prescription) => {
        const booking = getBookingById(prescription.bookingId);
        return booking ? { prescription, booking } : null;
      })
      .filter((item): item is PrescriptionRecord => item !== null)
      .sort((a, b) => new Date(b.prescription.updatedAt ?? b.prescription.createdAt).getTime() - new Date(a.prescription.updatedAt ?? a.prescription.createdAt).getTime());
    setRecords(items);
    return items;
  };

  const openCreate = () => {
    const withoutPrescription = completedBookings.find(
      (booking) => !records.some((item) => item.booking.id === booking.id),
    );
    setEditingId("");
    setFormBookingId(withoutPrescription?.id ?? completedBookings[0]?.id ?? "");
    setDiagnosis("");
    setInstructions("");
    setTreatmentGoal("");
    setSelfCareInstructions("");
    setRecommendedTests("");
    setWarningSigns("");
    setFollowUpDate("");
    setFollowUpNotes("");
    setMedicines([emptyMedicine()]);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (record: PrescriptionRecord) => {
    const existingMedicines = record.prescription.medicines?.length
      ? record.prescription.medicines
      : record.prescription.medications.map((name, index) => ({
          id: `legacy-${index}`,
          name,
          dosage: "",
          duration: "",
          instructions: "",
        }));
    setEditingId(record.prescription.id);
    setFormBookingId(record.booking.id);
    setDiagnosis(record.prescription.diagnosis);
    setInstructions(record.prescription.notes);
    setTreatmentGoal(record.prescription.carePlan?.treatmentGoal ?? "");
    setSelfCareInstructions(record.prescription.carePlan?.selfCareInstructions ?? "");
    setRecommendedTests(record.prescription.carePlan?.recommendedTests ?? "");
    setWarningSigns(record.prescription.carePlan?.warningSigns ?? "");
    setFollowUpDate(record.prescription.carePlan?.followUpDate ?? "");
    setFollowUpNotes(record.prescription.carePlan?.followUpNotes ?? "");
    setMedicines(existingMedicines.length ? existingMedicines : [emptyMedicine()]);
    setFormError("");
    setFormOpen(true);
  };

  const updateMedicine = (
    id: string,
    field: keyof Omit<PrescriptionMedicine, "id">,
    value: string,
  ) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id ? { ...medicine, [field]: value } : medicine,
      ),
    );
  };

  const saveForm = () => {
    if (!profile) return;
    const booking = completedBookings.find((item) => item.id === formBookingId);
    if (!booking) {
      setFormError("Select a completed appointment.");
      return;
    }
    if (!diagnosis.trim()) {
      setFormError("Diagnosis is required.");
      return;
    }
    const cleanedMedicines = medicines
      .map((medicine) => ({
        ...medicine,
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions.trim(),
      }))
      .filter((medicine) => medicine.name);
    if (!cleanedMedicines.length) {
      setFormError("Add at least one medicine.");
      return;
    }
    if (!treatmentGoal.trim() || !selfCareInstructions.trim() || !warningSigns.trim()) {
      setFormError("Treatment goal, self-care instructions and warning signs are required for the care plan.");
      return;
    }
    if (cleanedMedicines.some((medicine) => !medicine.dosage || !medicine.duration)) {
      setFormError("Dosage and duration are required for every medicine.");
      return;
    }
    const existing = editingId
      ? records.find((item) => item.prescription.id === editingId)?.prescription
      : undefined;
    const now = new Date().toISOString();
    const prescription: Prescription = {
      id: existing?.id ?? `prescription-${Date.now()}`,
      bookingId: booking.id,
      doctorId: profile.id,
      doctorName: profile.name,
      patientName: booking.patientName,
      diagnosis: diagnosis.trim(),
      medicines: cleanedMedicines,
      medications: cleanedMedicines.map((medicine) =>
        [medicine.name, medicine.dosage, medicine.duration, medicine.instructions]
          .filter(Boolean)
          .join(" - "),
      ),
      notes: instructions.trim(),
      carePlan: {
        treatmentGoal: treatmentGoal.trim(),
        selfCareInstructions: selfCareInstructions.trim(),
        recommendedTests: recommendedTests.trim(),
        warningSigns: warningSigns.trim(),
        followUpDate,
        followUpNotes: followUpNotes.trim(),
        publishedAt: now,
      },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    if (!savePrescription(prescription)) {
      setFormError("Unable to save the prescription. Please try again.");
      return;
    }
    const updated = refreshRecords();
    setSelectedId(prescription.id);
    setFormOpen(false);
    setMessage(existing ? "Prescription updated. The patient record is now synchronized." : "Prescription created. It is now available to the patient.");
    if (!updated?.length) setRecords([{ prescription, booking }]);
    window.setTimeout(() => setMessage(""), 4000);
  };

  if (loading || !profile) {
    return <main className="grid min-h-screen place-items-center bg-[#F8FAFC] text-sm text-[var(--muted)]">Loading prescriptions...</main>;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1329] lg:pl-[17.5rem]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] flex-col bg-[#0B1329] px-4 text-white lg:flex">
        <Link href="/" className="flex h-20 items-center gap-3 border-b border-white/10 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329]"><Stethoscope size={21} /></div>
          <div><p className="text-lg font-bold">Schedula</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/55">Doctor workspace</p></div>
        </Link>
        <nav className="mt-7 space-y-1.5" aria-label="Doctor workspace navigation">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dbeafe]/40">Workspace</p>
          <Link href="/doctor-dashboard" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white"><LayoutDashboard size={18} />Overview</Link>
          <Link href="/doctor-dashboard/appointments" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white"><ListChecks size={18} />Appointments</Link>
          <Link href="/doctor-dashboard/prescriptions" className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-[#0B1329] shadow-sm"><Pill size={18} />Prescriptions</Link>
          <Link href="/doctor-dashboard/profile" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white"><CircleUserRound size={18} />Profile</Link>
        </nav>
        <div className="mt-auto mb-4 rounded-xl border border-white/10 bg-white/7 p-4">
          <p className="truncate text-sm font-semibold">{profile.name}</p>
          <p className="mt-1 truncate text-xs text-[#dbeafe]/55">{profile.specialty}</p>
        </div>
      </aside>

      <div className="mx-auto max-w-[94rem] px-4 py-6 sm:px-7 xl:px-10">
        <section className="border-l-4 border-[#2563eb] bg-[#0B1329] p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Clinical records</p>
          <h1 className="font-editorial mt-3 text-4xl tracking-tight">Prescriptions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Review issued prescriptions, find a patient record, and download a polished copy for your files.</p>
        </section>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#64748B]">
            Prescriptions can only be created for completed appointments.
          </p>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1329] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B1329]">
            <Plus size={16} /> New prescription
          </button>
        </div>

        {message && (
          <div role="status" className="mt-4 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#C9362D]">
            {message}
          </div>
        )}

        <div className="mt-5 grid border-y border-[#E2E8F0] bg-white sm:grid-cols-3">
          <article className="border-b border-[#E2E8F0] p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-semibold text-[#64748B]">Issued records</p><p className="font-editorial mt-1 text-3xl">{records.length}</p></article>
          <article className="border-b border-[#E2E8F0] p-4 sm:border-b-0 sm:border-r"><p className="text-xs font-semibold text-[#64748B]">Patients covered</p><p className="font-editorial mt-1 text-3xl">{new Set(records.map((item) => item.booking.patientEmail)).size}</p></article>
          <article className="p-4"><p className="text-xs font-semibold text-[#64748B]">Latest issued</p><p className="mt-2 text-sm font-bold">{records[0] ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(records[0].prescription.updatedAt ?? records[0].prescription.createdAt)) : "No records yet"}</p></article>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <section className="h-fit overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_8px_24px_rgba(11,19,41,0.04)]">
            <div className="border-b border-[#E2E8F0] p-4">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient or diagnosis" className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--brand)]" />
              </label>
            </div>
            {visible.length ? (
              <div className="max-h-[42rem] divide-y divide-[#E2E8F0] overflow-y-auto">
                {visible.map(({ prescription, booking }) => (
                  <button key={prescription.id} type="button" onClick={() => setSelectedId(prescription.id)} className={`w-full p-4 text-left transition ${selected?.prescription.id === prescription.id ? "bg-[#F8FAFC] shadow-[inset_3px_0_0_#2563eb]" : "hover:bg-[#F8FAFC]"}`}>
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dbeafe] text-[var(--brand)]"><FileText size={17} /></div>
                      <div className="min-w-0"><p className="truncate text-sm font-bold">{booking.patientName}</p><p className="mt-1 line-clamp-1 text-xs text-[#64748B]">{prescription.diagnosis}</p><p className="mt-2 text-[10px] font-semibold text-[var(--brand)]">{prescription.medications.length} medication{prescription.medications.length === 1 ? "" : "s"}</p></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center"><Pill className="mx-auto text-[#E2E8F0]" size={24} /><p className="mt-3 text-sm font-bold">No prescriptions found</p><p className="mt-1 text-xs text-[#64748B]">Completed appointment prescriptions will appear here.</p></div>
            )}
          </section>

          <section className="min-w-0">
            {selected ? (
              <>
                <div className="mb-4 flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={() => openEdit(selected)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand)] hover:bg-[#F8FAFC]">
                    <Pencil size={16} /> Edit prescription
                  </button>
                  <PrescriptionPdfButton booking={selected.booking} prescription={selected.prescription} />
                </div>
                <PrescriptionView booking={selected.booking} prescription={selected.prescription} />
              </>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#E2E8F0] bg-white p-12 text-center"><Pill className="mx-auto text-[#E2E8F0]" size={28} /><p className="mt-4 font-bold">Select a prescription</p><p className="mt-1 text-sm text-[#64748B]">Choose a patient record to review it here.</p></div>
            )}
          </section>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1329]/60 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="prescription-form-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[18px] bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E2E8F0] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Prescription editor</p>
                <h2 id="prescription-form-title" className="mt-1 text-xl font-bold">{editingId ? "Update prescription" : "Create prescription"}</h2>
                <p className="mt-1 text-xs text-[#64748B]">Changes are immediately reflected in the patient’s completed appointment.</p>
              </div>
              <button type="button" aria-label="Close prescription editor" onClick={() => setFormOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"><X size={18} /></button>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
              {formError && <div role="alert" className="rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#C9362D]">{formError}</div>}

              <label className="block">
                <span className="text-sm font-semibold">Completed appointment</span>
                <select value={formBookingId} disabled={Boolean(editingId)} onChange={(event) => setFormBookingId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-65">
                  <option value="">Select patient appointment</option>
                  {completedBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>{booking.patientName} - {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(booking.startsAt))}</option>
                  ))}
                </select>
                {!completedBookings.length && <p className="mt-2 text-xs text-[#D96B32]">No completed appointments are available yet.</p>}
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Diagnosis</span>
                <textarea rows={3} value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} placeholder="Enter the clinical diagnosis" className="mt-2 w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--brand)]" />
              </label>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div><h3 className="text-sm font-semibold">Medicines</h3><p className="mt-1 text-xs text-[#64748B]">Include dosage, duration, and patient-facing directions.</p></div>
                  <button type="button" onClick={() => setMedicines((current) => [...current, emptyMedicine()])} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[var(--brand)]"><Plus size={14} /> Add medicine</button>
                </div>

                <div className="mt-3 space-y-3">
                  {medicines.map((medicine, index) => (
                    <div key={medicine.id} className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4">
                      <div className="flex items-center justify-between"><p className="text-xs font-bold text-[var(--brand)]">Medicine {index + 1}</p><button type="button" aria-label={`Remove medicine ${index + 1}`} disabled={medicines.length === 1} onClick={() => setMedicines((current) => current.filter((item) => item.id !== medicine.id))} className="grid size-8 place-items-center rounded-lg text-[#2563eb] hover:bg-[#F8FAFC] disabled:opacity-30"><Trash2 size={15} /></button></div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-[#64748B]">Medicine name<input value={medicine.name} onChange={(event) => updateMedicine(medicine.id, "name", event.target.value)} placeholder="e.g. Paracetamol 500 mg" className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0B1329] outline-none focus:border-[var(--brand)]" /></label>
                        <label className="text-xs font-semibold text-[#64748B]">Dosage<input value={medicine.dosage} onChange={(event) => updateMedicine(medicine.id, "dosage", event.target.value)} placeholder="e.g. 1 tablet twice daily" className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0B1329] outline-none focus:border-[var(--brand)]" /></label>
                        <label className="text-xs font-semibold text-[#64748B]">Duration<input value={medicine.duration} onChange={(event) => updateMedicine(medicine.id, "duration", event.target.value)} placeholder="e.g. 5 days" className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0B1329] outline-none focus:border-[var(--brand)]" /></label>
                        <label className="text-xs font-semibold text-[#64748B]">Medicine instructions<input value={medicine.instructions} onChange={(event) => updateMedicine(medicine.id, "instructions", event.target.value)} placeholder="e.g. Take after food" className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0B1329] outline-none focus:border-[var(--brand)]" /></label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <label className="block">
                <span className="text-sm font-semibold">General instructions</span>
                <textarea rows={4} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Diet, activity, follow-up, warning signs, or other care instructions" className="mt-2 w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--brand)]" />
              </label>

              <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">Structured care plan</p><h3 className="mt-1 text-base font-bold text-slate-900">Recovery and follow-up plan</h3><p className="mt-1 text-xs leading-5 text-slate-500">This plan is published with the prescription and becomes visible in the patient portal.</p></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2"><span className="text-xs font-bold text-slate-700">Treatment goal *</span><input value={treatmentGoal} onChange={(event) => setTreatmentGoal(event.target.value)} placeholder="For example: Control fever and restore normal hydration" className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>
                  <label><span className="text-xs font-bold text-slate-700">Self-care instructions *</span><textarea rows={4} value={selfCareInstructions} onChange={(event) => setSelfCareInstructions(event.target.value)} placeholder="Rest, hydration, diet and activity guidance" className="mt-2 w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500" /></label>
                  <label><span className="text-xs font-bold text-slate-700">Warning signs *</span><textarea rows={4} value={warningSigns} onChange={(event) => setWarningSigns(event.target.value)} placeholder="Symptoms that require urgent review" className="mt-2 w-full resize-none rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-rose-500" /></label>
                  <label><span className="text-xs font-bold text-slate-700">Recommended tests</span><textarea rows={3} value={recommendedTests} onChange={(event) => setRecommendedTests(event.target.value)} placeholder="Tests, imaging or monitoring instructions" className="mt-2 w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500" /></label>
                  <label><span className="text-xs font-bold text-slate-700">Follow-up instructions</span><textarea rows={3} value={followUpNotes} onChange={(event) => setFollowUpNotes(event.target.value)} placeholder="What to bring and what will be reviewed" className="mt-2 w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500" /></label>
                  <label><span className="text-xs font-bold text-slate-700">Follow-up date</span><input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" /></label>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-semibold">Cancel</button>
                <button type="button" onClick={saveForm} disabled={!completedBookings.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} />{editingId ? "Update care plan" : "Publish prescription & care plan"}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
