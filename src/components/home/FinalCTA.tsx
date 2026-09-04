import Link from "next/link";
import { ArrowRight, CheckCircle2, PhoneCall, ShieldCheck, Stethoscope } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerItem, StaggerReveal } from "@/components/motion/StaggerReveal";

export default function FinalCTA() {
  return (
    <AnimatedSection className="border-b border-slate-200/80 bg-slate-50/70 px-4 py-16 sm:px-6 sm:py-24">
      <div className="landing-glow-sweep relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-900/10 bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 p-8 text-center text-white shadow-2xl sm:p-14 lg:p-16">
        {}
        <div className="landing-orb pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="landing-orb landing-orb-reverse pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-cyan-500/20 blur-3xl" />

        <StaggerReveal className="relative z-10 mx-auto max-w-3xl" delay={0.08}>
          <StaggerItem lift={false} className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Stethoscope size={14} />
            <span>Healthcare Made Respectful & Efficient</span>
          </StaggerItem>

          <StaggerItem lift={false}><h2 className="font-editorial mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Your health cannot wait. Neither should your appointment.</h2></StaggerItem>

          <StaggerItem lift={false}><p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">Connect with 450+ verified specialists in Kolkata. Reserve your live OPD slot or video consultation in under 60 seconds.</p></StaggerItem>

          <StaggerItem lift={false} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/doctors"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-emerald-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-blue-500/25 transition hover:from-blue-300 hover:to-emerald-300 hover:scale-[1.02]"
            >
              <span>Find Your Specialist</span>
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <span>Join as a Doctor</span>
            </Link>
          </StaggerItem>

          <StaggerItem lift={false} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-8 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-blue-400" /> Free rescheduling
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-blue-400" /> Zero booking fee
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-400" /> Verified hospital network
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall size={14} className="text-blue-400" /> 24/7 Helpline: 1800-SCHEDULA
            </span>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </AnimatedSection>
  );
}
