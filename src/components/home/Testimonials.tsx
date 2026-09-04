"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, MessageSquareQuote, Star } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const testimonials = [
  {
    quote:
      "I booked Dr. Anika Rao at Fortis Hospital within 2 minutes. The digital token meant zero line at the reception, and my prescription was immediately visible on my phone. Schedula is leagues ahead of traditional healthcare.",
    name: "Maya Sen",
    role: "Patient • Salt Lake, Kolkata",
    initials: "MS",
    department: "Internal Medicine",
    rating: 5,
    hospital: "Fortis Hospital, Anandapur",
  },
  {
    quote:
      "As a busy orthopedic surgeon, managing walk-ins and phone calls was exhausting. Schedula consolidated my entire day's clinical roster, patient history, and prescription notes into a flawless, calm dashboard.",
    name: "Dr. Arjun Mehta",
    role: "Senior Orthopedic Surgeon",
    initials: "AM",
    department: "Joint & Spine Surgery",
    rating: 5,
    hospital: "Apollo Multispeciality",
  },
  {
    quote:
      "When my mother had severe joint inflammation, we got an OPD slot on the exact same morning without waiting on hold. Having all her past prescriptions and reports organized in one place gave our family immense peace of mind.",
    name: "Rohan Das",
    role: "Patient Family Member • New Town",
    initials: "RD",
    department: "Rheumatology & Orthopedics",
    rating: 5,
    hospital: "Medica Superspecialty",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const move = (direction: number) =>
    setActive((active + direction + testimonials.length) % testimonials.length);
  const item = testimonials[active];

  return (
    <AnimatedSection className="border-b border-slate-200/80 bg-slate-50/60 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[0.35fr_1fr] md:items-start">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <MessageSquareQuote size={24} />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-800">
              Verified Feedback
            </p>
            <h3 className="font-editorial mt-1 text-2xl font-bold text-slate-900">
              Trusted by 32,000+ Patients
            </h3>

            {}
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous testimonial"
                className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next testimonial"
                className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    <BadgeCheck size={12} className="text-emerald-600" /> Verified Visit
                  </span>
                </div>

                <p className="font-editorial mt-6 text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">
                  “{item.quote}”
                </p>

                <footer className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-blue-100/70 text-sm font-bold text-blue-800">
                      {item.initials}
                    </span>
                    <div>
                      <strong className="block text-sm font-bold text-slate-900">{item.name}</strong>
                      <span className="text-xs text-slate-500">{item.role}</span>
                    </div>
                  </div>

                  <div className="hidden text-right text-xs sm:block">
                    <span className="block font-semibold text-blue-700">{item.department}</span>
                    <span className="text-slate-600">{item.hospital}</span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
