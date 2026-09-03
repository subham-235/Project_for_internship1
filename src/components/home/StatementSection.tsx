import { Clock, FileCheck2, HeartPulse, ShieldCheck } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const stats = [
  {
    icon: Clock,
    title: "Under 10 Mins Wait",
    desc: "Guaranteed priority queuing with live clinic queue tracking and notifications.",
  },
  {
    icon: ShieldCheck,
    title: "100% Verified MDs",
    desc: "Every practitioner holds valid Medical Council registration and verified credentials.",
  },
  {
    icon: FileCheck2,
    title: "Instant e-Prescriptions",
    desc: "Access verified digital prescriptions and diagnostic orders right from your patient portal.",
  },
  {
    icon: HeartPulse,
    title: "Continuous Patient Care",
    desc: "One single health timeline connecting follow-ups, diagnostic reports, and rebooking.",
  },
];

export default function StatementSection() {
  return (
    <AnimatedSection className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 py-24 text-white sm:py-32">
      {/* Glow Orbs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-3">
          <span className="h-1 w-12 rounded-full bg-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
            The Schedula Care Standard
          </span>
        </div>

        <h2 className="font-editorial mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Healthcare built around your dignity, clarity, and time.
        </h2>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          No busy phone lines. No lost lab reports. No vague scheduling. Just trusted doctors and clear
          treatment journeys in one place.
        </p>

        {/* 4-Column High Density Metric Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-blue-400/40 hover:bg-white/10"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-editorial text-lg font-bold text-white">{stat.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{stat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
