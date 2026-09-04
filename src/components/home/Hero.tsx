"use client";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Baby, BadgeCheck, Bone, Brain, CalendarDays, CheckCircle2, Clock3, HeartPulse, MapPin, Search, ShieldCheck, Sparkles, Star, Stethoscope, Thermometer, } from "lucide-react";
import { specialties } from "@/lib/mock-data/doctors";
const AppointmentScene = dynamic(() => import("@/components/home/AppointmentScene"), {
    ssr: false,
    loading: () => <div className="h-full min-h-[430px] animate-pulse rounded-3xl bg-slate-100"/>,
});
const symptomPills = [
    { label: "Fever & Cold", specialty: "General Medicine", icon: <Thermometer size={14} className="text-blue-600"/> },
    { label: "Skin & Hair", specialty: "Dermatology", icon: <Sparkles size={14} className="text-blue-600"/> },
    { label: "Chest & Heart", specialty: "Cardiology", icon: <HeartPulse size={14} className="text-blue-600"/> },
    { label: "Bones & Joints", specialty: "Orthopedics", icon: <Bone size={14} className="text-blue-600"/> },
    { label: "Child Health", specialty: "Pediatrics", icon: <Baby size={14} className="text-blue-600"/> },
    { label: "Migraine & Neuro", specialty: "Neurology", icon: <Brain size={14} className="text-blue-600"/> },
];
export default function Hero() {
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const [specialty, setSpecialty] = useState("General Medicine");
    const [location, setLocation] = useState("Kolkata");
    const [availability, setAvailability] = useState("Today");
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
    const visualY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 50]);
    const submit = (event?: FormEvent<HTMLFormElement>) => {
        if (event)
            event.preventDefault();
        const params = new URLSearchParams();
        if (specialty !== "All")
            params.set("specialty", specialty);
        if (location.trim())
            params.set("location", location.trim());
        if (availability !== "Any day")
            params.set("availability", availability);
        router.push(`/doctors?${params.toString()}`);
    };
    const handleSymptomClick = (spec: string) => {
        setSpecialty(spec);
        const params = new URLSearchParams();
        params.set("specialty", spec);
        if (location.trim())
            params.set("location", location.trim());
        router.push(`/doctors?${params.toString()}`);
    };
    return (<section ref={sectionRef} className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 pt-24 sm:pt-28 lg:pt-28">

      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl"/>
      <div className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"/>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"/>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"/>
            </span>
            <span>Live Clinical Network</span>
            <span className="h-3 w-px bg-blue-200"/>
            <span className="font-medium text-blue-600">Avg wait time: 8 mins</span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm sm:inline-flex">
            <ShieldCheck size={13} className="text-blue-600"/>
            <span>NABH Accredited & Verified Specialists</span>
          </div>
        </motion.div>


        <div className="grid items-center gap-8 pb-10 lg:grid-cols-12 lg:gap-10 lg:pb-14">

          <div className="relative z-10 lg:col-span-7">
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-editorial text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Consult Verified Doctors,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
                Without the Wait.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Book in-clinic consultations or instant video appointments with top board-certified
              specialists across Kolkata’s premier medical networks.
            </motion.p>


            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Popular Concerns & Instant Match:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {symptomPills.map((symptom) => (<button key={symptom.label} type="button" onClick={() => handleSymptomClick(symptom.specialty)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-900 hover:shadow">
                    <span>{symptom.icon}</span>
                    <span>{symptom.label}</span>
                  </button>))}
              </div>
            </motion.div>


            <motion.form id="doctor-search" onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }} className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-[0_12px_36px_-6px_rgba(11,19,41,0.08)] ring-1 ring-slate-900/5 transition hover:border-slate-300">
              <div className="grid gap-2 sm:grid-cols-3">

                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <Stethoscope size={18} className="shrink-0 text-blue-600"/>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Medical Specialty
                    </span>
                    <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full truncate bg-transparent text-xs font-bold text-slate-800 outline-none">
                      <option value="All">All Specialties (450+)</option>
                      {specialties.map((item) => (<option key={item} value={item}>
                          {item}
                        </option>))}
                    </select>
                  </div>
                </div>


                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <MapPin size={18} className="shrink-0 text-cyan-600"/>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Clinic Location
                    </span>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Salt Lake, Park Street" className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"/>
                  </div>
                </div>


                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <CalendarDays size={18} className="shrink-0 text-emerald-600"/>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Appointment Day
                    </span>
                    <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none">
                      <option value="Today">Today (Fast Track)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Any day">Any Day This Week</option>
                    </select>
                  </div>
                </div>
              </div>


              <div className="mt-2.5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-2.5 sm:flex-row">
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-500"/> Zero Convenience Fee
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-500"/> Instant SMS Confirmation
                  </span>
                </div>

                <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-700/25 transition hover:from-blue-700 hover:to-blue-800 sm:w-auto">
                  <Search size={15}/>
                  <span>Search Available Doctors</span>
                  <ArrowRight size={14} className="transition group-hover:translate-x-1"/>
                </button>
              </div>
            </motion.form>
          </div>


          <motion.div style={{ y: visualY }} className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 p-2 shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse"/>
                  Live Appointment Visualizer
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-blue-300">Interactive 3D</span>
              </div>


              <div className="relative h-[340px] sm:h-[390px] w-full">
                <AppointmentScene />


                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, y: reduceMotion ? 0 : [0, -6, 0] }} transition={{ opacity: { delay: 0.5, duration: 0.6 }, x: { delay: 0.5, duration: 0.6 }, y: { delay: 1.1, duration: 4.5, repeat: Infinity, ease: "easeInOut" } }} className="absolute right-4 top-4 z-20 rounded-2xl border border-white/15 bg-slate-900/90 p-3 text-white shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 overflow-hidden rounded-xl bg-slate-800 border border-blue-400/30">
                      <Image src="/schedula-doctor-hero-4k.webp" alt="Dr. Anika Rao" fill sizes="44px" className="object-cover object-top"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white">Dr. Anika Rao</p>
                        <BadgeCheck size={14} className="text-blue-400"/>
                      </div>
                      <p className="text-[10px] text-blue-300">MD • Internal Medicine</p>
                      <p className="text-[9px] text-slate-300">Fortis Hospital, Kolkata</p>
                    </div>
                  </div>
                </motion.div>


                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72, duration: 0.55 }} className="absolute bottom-3 inset-x-3 z-20 rounded-2xl border border-white/15 bg-slate-900/90 p-3 text-white backdrop-blur-md">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        <Clock3 size={11}/> Next Available Opening
                      </span>
                      <p className="mt-0.5 font-editorial text-lg font-bold text-white">
                        Today, 4:00 PM <span className="text-xs font-normal text-slate-300">• In-Clinic & Video</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => router.push("/booking/doc-001")} className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:from-blue-400 hover:to-emerald-400 shadow-md">
                      Book Slot
                    </button>
                  </div>
                </motion.div>
              </div>


              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-slate-900/50 py-2.5 text-center text-white">
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-blue-300">4.9/5 <Star size={11} fill="currentColor"/></p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">32k+ Reviews</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">100%</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Verified MDs</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">0 Mins</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Phone Queue</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);
}
