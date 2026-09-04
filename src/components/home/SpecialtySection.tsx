"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  Bone,
  Brain,
  Clock,
  HeartPulse,
  ScanFace,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const specialtiesData: {
  name: string;
  note: string;
  icon: LucideIcon;
  doctorsCount: number;
  avgWait: string;
  feeRange: string;
  conditions: string[];
}[] = [
  {
    name: "General Medicine",
    note: "Comprehensive primary care, seasonal illnesses & metabolic health",
    icon: Stethoscope,
    doctorsCount: 112,
    avgWait: "10 mins",
    feeRange: "₹500 - ₹900",
    conditions: ["Viral Fever", "Hypertension", "Diabetes", "Thyroid", "Fatigue"],
  },
  {
    name: "Dermatology",
    note: "Clinical skin therapy, hair restoration & chronic dermatology",
    icon: ScanFace,
    doctorsCount: 68,
    avgWait: "15 mins",
    feeRange: "₹800 - ₹1,400",
    conditions: ["Acne & Scars", "Eczema", "Hair Fall", "Allergies", "Psoriasis"],
  },
  {
    name: "Cardiology",
    note: "Preventive cardiology, ECG interpretation & coronary care",
    icon: HeartPulse,
    doctorsCount: 54,
    avgWait: "12 mins",
    feeRange: "₹1,000 - ₹2,000",
    conditions: ["Chest Pain", "Palpitations", "Arrhythmia", "Cholesterol", "Hypertension"],
  },
  {
    name: "Orthopedics",
    note: "Joint mobility, sports injuries, spine health & fracture care",
    icon: Bone,
    doctorsCount: 49,
    avgWait: "14 mins",
    feeRange: "₹800 - ₹1,600",
    conditions: ["Knee Pain", "Back Pain", "Arthritis", "Ligament Tears", "Spine"],
  },
  {
    name: "Pediatrics",
    note: "Compassionate child healthcare, immunization & growth tracking",
    icon: Baby,
    doctorsCount: 76,
    avgWait: "8 mins",
    feeRange: "₹600 - ₹1,100",
    conditions: ["Vaccinations", "Child Nutrition", "Allergies", "Growth", "Cough"],
  },
  {
    name: "Neurology",
    note: "Brain diagnostics, stroke rehabilitation, epilepsy & migraines",
    icon: Brain,
    doctorsCount: 38,
    avgWait: "18 mins",
    feeRange: "₹1,200 - ₹2,200",
    conditions: ["Migraine", "Vertigo", "Seizures", "Neuropathy", "Memory Care"],
  },
];

export default function SpecialtySection() {
  return (
    <AnimatedSection id="specialties" className="bg-slate-50/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <Stethoscope size={13} className="text-blue-600" />
              <span>Specialized Departments</span>
            </div>
            <h2 className="font-editorial mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              Care Organized by Medical Need.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Connect directly with verified specialists across accredited hospital OPDs and private clinics.
            </p>
          </div>
          <Link
            href="/doctors"
            className="group inline-flex items-center gap-2 text-xs font-bold text-blue-700 transition hover:text-blue-800"
          >
            <span>Explore all departments</span>
            <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </Link>
        </div>

        {/* High Density Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specialtiesData.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="depth-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Icon size={24} strokeWidth={2} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      {item.doctorsCount} Specialists
                    </span>
                  </div>

                  <h3 className="mt-4 font-editorial text-xl font-bold text-slate-900 group-hover:text-blue-700">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.note}</p>

                  {/* Conditions Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Meta & CTA */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-blue-600" /> Avg wait: {item.avgWait}
                    </span>
                    <span className="font-bold text-slate-700">{item.feeRange}</span>
                  </div>

                  <Link
                    href={`/doctors?specialty=${encodeURIComponent(item.name)}`}
                    className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-800"
                  >
                    <span>View Available Slots</span>
                    <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
