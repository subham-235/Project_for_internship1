"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, CalendarCheck, MapPin, Shield, Star, Video, } from "lucide-react";
import type { Doctor } from "@/types/doctor";
const insurancePartners = ["Star Health", "HDFC ERGO", "Care"];
export default function DoctorCard({ doctor }: {
    doctor: Doctor;
}) {
    const hasAvailability = !doctor.availability.startsWith("No");
    const reduceMotion = useReducedMotion();
    return (<motion.article layout initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} whileHover={reduceMotion ? undefined : { y: -7 }} transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }} className="depth-card glow-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-lg">

      <div className="relative overflow-hidden bg-slate-100">
        <img src={doctor.image} alt={doctor.name} className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"/>


        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/40 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 shadow-sm backdrop-blur-md">
            <BadgeCheck size={13} className="text-blue-600"/> Verified MD
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            <Video size={12} className="text-blue-400"/>
            <span>Video & Clinic</span>
          </span>
        </div>


        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
            <Star size={13} className="fill-amber-400 text-amber-400"/>
            <span>{doctor.rating}</span>
            <span className="text-[10px] font-normal text-slate-300">({doctor.reviews} visits)</span>
          </div>

          <span className="rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {doctor.experience} Yrs Exp
          </span>
        </div>
      </div>


      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
            {doctor.specialty}
          </span>
          <span className="text-[11px] font-bold text-slate-500">Reg: #WB-{doctor.id.slice(-4).toUpperCase()}</span>
        </div>

        <h3 className="font-editorial mt-2 text-xl font-bold text-slate-900 transition group-hover:text-blue-700">
          {doctor.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} className="text-blue-600 shrink-0"/>
          <span className="truncate">{doctor.location}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
            1.4 km away
          </span>
        </div>


        <div className="mt-4 grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/70 py-2.5 text-center text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Consultation Fee
            </span>
            <span className="mt-0.5 block text-sm font-extrabold text-slate-900">₹{doctor.fee}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Avg Consult
            </span>
            <span className="mt-0.5 block text-sm font-extrabold text-blue-700">20-30 Mins</span>
          </div>
        </div>


        <div className="mt-3.5 flex items-center gap-1.5 text-[10px] text-slate-600">
          <Shield size={12} className="text-blue-600 shrink-0"/>
          <span className="font-semibold text-slate-700">Insurances:</span>
          <div className="flex flex-wrap gap-1">
            {insurancePartners.map((ins) => (<span key={ins} className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                {ins}
              </span>))}
          </div>
        </div>


        <div className={`mt-3.5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${hasAvailability ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-slate-50 text-slate-500"}`}>
          <CalendarCheck size={14} className={hasAvailability ? "text-emerald-600" : "text-slate-400"}/>
          <span className="flex-1 truncate">{doctor.availability}</span>
          {hasAvailability && (<span className="size-2 rounded-full bg-emerald-500 animate-pulse"/>)}
        </div>


        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-4">
          <Link href={`/booking/${doctor.id}`} className="brand-shimmer flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-700/20 transition hover:from-blue-700 hover:to-blue-800 hover:shadow-md">
            Book Appointment
          </Link>
          <Link href={`/doctors/${doctor.id}`} aria-label={`View profile of ${doctor.name}`} className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800">
            <ArrowUpRight size={16}/>
          </Link>
        </div>
      </div>
    </motion.article>);
}
