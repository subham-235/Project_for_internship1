"use client";
import { useEffect, useMemo, useState, } from "react";
import type { ChangeEvent, FormEvent, } from "react";
import { useParams, useRouter, } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BookingSummary from "@/components/booking/BookingSummary";
import PaymentPanel, { EMPTY_PAYMENT, validatePaymentDraft } from "@/components/booking/PaymentPanel";
import { doctors, } from "@/lib/mock-data/doctors";
import { ensureDoctorSlotsSeeded, createNotification, getAvailableSlotsForDoctor, getCurrentUser, getPatientProfile, getRegisteredDoctors, mergeDoctorProfiles, saveBookingWithSlot, saveLatestBookingId, } from "@/lib/client-storage";
import { deleteMedicalFile, saveMedicalFile, } from "@/lib/file-storage";
import type { Booking, BookingAttachment, } from "@/types/booking";
import type { AppointmentType, } from "@/types/appointment";
import type { Doctor, } from "@/types/doctor";
import type { DoctorSlot, } from "@/types/availability";
import { CalendarDays, Check, Clock3, FileText, MapPin, Paperclip, RefreshCcw, Stethoscope, UserRound, Video, X } from "lucide-react";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PAYMENT_WINDOW_SECONDS = 5 * 60;
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];
const APPOINTMENT_TYPES: AppointmentType[] = [
    "In-person",
    "Video consultation",
    "Follow-up",
];
function to24Hour(time: string) {
    const [clock, period,] = time.split(" ");
    const [initialHours, minutes] = clock
        .split(":")
        .map(Number);
    let hours = initialHours;
    if (period === "PM" &&
        hours !== 12) {
        hours += 12;
    }
    if (period === "AM" &&
        hours === 12) {
        hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}
function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes <
        1024 * 1024) {
        return `${(bytes /
            1024).toFixed(1)} KB`;
    }
    return `${(bytes /
        1024 /
        1024).toFixed(1)} MB`;
}
function createFileId() {
    if (typeof crypto !==
        "undefined" &&
        "randomUUID" in crypto) {
        return `medical-${crypto.randomUUID()}`;
    }
    return `medical-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}
export default function BookingPage() {
    const params = useParams<{
        doctorId: string;
    }>();
    const router = useRouter();
    const [doctor, setDoctor,] = useState<Doctor | null>(null);
    const [availableSlots, setAvailableSlots,] = useState<DoctorSlot[]>([]);
    const [loading, setLoading,] = useState(true);
    const [submitting, setSubmitting,] = useState(false);
    const [date, setDate,] = useState("");
    const [time, setTime,] = useState("");
    const [selectedSlotId, setSelectedSlotId,] = useState("");
    const [appointmentType, setAppointmentType,] = useState<AppointmentType>("In-person");
    const [patientName, setPatientName,] = useState("");
    const [patientEmail, setPatientEmail,] = useState("");
    const [patientPhone, setPatientPhone,] = useState("");
    const [patientAge, setPatientAge,] = useState("");
    const [reason, setReason,] = useState("");
    const [attachment, setAttachment,] = useState<BookingAttachment | undefined>();
    const [selectedFile, setSelectedFile,] = useState<File | null>(null);
    const [fileLoading, setFileLoading,] = useState(false);
    const [error, setError,] = useState("");
    const [payment, setPayment] = useState(EMPTY_PAYMENT);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentSeconds, setPaymentSeconds] = useState(PAYMENT_WINDOW_SECONDS);
    useEffect(() => {
        if (!paymentOpen)
            return;
        const timer = window.setInterval(() => {
            setPaymentSeconds((current) => Math.max(0, current - 1));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [paymentOpen]);
    useEffect(() => {
        if (!paymentOpen || paymentSeconds > 0 || submitting)
            return;
        const currentUser = getCurrentUser();
        createNotification({
            recipientUserId: currentUser?.role === "patient" ? currentUser.id : undefined,
            recipientEmail: patientEmail.trim().toLowerCase() || currentUser?.email,
            type: "payment_failed",
            title: "Payment unsuccessful",
            message: `The payment session for your appointment with ${doctor?.name ?? "the doctor"} expired. No payment was recorded.`,
        });
        setPaymentOpen(false);
        setError("Your five-minute payment session expired. No payment was recorded. Open payment to try again.");
    }, [doctor?.name, patientEmail, paymentOpen, paymentSeconds, submitting]);
    useEffect(() => {
        const profiles = mergeDoctorProfiles(doctors, getRegisteredDoctors());
        const found = profiles.find((item) => item.id ===
            params.doctorId);
        if (!found) {
            setLoading(false);
            return;
        }
        ensureDoctorSlotsSeeded(found.id, found.slots);
        const slots = getAvailableSlotsForDoctor(found.id);
        setDoctor(found);
        setAvailableSlots(slots);
        if (slots.length > 0) {
            setDate(slots[0].date);
        }
        const currentUser = getCurrentUser();
        if (currentUser?.role ===
            "patient") {
            const savedProfile = getPatientProfile(currentUser.id);
            setPatientName(savedProfile?.name || currentUser.name);
            setPatientEmail(currentUser.email);
            setPatientPhone(savedProfile?.phone || "");
            if (savedProfile?.dateOfBirth) {
                const birthDate = new Date(`${savedProfile.dateOfBirth}T00:00:00`);
                const today = new Date();
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate()))
                    calculatedAge -= 1;
                if (calculatedAge > 0)
                    setPatientAge(String(calculatedAge));
            }
        }
        setLoading(false);
    }, [
        params.doctorId,
    ]);
    const availableDates = useMemo(() => Array.from(new Set(availableSlots.map((slot) => slot.date))).sort(), [
        availableSlots,
    ]);
    const slotsForDate = useMemo(() => availableSlots.filter((slot) => slot.date ===
        date), [
        availableSlots,
        date,
    ]);
    const chooseDate = (value: string) => {
        setDate(value);
        setTime("");
        setSelectedSlotId("");
    };
    const chooseSlot = (slot: DoctorSlot) => {
        setTime(slot.time);
        setSelectedSlotId(slot.id);
    };
    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target
            .files?.[0];
        setError("");
        if (!file) {
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError("Only PDF, JPG and PNG files are allowed.");
            event.target.value =
                "";
            return;
        }
        if (file.size >
            MAX_FILE_SIZE) {
            setError("Medical document must be smaller than 5 MB.");
            event.target.value =
                "";
            return;
        }
        setFileLoading(true);
        const fileId = createFileId();
        setAttachment({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
        });
        setSelectedFile(file);
        setFileLoading(false);
    };
    const removeAttachment = () => {
        setAttachment(undefined);
        setSelectedFile(null);
    };
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) {
            return;
        }
        setError("");
        if (!doctor ||
            !selectedSlotId ||
            !date ||
            !time) {
            setError("Please select an available appointment slot.");
            return;
        }
        if (!patientName.trim() ||
            !patientEmail.trim() ||
            !patientPhone.trim() ||
            !patientAge.trim() ||
            !reason.trim()) {
            setError("Please complete all patient details.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(patientEmail.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        const phone = patientPhone.replace(/\D/g, "");
        if (!/^\d{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        const age = Number(patientAge);
        if (!Number.isFinite(age) ||
            age < 1 ||
            age > 120) {
            setError("Please enter a valid patient age.");
            return;
        }
        if (!paymentOpen) {
            setError("");
            setPaymentSeconds(PAYMENT_WINDOW_SECONDS);
            setPaymentOpen(true);
            return;
        }
        const paymentError = validatePaymentDraft(payment);
        if (paymentError) {
            setError(paymentError);
            return;
        }
        setSubmitting(true);
        let fileStored = false;
        try {
            await new Promise((resolve) => window.setTimeout(resolve, 700));
            if (attachment &&
                selectedFile) {
                fileStored =
                    await saveMedicalFile(attachment.id, selectedFile);
                if (!fileStored) {
                    setError("Unable to save your medical document. Please try again.");
                    return;
                }
            }
            const currentUser = getCurrentUser();
            const savedPatientProfile = currentUser?.role === "patient"
                ? getPatientProfile(currentUser.id)
                : null;
            const booking: Booking = {
                id: `apt-${Date.now()}`,
                doctorId: doctor.id,
                doctorName: doctor.name,
                specialty: doctor.specialty,
                doctorLocation: doctor.location,
                slotId: selectedSlotId,
                patientId: currentUser?.role ===
                    "patient"
                    ? currentUser.id
                    : undefined,
                patientName: patientName.trim(),
                patientEmail: patientEmail
                    .trim()
                    .toLowerCase(),
                patientPhone: phone,
                patientAge: age,
                patientProfile: savedPatientProfile ? {
                    dateOfBirth: savedPatientProfile.dateOfBirth,
                    gender: savedPatientProfile.gender,
                    bloodGroup: savedPatientProfile.bloodGroup,
                    heightCm: savedPatientProfile.heightCm,
                    weightKg: savedPatientProfile.weightKg,
                    medicalConditions: savedPatientProfile.medicalConditions,
                    allergies: savedPatientProfile.allergies,
                    currentMedications: savedPatientProfile.currentMedications,
                    emergencyContactName: savedPatientProfile.emergencyContactName,
                    emergencyContactPhone: savedPatientProfile.emergencyContactPhone,
                    emergencyContactRelation: savedPatientProfile.emergencyContactRelation,
                    updatedAt: savedPatientProfile.updatedAt,
                } : undefined,
                reason: reason.trim(),
                appointmentType,
                date,
                time,
                startsAt: `${date}T${to24Hour(time)}`,
                fee: doctor.fee,
                payment: {
                    method: payment.method,
                    status: "paid",
                    amount: doctor.fee,
                    transactionId: payment.method === "upi" && payment.upiMode === "qr"
                        ? payment.upiReference.trim().toUpperCase()
                        : `PAY-${payment.method.toUpperCase()}-${Date.now()}`,
                    paidAt: new Date().toISOString(),
                },
                status: "pending",
                createdAt: new Date()
                    .toISOString(),
                attachment,
            };
            const success = saveBookingWithSlot(booking, selectedSlotId);
            if (!success) {
                if (fileStored &&
                    attachment) {
                    await deleteMedicalFile(attachment.id);
                }
                setError("This slot is no longer available. Please choose another slot.");
                setAvailableSlots(getAvailableSlotsForDoctor(doctor.id));
                setSelectedSlotId("");
                setTime("");
                return;
            }
            saveLatestBookingId(booking.id);
            createNotification({
                recipientUserId: booking.patientId,
                recipientEmail: booking.patientEmail,
                type: "payment_success",
                title: "Payment successful",
                message: `Payment of ₹${booking.fee} was successful for your appointment request with ${booking.doctorName}.`,
                appointmentId: booking.id,
            });
            createNotification({
                recipientUserId: booking.doctorId,
                recipientEmail: doctor.email,
                type: "booking",
                title: "New patient appointment",
                message: `${booking.patientName} requested an appointment. Contact details${booking.patientProfile ? ", health profile," : ""} and visit information are available in your dashboard.`,
                appointmentId: booking.id,
            });
            router.push(`/my-appointments/${booking.id}/intake`);
        }
        catch (submitError) {
            console.error("Booking error:", submitError);
            if (fileStored &&
                attachment) {
                await deleteMedicalFile(attachment.id);
            }
            setError("Unable to complete your booking. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (<>
        <Navbar />

        <main className="grid min-h-[60vh] place-items-center">

          <div className="text-center">

            <div className="mx-auto size-9 animate-spin rounded-full border-4 border-[#dbeafe] border-t-[var(--brand)]"/>

            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading availability...
            </p>

          </div>

        </main>
      </>);
    }
    if (!doctor) {
        return (<>
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-20 text-center">

          <h1 className="text-3xl font-semibold">
            Doctor not found
          </h1>

          <p className="mt-3 text-sm text-[var(--muted)]">
            The requested doctor profile could not be loaded.
          </p>

          <Link href="/doctors" className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white">
            Back to doctors
          </Link>

        </main>
      </>);
    }
    return (<>
      <Navbar />


      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <Link href={`/doctors/${doctor.id}`} className="text-sm font-semibold text-[var(--brand)] hover:underline">
          ← Back to doctor profile
        </Link>

        <ol className="mt-7 hidden grid-cols-6 border-y border-[var(--line)] bg-[var(--card)] sm:grid" aria-label="Booking steps">
          {["Date", "Time", "Appointment type", "Patient information", "Payment", "Confirmation"].map((label, index) => (<li key={label} className="border-r border-[var(--line)] px-3 py-4 last:border-r-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">0{index + 1}</span>
              <span className="mt-1 block text-xs font-semibold">{label}</span>
            </li>))}
        </ol>


        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">

          <form onSubmit={submit} className="space-y-6">



            <section className="rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Appointment Booking
              </p>


              <h1 className="font-editorial mt-2 text-4xl tracking-tight">
                Book your appointment
              </h1>


              <p className="mt-2 text-sm text-[var(--muted)]">

                Request an appointment with{" "}

                <span className="font-semibold text-[var(--foreground)]">
                  {doctor.name}
                </span>

                . The doctor will review and confirm your booking.

              </p>

            </section>



            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 1
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Select available date
                  </h2>

                </div>


                <CalendarDays size={21} className="text-[var(--brand)]"/>

              </div>


              {availableDates.length >
            0 ? (<div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {availableDates.map((item) => {
                const currentDate = new Date(`${item}T00:00:00`);
                return (<button key={item} type="button" onClick={() => chooseDate(item)} className={`rounded-xl border p-3 text-left transition ${date ===
                        item
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "border-[var(--line)] bg-white hover:border-[var(--brand)]"}`}>

                          <span className="block text-xs font-medium">

                            {new Intl.DateTimeFormat("en-IN", {
                        weekday: "short",
                    }).format(currentDate)}

                          </span>


                          <span className="mt-1 block text-sm font-semibold">

                            {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                    }).format(currentDate)}

                          </span>

                        </button>);
            })}

                </div>) : (<div className="mt-5 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4 text-sm text-[#D96B32]">
                  This doctor currently has no available appointment slots.
                </div>)}

            </section>




            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 2
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Select available time
                  </h2>

                </div>


                <span className="text-xl">
                  <Clock3 size={18} className="mx-auto text-[var(--brand)]"/>
                </span>

              </div>


              {slotsForDate.length >
            0 ? (<div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {slotsForDate.map((slot) => (<button key={slot.id} type="button" onClick={() => chooseSlot(slot)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedSlotId ===
                    slot.id
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:text-[var(--brand)]"}`}>
                        {slot.time}
                      </button>))}

                </div>) : (<p className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-sm text-[var(--muted)]">
                  No available time slots for this date.
                </p>)}

            </section>




            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 3
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Appointment type
                  </h2>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Choose how you would like to consult the doctor.
                  </p>

                </div>

                <Stethoscope size={21} className="text-[var(--brand)]"/>

              </div>


              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                {APPOINTMENT_TYPES.map((item) => {
            const selected = appointmentType ===
                item;
            return (<button key={item} type="button" onClick={() => setAppointmentType(item)} className={`rounded-xl border p-4 text-left transition ${selected
                    ? "border-[var(--brand)] bg-[#F8FAFC] text-[var(--brand)]"
                    : "border-[var(--line)] bg-white hover:border-[var(--brand)]"}`}>

                        <span className="text-xl">

                          {item === "In-person" ? <MapPin size={20}/> : item === "Video consultation" ? <Video size={20}/> : <RefreshCcw size={20}/>}

                        </span>


                        <p className="mt-3 text-sm font-semibold">
                          {item}
                        </p>


                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">

                          {item ===
                    "In-person"
                    ? "Visit the doctor's clinic for your consultation."
                    : item ===
                        "Video consultation"
                        ? "Consult remotely through a video appointment."
                        : "Continue treatment or review a previous consultation."}

                        </p>

                      </button>);
        })}

              </div>

            </section>




            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 4
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Patient details
                  </h2>

                </div>


                <UserRound size={21} className="text-[var(--brand)]"/>

              </div>


              <div className="mt-5 grid gap-4 sm:grid-cols-2">



                <label>

                  <span className="text-sm font-medium">
                    Full name
                  </span>

                  <input value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Patient name" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"/>

                </label>




                <label>

                  <span className="text-sm font-medium">
                    Age
                  </span>

                  <input type="number" min="1" max="120" value={patientAge} onChange={(event) => setPatientAge(event.target.value)} placeholder="34" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"/>

                </label>




                <label>

                  <span className="text-sm font-medium">
                    Email
                  </span>

                  <input type="email" value={patientEmail} onChange={(event) => setPatientEmail(event.target.value)} placeholder="patient@example.com" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"/>

                </label>




                <label>

                  <span className="text-sm font-medium">
                    Phone
                  </span>

                  <input inputMode="tel" value={patientPhone} onChange={(event) => setPatientPhone(event.target.value)} placeholder="9876543210" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"/>

                </label>




                <label className="sm:col-span-2">

                  <span className="text-sm font-medium">
                    Reason for consultation
                  </span>

                  <textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly describe the reason for your consultation" className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"/>

                </label>




                <div className="sm:col-span-2">

                  <p className="text-sm font-medium">

                    Medical document{" "}

                    <span className="font-normal text-[var(--muted)]">
                      (optional)
                    </span>

                  </p>


                  {!attachment ? (<label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--line)] bg-[#FFFFFF] px-6 py-8 text-center transition hover:border-[var(--brand)] hover:bg-[#F8FAFC]/30">

                      <Paperclip size={26} className="text-[var(--brand)]"/>


                      <span className="mt-3 text-sm font-semibold">
                        Upload medical report
                      </span>


                      <span className="mt-1 text-xs text-[var(--muted)]">
                        PDF, JPG or PNG · Maximum 5 MB
                      </span>


                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFileUpload} className="hidden"/>

                    </label>) : (<div className="mt-2 rounded-xl border border-[#dbeafe] bg-[#F8FAFC]/50 p-4">

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">

                            <FileText size={15} className="mr-1 inline text-[var(--brand)]"/>{" "}

                            {attachment.name}

                          </p>


                          <p className="mt-1 text-xs text-[var(--muted)]">

                            {formatFileSize(attachment.size)}

                            {" · "}

                            {attachment.type}

                          </p>

                        </div>


                        <button type="button" onClick={removeAttachment} className="shrink-0 text-sm font-semibold text-[#C9362D] hover:underline">
                          Remove
                        </button>

                      </div>


                      <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-[#C9362D]">
                        <Check size={14} className="mr-1 inline"/> File ready to upload with this appointment request
                      </div>

                    </div>)}


                  {fileLoading && (<p className="mt-2 text-xs text-[var(--muted)]">
                      Processing file...
                    </p>)}

                </div>

              </div>

            </section>




            {error && (<div role="alert" className="rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm text-[#C9362D]">
                {error}
              </div>)}




            <button type="submit" disabled={fileLoading ||
            submitting ||
            availableSlots.length ===
                0} className="w-full rounded-xl bg-[var(--brand)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-50">

              {submitting
            ? "Processing payment securely..."
            : "Continue to Payment"}

            </button>


            <p className="text-center text-xs text-[var(--muted)]">
              Payment is recorded immediately. Your appointment remains pending until the doctor confirms it.
            </p>

            {paymentOpen && (<div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B1329]/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Appointment payment">
                <button type="button" aria-label="Close payment" onClick={() => !submitting && setPaymentOpen(false)} className="absolute inset-0 cursor-default"/>
                <div className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[22px] bg-white shadow-[0_30px_100px_rgba(11,19,41,0.35)]">
                  <button type="button" onClick={() => setPaymentOpen(false)} disabled={submitting} aria-label="Close payment popup" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur hover:bg-white/20 disabled:opacity-50"><X size={18}/></button>
                  <PaymentPanel amount={doctor.fee} value={payment} onChange={setPayment} timeRemaining={paymentSeconds}/>
                  <div className="border-t border-[#E2E8F0] bg-white p-4 sm:px-6">
                    {error && <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <button type="button" onClick={() => setPaymentOpen(false)} disabled={submitting} className="rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-50">Back to booking</button>
                      <button type="submit" disabled={submitting} className="rounded-xl bg-[#2563EB] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#0B1329] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Processing payment..." : `Pay ₹${doctor.fee} & Request Appointment`}</button>
                    </div>
                  </div>
                </div>
              </div>)}

          </form>




          <BookingSummary doctor={doctor} date={date} time={time}/>

        </div>

      </main>
    </>);
}
