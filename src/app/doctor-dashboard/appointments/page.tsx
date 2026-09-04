"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, } from "react";
import { useRouter, } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, Clock3, FileText, LayoutDashboard, ListChecks, Mail, MapPin, Paperclip, Pill, Phone, Search, Stethoscope, UserRound, UsersRound, } from "lucide-react";
import type { Booking, BookingStatus, } from "@/types/booking";
import type { Doctor, } from "@/types/doctor";
import type { DoctorSlot, } from "@/types/availability";
import { cancelBooking, confirmBooking, declineBooking, getAvailableSlotsForDoctor, getBookingsForDoctor, getCurrentUser, getRegisteredDoctors, markBookingCompleted, markBookingMissed, mergeDoctorProfiles, rescheduleBooking, } from "@/lib/client-storage";
import { downloadMedicalFile, viewMedicalFile, } from "@/lib/file-storage";
import { doctors, } from "@/lib/mock-data/doctors";
import StatCard from "@/components/ui/StatCard";
import PatientHealthSnapshot from "@/components/doctor/PatientHealthSnapshot";
import PatientIntakeSummary from "@/components/doctor/PatientIntakeSummary";
type Filter = "all" | "pending" | "confirmed" | "upcoming" | "completed" | "cancelled" | "missed";
const filters: Filter[] = [
    "all",
    "pending",
    "confirmed",
    "upcoming",
    "completed",
    "cancelled",
    "missed",
];
function normalize(value: string) {
    return value
        .trim()
        .toLowerCase();
}
function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}
function formatTime(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
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
function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]
        ?.toUpperCase())
        .join("");
}
function getStatusClasses(status: BookingStatus) {
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
function legacyDataUrlToBlob(dataUrl: string) {
    const [header, encoded,] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);base64/)?.[1] ??
        "application/octet-stream";
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index <
        binary.length; index++) {
        bytes[index] =
            binary.charCodeAt(index);
    }
    return new Blob([
        bytes,
    ], {
        type: mime,
    });
}
export default function AllAppointmentsPage() {
    const router = useRouter();
    const [profile, setProfile,] = useState<Doctor | null>(null);
    const [bookings, setBookings,] = useState<Booking[]>([]);
    const [selectedId, setSelectedId,] = useState("");
    const [filter, setFilter,] = useState<Filter>("all");
    const [query, setQuery,] = useState("");
    const [dateFilter, setDateFilter,] = useState("");
    const [loading, setLoading,] = useState(true);
    const [message, setMessage,] = useState("");
    const [error, setError,] = useState("");
    const [confirmation, setConfirmation] = useState<{
        title: string;
        description: string;
        action: () => void;
    } | null>(null);
    const [rescheduling, setRescheduling,] = useState(false);
    const [availableSlots, setAvailableSlots,] = useState<DoctorSlot[]>([]);
    const [selectedRescheduleDate, setSelectedRescheduleDate,] = useState("");
    const loadBookings = useCallback((doctor: Doctor) => {
        const items = getBookingsForDoctor(doctor.id, doctor.name);
        setBookings(items);
        setSelectedId((current) => {
            if (current &&
                items.some((item) => item.id ===
                    current)) {
                return current;
            }
            return (items[0]?.id ??
                "");
        });
    }, []);
    useEffect(() => {
        const user = getCurrentUser();
        if (!user ||
            user.role !==
                "doctor") {
            router.replace("/login");
            return;
        }
        const allDoctors = mergeDoctorProfiles(doctors, getRegisteredDoctors());
        const found = allDoctors.find((doctor) => doctor.userId ===
            user.id) ??
            allDoctors.find((doctor) => doctor.id ===
                user.id) ??
            allDoctors.find((doctor) => normalize(doctor.name) ===
                normalize(user.name));
        if (!found) {
            router.replace("/doctor-dashboard");
            return;
        }
        setProfile(found);
        loadBookings(found);
        setLoading(false);
    }, [
        router,
        loadBookings,
    ]);
    useEffect(() => {
        if (!profile) {
            return;
        }
        const handleFocus = () => {
            loadBookings(profile);
        };
        window.addEventListener("focus", handleFocus);
        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [
        profile,
        loadBookings,
    ]);
    const visible = useMemo(() => bookings.filter((booking) => {
        const now = Date.now();
        const appointmentTime = new Date(booking.startsAt).getTime();
        let matchesStatus = true;
        if (filter ===
            "upcoming") {
            matchesStatus =
                appointmentTime >
                    now &&
                    (booking.status ===
                        "pending" ||
                        booking.status ===
                            "confirmed");
        }
        else if (filter !==
            "all") {
            matchesStatus =
                booking.status ===
                    filter;
        }
        const search = query
            .trim()
            .toLowerCase();
        const matchesSearch = !search ||
            booking.patientName
                .toLowerCase()
                .includes(search) ||
            booking.patientEmail
                .toLowerCase()
                .includes(search) ||
            booking.reason
                .toLowerCase()
                .includes(search);
        const matchesDate = !dateFilter ||
            booking.date ===
                dateFilter;
        return (matchesStatus &&
            matchesSearch &&
            matchesDate);
    }), [
        bookings,
        filter,
        query,
        dateFilter,
    ]);
    useEffect(() => {
        if (visible.length ===
            0) {
            setSelectedId("");
            return;
        }
        const exists = visible.some((booking) => booking.id ===
            selectedId);
        if (!exists) {
            setSelectedId(visible[0].id);
        }
    }, [
        visible,
        selectedId,
    ]);
    const selected = bookings.find((booking) => booking.id ===
        selectedId) ??
        null;
    const counts = useMemo(() => {
        const now = Date.now();
        return {
            all: bookings.length,
            pending: bookings.filter((booking) => booking.status ===
                "pending").length,
            confirmed: bookings.filter((booking) => booking.status ===
                "confirmed").length,
            upcoming: bookings.filter((booking) => new Date(booking.startsAt).getTime() >
                now &&
                (booking.status ===
                    "pending" ||
                    booking.status ===
                        "confirmed")).length,
            completed: bookings.filter((booking) => booking.status ===
                "completed").length,
            cancelled: bookings.filter((booking) => booking.status ===
                "cancelled").length,
            missed: bookings.filter((booking) => booking.status ===
                "missed").length,
        };
    }, [
        bookings,
    ]);
    const runAction = (action: () => Booking | null, successMessage: string) => {
        if (!profile) {
            return;
        }
        setError("");
        setMessage("");
        const result = action();
        if (!result) {
            setError("Unable to update this appointment.");
            return;
        }
        loadBookings(profile);
        setRescheduling(false);
        setMessage(successMessage);
    };
    const openReschedule = () => {
        if (!profile ||
            !selected) {
            return;
        }
        const slots = getAvailableSlotsForDoctor(profile.id);
        setAvailableSlots(slots);
        setSelectedRescheduleDate(slots[0]?.date ??
            "");
        setRescheduling(true);
        setError("");
        setMessage("");
    };
    const rescheduleDates = useMemo(() => Array.from(new Set(availableSlots.map((slot) => slot.date))).sort(), [
        availableSlots,
    ]);
    const rescheduleSlots = useMemo(() => availableSlots.filter((slot) => slot.date ===
        selectedRescheduleDate), [
        availableSlots,
        selectedRescheduleDate,
    ]);
    const applyReschedule = (slot: DoctorSlot) => {
        if (!selected ||
            !profile) {
            return;
        }
        setError("");
        setMessage("");
        const result = rescheduleBooking(selected.id, slot.id);
        if (!result) {
            setError("Unable to reschedule. The selected slot may no longer be available.");
            setAvailableSlots(getAvailableSlotsForDoctor(profile.id));
            return;
        }
        loadBookings(profile);
        setRescheduling(false);
        setMessage("New time proposed. This appointment is pending patient approval.");
    };
    const viewAttachment = async (booking: Booking) => {
        setError("");
        const attachment = booking.attachment;
        if (!attachment) {
            return;
        }
        if (attachment.dataUrl) {
            const blob = legacyDataUrlToBlob(attachment.dataUrl);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            return;
        }
        const success = await viewMedicalFile(attachment.id);
        if (!success) {
            setError("Medical document could not be opened.");
        }
    };
    const downloadAttachment = async (booking: Booking) => {
        setError("");
        const attachment = booking.attachment;
        if (!attachment) {
            return;
        }
        if (attachment.dataUrl) {
            const blob = legacyDataUrlToBlob(attachment.dataUrl);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href =
                url;
            anchor.download =
                attachment.name;
            anchor.click();
            URL.revokeObjectURL(url);
            return;
        }
        const success = await downloadMedicalFile(attachment.id);
        if (!success) {
            setError("Medical document could not be downloaded.");
        }
    };
    if (loading) {
        return (<main className="grid min-h-screen place-items-center">

        <div className="text-center">

          <div className="mx-auto size-9 animate-spin rounded-full border-4 border-[#dbeafe] border-t-[var(--brand)]"/>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Loading appointments...
          </p>

        </div>

      </main>);
    }
    return (<main className="min-h-screen bg-[#F8FAFC] text-[#0B1329] lg:pl-[17.5rem]">

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] flex-col bg-[#0B1329] px-4 text-white lg:flex">
        <Link href="/" className="flex h-20 items-center gap-3 border-b border-white/10 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329]">
            <Stethoscope size={21}/>
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">Schedula</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/55">
              Doctor workspace
            </p>
          </div>
        </Link>

        <nav className="mt-7 space-y-1.5" aria-label="Doctor workspace navigation">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dbeafe]/40">
            Workspace
          </p>

          <Link href="/doctor-dashboard" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white">
            <LayoutDashboard size={18}/> Overview
          </Link>

          <Link href="/doctor-dashboard/appointments" className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-[#0B1329] shadow-sm">
            <ListChecks size={18}/> Appointments
          </Link>

          <Link href="/doctor-dashboard/prescriptions" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white">
            <Pill size={18}/> Prescriptions
          </Link>

          <Link href="/doctor-dashboard/profile" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white">
            <CircleUserRound size={18}/> Profile
          </Link>
        </nav>

        {profile && (<div className="mt-auto mb-4 rounded-xl border border-white/10 bg-white/7 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dbeafe] text-sm font-bold text-[#0B1329]">
                {profile.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{profile.name}</p>
                <p className="truncate text-xs text-[#dbeafe]/55">{profile.specialty}</p>
              </div>
            </div>
          </div>)}
      </aside>

      <div className="mx-auto max-w-[94rem] px-4 py-5 sm:px-7 sm:py-7 xl:px-10">

        <Link href="/doctor-dashboard" className="inline-flex rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand)] shadow-sm hover:border-[var(--brand)] lg:hidden">
          ← Back to dashboard
        </Link>




        <div className="relative mt-5 overflow-hidden rounded-[18px] bg-[#2563eb] p-6 text-white shadow-[0_18px_50px_rgba(11,19,41,0.14)] sm:p-8 lg:mt-0">

          <div className="absolute -right-20 -top-28 size-72 rounded-full border-[44px] border-white/6"/>

          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/75">
            Clinical work queue
          </p>

          <h1 className="relative mt-2 text-3xl font-bold tracking-tight">
            Appointments
          </h1>

          <p className="relative mt-2 max-w-2xl text-sm leading-6 text-[#F8FAFC]/75">
            Review patient requests, prepare for upcoming consultations, and complete follow-up care from one focused workspace.
          </p>

        </div>


        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Appointment summary">
          <StatCard label="All appointments" value={counts.all} icon={UsersRound} tone="brand"/>
          <StatCard label="Awaiting review" value={counts.pending} icon={Clock3} tone="warning"/>
          <StatCard label="Confirmed" value={counts.confirmed} icon={CheckCircle2} tone="success"/>
          <StatCard label="Completed" value={counts.completed} icon={FileText} tone="success"/>
        </section>




        {message && (<div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#C9362D]">
            <CheckCircle2 size={15} className="mr-1 inline"/> {message}
          </div>)}




        {error && (<div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm text-[#C9362D]">
            {error}
          </div>)}




        <section className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-[0_8px_24px_rgba(11,19,41,0.04)]">

          <div className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Search size={16} className="text-[var(--brand)]"/>
            Find an appointment
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">

            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, email or reason..." className="rounded-xl border border-[var(--line)] bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white"/>


            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-xl border border-[var(--line)] bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white"/>

          </div>


          <div className="mt-4 flex flex-wrap gap-2">

            {filters.map((item) => (<button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${filter ===
                item
                ? "bg-[var(--brand)] text-white"
                : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white"}`}>

                  {item}

                  <span className="ml-1.5 text-xs opacity-80">
                    {counts[item]}
                  </span>

                </button>))}


            {(dateFilter ||
            query) && (<button type="button" onClick={() => {
                setQuery("");
                setDateFilter("");
            }} className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:border-[#dbeafe] hover:text-[#C9362D]">
                Clear filters
              </button>)}

          </div>

        </section>




        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_26rem]">



          <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_8px_24px_rgba(11,19,41,0.04)]">

            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">

              <div>

                <p className="font-bold">
                  Patient queue
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Select a patient to review and take action
                </p>

              </div>

              <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[var(--brand)]">
                {visible.length} result{visible.length === 1 ? "" : "s"}
              </span>

            </div>


            {visible.length >
            0 ? (<div className="divide-y divide-[var(--line)]">

                {visible.map((booking) => (<button key={booking.id} type="button" onClick={() => {
                    setSelectedId(booking.id);
                    setRescheduling(false);
                    setMessage("");
                    setError("");
                }} className={`w-full p-5 text-left transition ${selectedId ===
                    booking.id
                    ? "bg-[#F8FAFC] shadow-[inset_3px_0_0_#2563eb]"
                    : "hover:bg-[#F8FAFC]"}`}>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#dbeafe] text-sm font-bold text-[var(--brand)]">

                            {getInitials(booking.patientName)}

                          </div>


                          <div className="min-w-0">

                            <p className="font-semibold">
                              {booking.patientName}
                            </p>


                            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                              {booking.reason}
                            </p>


                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[var(--muted)]">

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={13}/>
                                {formatDate(booking.startsAt)}
                              </span>


                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13}/>
                                {formatTime(booking.startsAt)}
                              </span>


                              <span className="inline-flex items-center gap-1.5">
                                <Stethoscope size={13}/>
                                {booking.appointmentType ??
                    "In-person"}
                              </span>

                            </div>


                            {booking.attachment && (<p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)]">
                                <Paperclip size={13}/> Medical document attached
                              </p>)}

                          </div>

                        </div>


                        <div className="flex items-center gap-2">
                          <span className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(booking.status)}`}>
                            {booking.status}
                          </span>

                          <span className="grid size-8 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B]">
                            <ChevronRight size={15}/>
                          </span>
                        </div>

                      </div>

                    </button>))}

              </div>) : (<div className="p-14 text-center">

                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#F8FAFC] text-[#64748B]">
                  <UserRound size={20}/>
                </div>

                <p className="mt-4 font-semibold">
                  No appointments found
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Try changing your search or filters.
                </p>

              </div>)}

          </section>




          <aside className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] xl:sticky xl:top-6">

            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
              <FileText size={14}/> Appointment details
            </p>


            {selected ? (<div className="mt-5">



                <div className="flex items-center gap-3">

                  <div className="grid size-12 place-items-center rounded-xl bg-[#dbeafe] text-sm font-bold text-[var(--brand)]">

                    {getInitials(selected.patientName)}

                  </div>


                  <div>

                    <h2 className="font-semibold">
                      {selected.patientName}
                    </h2>

                    <p className="text-xs text-[var(--muted)]">
                      {selected.patientAge}{" "}
                      years old
                    </p>

                  </div>

                </div>




                <span className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(selected.status)}`}>
                  {selected.status}
                </span>




                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1 [&>div]:rounded-xl [&>div]:bg-[#F8FAFC] [&>div]:p-3.5">

                  <div>

                    <dt className="text-[var(--muted)]">
                      Appointment
                    </dt>

                    <dd className="mt-1 font-semibold">

                      {formatDate(selected.startsAt)}

                      <br />

                      {formatTime(selected.startsAt)}

                    </dd>

                  </div>


                  <div>

                    <dt className="text-[var(--muted)]">
                      Appointment type
                    </dt>

                    <dd className="mt-1 font-semibold">
                      {selected.appointmentType ??
                "In-person"}
                    </dd>

                  </div>


                  <div>

                    <dt className="text-[var(--muted)]">
                      Reason
                    </dt>

                    <dd className="mt-1 font-semibold">
                      {selected.reason}
                    </dd>

                  </div>


                  <div>

                    <dt className="flex items-center gap-2 text-[var(--muted)]">
                      <Mail size={14}/> Email
                    </dt>

                    <dd className="mt-1 break-all font-semibold">
                      {selected.patientEmail}
                    </dd>

                  </div>


                  <div>

                    <dt className="flex items-center gap-2 text-[var(--muted)]">
                      <Phone size={14}/> Phone
                    </dt>

                    <dd className="mt-1 font-semibold">
                      {selected.patientPhone}
                    </dd>

                  </div>


                  <div>

                    <dt className="flex items-center gap-2 text-[var(--muted)]">
                      <MapPin size={14}/> Location
                    </dt>

                    <dd className="mt-1 font-semibold">
                      {selected.doctorLocation ??
                "Clinic"}
                    </dd>

                  </div>


                  <div>

                    <dt className="text-[var(--muted)]">
                      Appointment ID
                    </dt>

                    <dd className="mt-1 break-all font-mono text-xs font-medium">
                      {selected.id}
                    </dd>

                  </div>

                </dl>

                <div className="mt-6">
                  <PatientHealthSnapshot booking={selected} compact/>
                </div>

                <div className="mt-4">
                  <PatientIntakeSummary booking={selected} compact/>
                </div>




                {selected.attachment && (<div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC]/50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#C9362D]">
                      Medical Document
                    </p>


                    <p className="mt-2 truncate text-sm font-semibold">

                      <Paperclip size={15} className="mr-1 inline text-[var(--brand)]"/>{" "}

                      {selected.attachment.name}

                    </p>


                    <p className="mt-1 text-xs text-[var(--muted)]">

                      {formatFileSize(selected.attachment.size)}

                    </p>


                    <div className="mt-3 grid grid-cols-2 gap-2">

                      <button type="button" onClick={() => viewAttachment(selected)} className="rounded-lg border border-[var(--brand)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand)]">
                        View
                      </button>


                      <button type="button" onClick={() => downloadAttachment(selected)} className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white">
                        Download
                      </button>

                    </div>

                  </div>)}




                {selected.status ===
                "pending" && !selected.rescheduleApprovalPending && (<div className="mt-7">

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Appointment request
                    </p>


                    <div className="grid grid-cols-2 gap-2">

                      <button type="button" onClick={() => runAction(() => confirmBooking(selected.id), "Appointment confirmed.")} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">
                        Confirm
                      </button>


                      <button type="button" onClick={() => runAction(() => declineBooking(selected.id), "Appointment declined.")} className="rounded-xl border border-[#dbeafe] bg-white px-4 py-3 text-sm font-semibold text-[#C9362D] hover:bg-[#F8FAFC]">
                        Decline
                      </button>

                    </div>

                  </div>)}

                {selected.status === "pending" &&
                selected.rescheduleApprovalPending && (<div className="mt-7 rounded-xl border border-[#E8CF68] bg-[#FFF8D9] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A6500]">
                        Awaiting patient approval
                      </p>
                      <p className="mt-2 text-sm text-[#6D5700]">
                        The proposed appointment time will become confirmed after the patient approves it.
                      </p>
                    </div>)}




                {selected.status ===
                "confirmed" &&
                new Date(selected.startsAt).getTime() >
                    Date.now() && (<div className="mt-7">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Manage appointment
                      </p>


                      <div className="grid grid-cols-2 gap-2">

                        <button type="button" onClick={openReschedule} className="rounded-xl border border-[var(--brand)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand)] hover:bg-[#F8FAFC]">
                          Reschedule
                        </button>


                        <button type="button" onClick={() => setConfirmation({
                    title: "Cancel this appointment?",
                    description: "The patient will be notified that this visit has been cancelled.",
                    action: () => runAction(() => cancelBooking(selected.id), "Appointment cancelled."),
                })} className="rounded-xl border border-[#dbeafe] bg-white px-4 py-3 text-sm font-semibold text-[#C9362D] hover:bg-[#F8FAFC]">
                          Cancel
                        </button>

                      </div>

                    </div>)}




                {selected.status ===
                "confirmed" &&
                new Date(selected.startsAt).getTime() <=
                    Date.now() && (<div className="mt-7">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Appointment outcome
                      </p>


                      <div className="grid grid-cols-2 gap-2">

                        <button type="button" onClick={() => runAction(() => markBookingCompleted(selected.id), "Appointment marked as completed.")} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">
                          Completed
                        </button>


                        <button type="button" onClick={() => runAction(() => markBookingMissed(selected.id), "Appointment marked as missed.")} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#F8FAFC]">
                          Missed
                        </button>

                      </div>

                    </div>)}




                {selected.status ===
                "completed" && (<div className="mt-7 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-center">

                    <p className="text-sm font-semibold">
                      Appointment completed
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Appointment status is now read-only.
                    </p>

                  </div>)}




                {(selected.status ===
                "cancelled" ||
                selected.status ===
                    "missed") && (<div className="mt-7 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-center">

                    <p className="text-sm font-semibold">
                      Read-only appointment
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      No further appointment changes are available.
                    </p>

                  </div>)}




                {rescheduling && (<div className="mt-7 border-t border-[var(--line)] pt-6">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
                          Reschedule
                        </p>

                        <h3 className="mt-1 font-semibold">
                          Select another slot
                        </h3>

                      </div>


                      <button type="button" onClick={() => setRescheduling(false)} className="text-xs font-semibold text-[#C9362D] hover:underline">
                        Close
                      </button>

                    </div>


                    {rescheduleDates.length >
                    0 ? (<>

                        <div className="mt-4 flex flex-wrap gap-2">

                          {rescheduleDates.map((item) => (<button key={item} type="button" onClick={() => setSelectedRescheduleDate(item)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selectedRescheduleDate ===
                            item
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                            : "border-[var(--line)] hover:border-[var(--brand)]"}`}>

                                {new Intl.DateTimeFormat("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                        }).format(new Date(`${item}T00:00:00`))}

                              </button>))}

                        </div>


                        {rescheduleSlots.length >
                        0 ? (<div className="mt-3 grid grid-cols-2 gap-2">

                            {rescheduleSlots.map((slot) => (<button key={slot.id} type="button" onClick={() => setConfirmation({
                                title: "Propose new appointment time",
                                description: `Propose ${slot.date} at ${slot.time}? The appointment will remain pending until the patient approves it.`,
                                action: () => applyReschedule(slot),
                            })} className="rounded-lg border border-[var(--line)] px-3 py-2.5 text-xs font-semibold transition hover:border-[var(--brand)] hover:bg-[#F8FAFC] hover:text-[var(--brand)]">
                                  {slot.time}
                                </button>))}

                          </div>) : (<p className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-sm text-[var(--muted)]">
                            No slots available on this date.
                          </p>)}

                      </>) : (<p className="mt-4 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-3 text-sm text-[#D96B32]">
                        No alternative appointment slots are available.
                      </p>)}

                  </div>)}

              </div>) : (<div className="py-12 text-center">

                <div className="mx-auto grid size-11 place-items-center rounded-full bg-[#F8FAFC]">
                  <UserRound size={18}/>
                </div>

                <p className="mt-4 text-sm text-[var(--muted)]">
                  Select an appointment to view details.
                </p>

              </div>)}

          </aside>

        </div>

      </div>

      {confirmation && (<div className="fixed inset-0 z-[70] grid place-items-center bg-[#0B1329]/55 px-4 backdrop-blur-sm" onMouseDown={() => setConfirmation(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirmation-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_70px_rgba(11,19,41,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Please confirm</p>
            <h2 id="confirmation-title" className="font-editorial mt-3 text-2xl">{confirmation.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#64748B]">{confirmation.description}</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmation(null)} className="rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm font-semibold">Keep appointment</button>
              <button type="button" onClick={() => { const action = confirmation.action; setConfirmation(null); action(); }} className="rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white hover:bg-[#C9362D]">Confirm change</button>
            </div>
          </section>
        </div>)}

    </main>);
}
