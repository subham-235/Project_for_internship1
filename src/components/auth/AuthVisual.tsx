"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Check, FileText, ShieldCheck } from "lucide-react";

const AppointmentScene = dynamic(() => import("@/components/home/AppointmentScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-white/[0.025]" />,
});

type AuthVisualProps = {
  mode: "login" | "signup";
};

const content = {
  login: {
    index: "ACCESS / 01",
    eyebrow: "Your care, in one place",
    title: ["Back to your", "care, without", "the friction."],
    note: "Appointments, confirmations and prescriptions stay connected from one visit to the next.",
  },
  signup: {
    index: "JOIN / 02",
    eyebrow: "Healthcare, reworked",
    title: ["One account.", "Every step of", "your care."],
    note: "Join as a patient or clinician and keep the entire appointment experience moving clearly.",
  },
};

const benefits = [
  { icon: CalendarCheck, label: "Live scheduling" },
  { icon: ShieldCheck, label: "Verified access" },
  { icon: FileText, label: "Connected records" },
];

export default function AuthVisual({ mode }: AuthVisualProps) {
  const reduceMotion = useReducedMotion();
  const current = content[mode];

  return (
    <aside className="relative hidden min-h-[calc(100vh-68px)] overflow-hidden bg-[var(--foreground)] text-white lg:flex lg:flex-col">
      <div className="relative z-20 flex items-center justify-between border-b border-white/10 px-8 py-5 text-[9px] font-semibold uppercase tracking-[0.23em] text-white/45 xl:px-12">
        <span>{current.index}</span>
        <span>Kolkata / India</span>
      </div>

      <div className="relative z-20 px-8 pt-9 xl:px-12 xl:pt-11">
        <motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
          <span className="h-px w-8 bg-[var(--brand)]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.21em] text-[var(--accent-soft)]">{current.eyebrow}</p>
        </motion.div>
        <h1 className="font-editorial mt-6 text-[3.25rem] leading-[0.92] tracking-[-0.06em] xl:text-[4.2rem]">
          {current.title.map((line, index) => (
            <span key={line} className="block overflow-hidden pb-1">
              <motion.span
                initial={{ y: reduceMotion ? 0 : "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, delay: reduceMotion ? 0 : 0.1 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className={index === 2 ? "block text-[var(--brand)]" : "block"}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.55 }} className="mt-5 max-w-md text-sm leading-6 text-white/55">
          {current.note}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-x-0 bottom-16 top-[43%]"
      >
        <div className="absolute inset-0 translate-x-[22%] scale-[0.76] xl:translate-x-[27%] xl:scale-[0.82]">
          <AppointmentScene />
        </div>
      </motion.div>

      <div className="relative z-20 mt-auto grid grid-cols-3 border-t border-white/10 bg-[var(--foreground)]/90 backdrop-blur-sm">
        {benefits.map(({ icon: Icon, label }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: reduceMotion ? 0 : 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.08 }} className="border-r border-white/10 px-4 py-5 last:border-r-0 xl:px-6">
            <Icon size={16} className="text-[var(--brand)]" />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/65">{label}</p>
          </motion.div>
        ))}
      </div>

      <motion.span
        aria-hidden="true"
        animate={reduceMotion ? undefined : { rotate: [0, 45, 45, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 1.5 }}
        className="absolute right-8 top-[39%] z-20 size-3 bg-[var(--brand)]"
      />
      <span className="absolute bottom-24 left-8 z-20 flex items-center gap-2 text-[9px] uppercase tracking-[0.17em] text-white/30"><Check size={12} /> Move your pointer</span>
    </aside>
  );
}
