"use client";


import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareQuote,
  Pill,
  Plus,
  Star,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";
import type { DoctorSlot } from "@/types/availability";
import type { DoctorReview } from "@/types/review";
import {
  applyDoctorReviewStats,
  clearCurrentUser,
  getBookingsForDoctor,
  getCurrentUser,
  getDoctorSlots,
  getReviewsForDoctor,
  getRegisteredDoctors,
  mergeDoctorProfiles,
  type StoredUser,
} from "@/lib/client-storage";
import { doctors } from "@/lib/mock-data/doctors";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  isDashboardUpcoming,
} from "@/lib/appointment-utils";
import StatusBadge from "@/components/appointments/StatusBadge";
import PatientScheduleDialog from "@/components/doctor/PatientScheduleDialog";
import DashboardAnalytics from "@/components/doctor/DashboardAnalytics";
import DoctorCommandPalette from "@/components/doctor/DoctorCommandPalette";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import DoctorLiveQueue from "@/components/doctor/DoctorLiveQueue";
import NotificationBell from "@/components/notifications/NotificationBell";

const navigation = [
  { label: "Overview", href: "/doctor-dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/doctor-dashboard/appointments", icon: ListChecks },
  { label: "Prescriptions", href: "/doctor-dashboard/prescriptions", icon: Pill },
  { label: "Profile", href: "/doctor-dashboard/profile", icon: CircleUserRound },
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function findDoctorProfile(user: StoredUser): Doctor | undefined {
  const allDoctors = mergeDoctorProfiles(doctors, getRegisteredDoctors());
  return (
    allDoctors.find((doctor) => doctor.id === user.id) ??
    allDoctors.find((doctor) => normalize(doctor.name) === normalize(user.name))
  );
}

function DoctorSidebar({
  profile,
  onLogout,
  mobile = false,
  onNavigate,
}: {
  profile: Doctor;
  onLogout: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`flex h-full flex-col bg-[#0B1329] text-white ${mobile ? "w-[18rem]" : "w-[17.5rem]"}`}>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329] shadow-lg shadow-black/10">
          <Stethoscope size={21} strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight">Schedula</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#dbeafe]/55">Doctor workspace</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-7" aria-label="Doctor dashboard navigation">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dbeafe]/40">Workspace</p>
        <div className="mt-3 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-white text-[#0B1329] shadow-sm" : "text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight className="ml-auto" size={16} />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="m-4 rounded-xl border border-white/10 bg-white/7 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dbeafe] text-sm font-bold text-[#0B1329]">{profile.initials}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-[#dbeafe]/55">{profile.specialty}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-[#F8FAFC]/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadDashboard = useCallback((doctorProfile: Doctor) => {
    setLoading(true);
    setBookings(getBookingsForDoctor(doctorProfile.id, doctorProfile.name));
    setSlots(getDoctorSlots(doctorProfile.id));
    setReviews(getReviewsForDoctor(doctorProfile.id));
    setLoading(false);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "doctor") {
      router.replace("/doctors");
      return;
    }
    const doctorProfile = findDoctorProfile(currentUser);
    if (!doctorProfile) {
      router.replace("/doctors");
      return;
    }
    setUser(currentUser);
    setProfile(doctorProfile);
    loadDashboard(doctorProfile);
  }, [router, loadDashboard]);

  useEffect(() => {
    if (!profile) return;
    const handleFocus = () => loadDashboard(profile);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("schedula-reviews-change", handleFocus);
    window.addEventListener("storage", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("schedula-reviews-change", handleFocus);
      window.removeEventListener("storage", handleFocus);
    };
  }, [profile, loadDashboard]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter(isDashboardUpcoming)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [bookings],
  );

  const pendingBookings = upcoming.filter((booking) => booking.status === "pending");
  const pending = pendingBookings.length;
  const awaitingPatient = pendingBookings.filter(
    (booking) => booking.rescheduleApprovalPending,
  ).length;
  const confirmed = upcoming.filter((booking) => booking.status === "confirmed").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = upcoming.filter((booking) => booking.date === today);
  const nextAppointment = upcoming[0];
  const reviewedProfile = useMemo(
    () => (profile ? applyDoctorReviewStats(profile, reviews) : null),
    [profile, reviews],
  );
  const firstName = profile?.name.replace(/^Dr\.?\s*/i, "").split(" ")[0];
  const formattedToday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const logout = () => {
    clearCurrentUser();
    router.push("/login");
  };

  if (!user || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--muted)]">
          <span className="size-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]" />
          Preparing your workspace...
        </div>
      </main>
    );
  }

  const stats = [
    { label: "Today's appointments", value: todayBookings.length, note: "visits scheduled", icon: CalendarDays, tone: "brand" as const },
    { label: "Upcoming patients", value: upcoming.length, note: "across your schedule", icon: UsersRound, tone: "accent" as const },
    { label: "Pending", value: pending, note: awaitingPatient ? `${awaitingPatient} awaiting patient approval` : pending ? "need your attention" : "all caught up", icon: Clock3, tone: "warning" as const },
    { label: "Confirmed", value: confirmed, note: "appointments ready", icon: CheckCircle2, tone: "success" as const },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1329] lg:flex">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <DoctorSidebar profile={profile} onLogout={logout} />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-[#0B1329]/55 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative h-full w-fit shadow-2xl">
            <DoctorSidebar profile={profile} onLogout={logout} mobile onNavigate={() => setMobileNavOpen(false)} />
            <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="absolute right-4 top-5 grid size-10 place-items-center rounded-xl text-white hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:ml-[17.5rem]">
        <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-[#F8FAFC]/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-7 xl:px-10">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="grid size-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white lg:hidden">
                <Menu size={20} />
              </button>
              <div>
                <p className="text-sm font-semibold">Overview</p>
                <p className="hidden text-xs text-[#64748B] sm:block">{formattedToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <DoctorCommandPalette bookings={bookings} onSelect={setSelectedPatient} />
              <NotificationBell
                user={user}
                href="/doctor-dashboard/appointments"
                reminders={false}
                className="size-10"
              />
              <div className="hidden h-8 w-px bg-[#E2E8F0] sm:block" />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{profile.name}</p>
                <p className="text-xs text-[#64748B]">{profile.specialty}</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-sm font-bold text-[#2563eb]">{profile.initials}</div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[94rem] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
          <section className="relative overflow-hidden bg-[#0B1329] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Your clinical day</p>
                <h1 className="font-editorial mt-3 text-3xl tracking-[-0.04em] sm:text-5xl">Good afternoon,<br />Dr. {firstName}.</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#F8FAFC]/75">
                  {todayBookings.length > 0
                    ? `You have ${todayBookings.length} appointment${todayBookings.length === 1 ? "" : "s"} today. Your next patient details are ready below.`
                    : "Your schedule is clear today. Review upcoming requests or update your availability."}
                </p>
              </div>
              <button type="button" onClick={() => upcoming[0] && setSelectedPatient(upcoming[0])} disabled={!upcoming.length} className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#2563eb] shadow-sm hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50">
                <CalendarDays size={17} /> Open patient schedule
              </button>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Schedule summary">
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.note} icon={stat.icon} tone={stat.tone} />
            ))}
          </section>

          <DashboardAnalytics bookings={bookings} />

          <div className="mt-6">
            <DoctorLiveQueue bookings={bookings} onRefresh={() => loadDashboard(profile)} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)]">
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_8px_24px_rgba(11,19,41,0.04)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-bold">Upcoming appointments</h2>
                  <p className="mt-1 text-xs text-[#64748B]">Your next confirmed visits and patient requests</p>
                </div>
                <Link href="/doctor-dashboard/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:text-[#0B1329]">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4 p-5 sm:p-6" aria-label="Loading appointments">
                  {[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-4"><Skeleton className="size-11 shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-3/5" /></div><Skeleton className="hidden h-8 w-24 sm:block" /></div>)}
                </div>
              ) : upcoming.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0]">
                  {upcoming.slice(0, 5).map((booking, index) => (
                    <button type="button" key={booking.id} onClick={() => setSelectedPatient(booking)} className="group grid w-full gap-4 px-5 py-4 text-left hover:bg-[#F8FAFC] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-[#F8FAFC] text-sm font-bold text-[#2563eb]">
                          {booking.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                          {index === 0 && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-sky-500 ring-2 ring-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-bold">{booking.patientName}</p>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{formatAppointmentDate(booking.startsAt)}</span>
                            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{formatAppointmentTime(booking.startsAt)}</span>
                            <span className="inline-flex items-center gap-1.5"><Stethoscope size={13} />{booking.appointmentType ?? "In-person"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 pl-[3.75rem] sm:justify-end sm:pl-0">
                        <span className="max-w-36 truncate text-xs text-[#64748B]">{booking.reason}</span>
                        <span className="grid size-8 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition group-hover:border-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white"><ChevronRight size={15} /></span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState className="m-5 border-0 bg-transparent" icon={CalendarDays} title="Your schedule is clear" description="New patient bookings will appear here as soon as they are requested." />
              )}
            </div>

            <article className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Up next</p>
                    <h2 className="mt-1 text-base font-bold">Next appointment</h2>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#2563eb]"><Clock3 size={18} /></div>
                </div>
                {nextAppointment ? (
                  <div className="mt-5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-xl bg-[#0B1329] text-sm font-bold text-white">
                        {nextAppointment.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{nextAppointment.patientName}</p>
                        <p className="mt-1 text-xs text-[#64748B]">{nextAppointment.patientAge} years · {nextAppointment.appointmentType}</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 rounded-xl bg-[#F8FAFC] p-4 text-xs text-[#64748B]">
                      <p className="flex items-center gap-2.5"><CalendarDays size={15} className="text-[#2563eb]" />{formatAppointmentDate(nextAppointment.startsAt)} at {formatAppointmentTime(nextAppointment.startsAt)}</p>
                      <p className="flex items-start gap-2.5"><Stethoscope size={15} className="mt-0.5 shrink-0 text-[#2563eb]" /><span className="line-clamp-2">{nextAppointment.reason}</span></p>
                    </div>
                    <button type="button" onClick={() => setSelectedPatient(nextAppointment)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-3 text-xs font-bold text-white hover:bg-[#0B1329]">
                      View patient details <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-[#E2E8F0] px-4 py-7 text-center">
                    <p className="text-sm font-semibold">No appointment queued</p>
                    <p className="mt-1 text-xs text-[#64748B]">Enjoy the quiet moment.</p>
                  </div>
                )}
            </article>
          </section>

          <section className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)]">
              <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Patient feedback</p>
                    <h2 className="mt-1 text-base font-bold">Reviews & rating</h2>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><MessageSquareQuote size={18} /></div>
                </div>
                <div className="mt-5 flex items-end justify-between rounded-xl bg-[#0B1329] p-4 text-white">
                  <div><p className="font-editorial text-4xl">{reviewedProfile?.rating ?? profile.rating}</p><p className="mt-1 text-[10px] text-white/55">Overall patient rating</p></div>
                  <div className="text-right"><div className="flex justify-end gap-0.5 text-[#F3B45B]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={13} fill="currentColor" />)}</div><p className="mt-2 text-[10px] text-white/55">{reviewedProfile?.reviews ?? profile.reviews} total reviews</p></div>
                </div>
                {reviews.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {reviews.slice(0, 3).map((review) => {
                      const relatedBooking = bookings.find((booking) => booking.id === review.bookingId);
                      return <div key={review.id} className="border-t border-[#E2E8F0] pt-3 first:border-0 first:pt-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-bold">{review.patientName || relatedBooking?.patientName || "Verified patient"}</p><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-600"><Star size={12} fill="currentColor" />{review.rating}/5</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">{review.comment || "Rating submitted without a written comment."}</p><p className="mt-1.5 text-[9px] text-[#64748B]">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}</p></div>;
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-[#E2E8F0] px-4 py-5 text-center"><p className="text-xs font-semibold">No new patient feedback yet</p><p className="mt-1 text-[10px] text-[#64748B]">Completed appointment reviews will appear here.</p></div>
                )}
              </article>

              <article className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">
                <h2 className="text-base font-bold">Quick actions</h2>
                <p className="mt-1 text-xs text-[#64748B]">Common workspace shortcuts</p>
                <div className="mt-4 grid flex-1 auto-rows-fr grid-cols-2 gap-3">
                  <Link href="/doctor-dashboard/profile" className="rounded-xl border border-[#E2E8F0] p-3.5 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <div className="grid size-9 place-items-center rounded-lg bg-[#dbeafe] text-[#2563eb]"><Plus size={17} /></div>
                    <p className="mt-3 text-xs font-bold">Add slots</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">Set availability</p>
                  </Link>
                  <Link href="/doctor-dashboard/appointments" className="rounded-xl border border-[#E2E8F0] p-3.5 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <div className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-accent"><UserRound size={17} /></div>
                    <p className="mt-3 text-xs font-bold">Patients</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">Review details</p>
                  </Link>
                  <Link href="/doctor-dashboard/calendar" className="rounded-xl border border-[#E2E8F0] p-3.5 hover:border-[#2563eb] hover:bg-[#F8FAFC]">
                    <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CalendarDays size={17} /></div>
                    <p className="mt-3 text-xs font-bold">Calendar</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">Manage schedule</p>
                  </Link>
                  <Link href="/doctor-dashboard/prescriptions" className="rounded-xl border border-[#E2E8F0] p-3.5 hover:border-[#2563eb] hover:bg-[#F8FAFC]">
                    <div className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-600"><Pill size={17} /></div>
                    <p className="mt-3 text-xs font-bold">Prescriptions</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">Clinical records</p>
                  </Link>
                </div>
              </article>
            </section>
        </div>
      </div>

      {selectedPatient && (
        <PatientScheduleDialog
          booking={selectedPatient}
          bookings={bookings}
          slots={slots}
          onClose={() => setSelectedPatient(null)}
          onUpdated={(updated) => {
            setSelectedPatient(updated);
            loadDashboard(profile);
          }}
        />
      )}
    </main>
  );
}
