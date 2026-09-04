"use client";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Award, BadgeCheck, BookOpen, CalendarDays, Languages, MapPin, Star, Stethoscope } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { doctors } from "@/lib/mock-data/doctors";
import { applyDoctorReviewStats, ensureDoctorSlotsSeeded, getAvailableSlotsForDoctor, getDoctorReviews, getRegisteredDoctors, getReviewsForDoctor, mergeDoctorProfiles } from "@/lib/client-storage";
import type { Doctor } from "@/types/doctor";
import type { DoctorSlot } from "@/types/availability";
import type { DoctorReview } from "@/types/review";

export default function DoctorProfilePage() {
  const params = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      const found = mergeDoctorProfiles(doctors, getRegisteredDoctors()).find((item) => item.id === params.id);
      if (!found) { setLoading(false); return; }
      ensureDoctorSlotsSeeded(found.id, found.slots);
      setDoctor(applyDoctorReviewStats(found, getDoctorReviews()));
      setReviews(getReviewsForDoctor(found.id));
      setSlots(getAvailableSlotsForDoctor(found.id));
      setLoading(false);
    };
    const timer = window.setTimeout(loadProfile, 0);
    window.addEventListener("schedula-reviews-change", loadProfile);
    window.addEventListener("storage", loadProfile);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("schedula-reviews-change", loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, [params.id]);

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, DoctorSlot[]>();
    slots.forEach((slot) => groups.set(slot.date, [...(groups.get(slot.date) ?? []), slot]));
    return Array.from(groups.entries());
  }, [slots]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="grid min-h-[65vh] place-items-center bg-slate-50/80">
          <div className="text-center">
            <span className="mx-auto block size-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Synchronizing Clinical Records…
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-editorial text-4xl font-bold text-slate-900">Doctor Profile Not Found</h1>
          <p className="mt-3 text-sm text-slate-500">The requested specialist is currently not in the active roster.</p>
          <Link
            href="/doctors"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
          >
            Back to Doctor Directory
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/70 pb-20">
        {}
        <section className="border-b border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition hover:text-white"
            >
              <ArrowLeft size={14} /> Back to Doctor Directory
            </Link>

            <div className="mt-6 grid gap-8 sm:grid-cols-[200px_1fr] sm:items-end">
              <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-slate-800 shadow-xl">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              </div>

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md">
                    <BadgeCheck size={14} className="text-blue-400" /> Verified Medical Practitioner
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300">
                    Reg: #WB-{doctor.id.slice(-4).toUpperCase()}
                  </span>
                </div>

                <h1 className="font-editorial mt-3 text-3xl font-extrabold sm:text-5xl lg:text-6xl text-white">
                  {doctor.name}
                </h1>
                <p className="mt-2 text-base font-bold text-blue-300 sm:text-lg">{doctor.specialty}</p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    {doctor.rating} ({doctor.reviews} verified patient reviews)
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Award size={15} className="text-blue-400" /> {doctor.experience} Years Clinical Practice
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <MapPin size={15} className="text-cyan-400" /> {doctor.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          {}
          <div className="space-y-8">
            {}
            <article className="depth-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Specialist Background
              </span>
              <h2 className="font-editorial mt-1 text-2xl font-bold text-slate-900">
                About {doctor.name.replace("Dr. ", "")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
            </article>

            {}
            <div className="grid gap-6 sm:grid-cols-2">
              <article className="depth-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <BookOpen size={20} />
                </div>
                <h3 className="mt-4 font-editorial text-base font-bold text-slate-900">
                  Education & Qualifications
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  {doctor.education.map((item) => (
                    <li key={item} className="flex items-center gap-2 border-l-2 border-blue-500 pl-2.5">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="depth-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Languages size={20} />
                </div>
                <h3 className="mt-4 font-editorial text-base font-bold text-slate-900">
                  Languages Spoken
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  {doctor.languages.join(" • ")}
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                  ✓ Consultations conducted fluently in English, Bengali, and Hindi.
                </div>
              </article>
            </div>

            {}
            <article className="depth-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
                  <Stethoscope size={16} />
                </div>
                <h3 className="font-editorial text-lg font-bold text-slate-900">
                  Clinical Consultation Protocols
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Consultations are customized based on clinical history, presenting symptoms, and diagnostic reports.
                Digital prescriptions are uploaded directly to your Schedula portal immediately post-visit.
              </p>
            </article>

            {}
            {reviews.length > 0 && (
              <article className="depth-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Patient Testimonials
                    </span>
                    <h3 className="font-editorial mt-1 text-2xl font-bold text-slate-900">
                      Recent Verified Visits
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{doctor.rating} / 5.0</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {reviews.slice(0, 4).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">
                          {review.patientName || "Verified Patient"}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {review.rating}/5
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-slate-400">
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(review.createdAt))}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>

          {}
          <aside className="depth-card h-fit rounded-2xl border border-slate-200/90 bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <div className="flex items-end justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  OPD Consultation Fee
                </span>
                <p className="mt-1 font-editorial text-3xl font-extrabold text-slate-900">₹{doctor.fee}</p>
              </div>
              <CalendarDays className="size-6 text-blue-600" />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs font-bold text-blue-900">
              <span>{slots.length ? `${slots.length} Slots Available` : "No slots open"}</span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-700">
              Select an Available Slot:
            </h3>

            {groupedSlots.length ? (
              <div className="warm-scrollbar mt-3 max-h-72 space-y-4 overflow-y-auto pr-1">
                {groupedSlots.map(([date, dateSlots]) => (
                  <div key={date}>
                    <p className="text-[11px] font-bold text-slate-700">
                      {new Intl.DateTimeFormat("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }).format(new Date(`${date}T00:00:00`))}
                    </p>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      {dateSlots.map((slot) => (
                        <span
                          key={slot.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-xs font-bold text-blue-800"
                        >
                          {slot.time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">This specialist has no new slots published today.</p>
            )}

            {slots.length ? (
              <Link
                href={`/booking/${doctor.id}`}
                className="mt-6 block rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-center text-xs font-bold text-white shadow-md shadow-blue-700/20 transition hover:from-blue-700 hover:to-blue-800"
              >
                Proceed to Instant Booking
              </Link>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-100 py-3 text-center text-xs font-semibold text-slate-400">
                No Booking Slots Available
              </div>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
