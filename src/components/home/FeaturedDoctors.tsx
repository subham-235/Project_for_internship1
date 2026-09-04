"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import DoctorCard from "@/components/doctors/DoctorCard";
import { doctors } from "@/lib/mock-data/doctors";
import { applyDoctorReviewStats, getDoctorReviews, getRegisteredDoctors } from "@/lib/client-storage";
import type { Doctor } from "@/types/doctor";

export default function FeaturedDoctors() {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });
  const [doctorList, setDoctorList] = useState<Doctor[]>(doctors.slice(0, 6));

  useEffect(() => {
    const loadDoctors = () => {
      const reviews = getDoctorReviews();
      setDoctorList(
        [...doctors, ...getRegisteredDoctors()]
          .map((doctor) => applyDoctorReviewStats(doctor, reviews))
          .slice(0, 8),
      );
    };
    const timer = window.setTimeout(loadDoctors, 0);
    window.addEventListener("schedula-reviews-change", loadDoctors);
    window.addEventListener("storage", loadDoctors);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("schedula-reviews-change", loadDoctors);
      window.removeEventListener("storage", loadDoctors);
    };
  }, []);

  return (
    <AnimatedSection className="border-b border-slate-200/80 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <UserCheck size={13} className="text-blue-600" />
              <span>Verified Clinical Excellence</span>
            </div>
            <h2 className="font-editorial mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              Clinicians Patients Trust Most.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Hand-picked specialists with over 98% positive reviews, active OPD consultation slots, and direct hospital ties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/doctors"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 mr-2 hidden sm:block"
            >
              Browse all 450+ doctors &rarr;
            </Link>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Previous doctors"
                className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Next doctors"
                className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div ref={emblaRef} className="mt-10 overflow-hidden" aria-roledescription="carousel">
          <div className="flex touch-pan-y gap-6">
            {doctorList.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : Math.min(index, 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                className="min-w-0 flex-[0_0_92%] sm:flex-[0_0_48%] lg:flex-[0_0_calc(33.333%-16px)]"
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
