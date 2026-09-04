import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  FileText,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerItem, StaggerReveal } from "@/components/motion/StaggerReveal";

const patientPerks = [
  { label: "Direct Access to 450+ Verified Doctors", icon: Search },
  { label: "Automated SMS & WhatsApp Appointment Reminders", icon: Bell },
  { label: "Lifetime Digital Prescription Vault (PDF Download)", icon: FileText },
  { label: "Zero Convenience Fees & Transparent OPD Rates", icon: ShieldCheck },
];

const doctorPerks = [
  { label: "Streamlined Clinical Calendar & OPD Slot Control", icon: CalendarCheck },
  { label: "1-Click Digital Prescription Generation & Dosage Pad", icon: Stethoscope },
  { label: "Complete Patient Medical Context & History on Screen", icon: UserRound },
  { label: "Drastic No-Show Reduction with Instant Confirmation", icon: CheckCircle2 },
];

export default function ForEveryone() {
  return (
    <AnimatedSection id="for-everyone" className="border-b border-slate-200/80 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            <HeartPulse size={13} className="text-blue-600" />
            <span>Dual Clinical Ecosystem</span>
          </div>
          <h2 className="font-editorial mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            Designed for Patients. Loved by Doctors.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Whether you are booking a routine health checkup or managing an active clinical schedule,
            Schedula delivers an effortless clinical experience.
          </p>
        </div>

        {}
        <StaggerReveal className="mt-14 grid gap-8 lg:grid-cols-2">
          {}
          <StaggerItem className="depth-card relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-8 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:p-10">
            <div className="inline-block rounded-xl bg-blue-100/70 px-3 py-1 text-xs font-bold text-blue-900">
              For Patients & Families
            </div>
            <h3 className="font-editorial mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Healthcare, Without the Frustration.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Find specialists who understand your needs. Book transparently, skip waiting rooms, and keep your
              entire family’s medical records synchronized.
            </p>

            <div className="mt-8 space-y-3.5 border-t border-slate-100 pt-6">
              {patientPerks.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-700">
                      <Icon size={14} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow"
              >
                <span>Find and Book a Doctor</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </StaggerItem>

          {}
          <StaggerItem className="relative overflow-hidden rounded-3xl border border-blue-900/10 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 p-8 text-white shadow-xl sm:p-10">
            <div className="inline-block rounded-xl bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-300">
              For Doctors & Healthcare Practices
            </div>
            <h3 className="font-editorial mt-4 text-2xl font-bold text-white sm:text-3xl">
              A Calm, Efficient Clinical Workspace.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Free your day from administrative overhead. Manage appointment requests, publish slots, and create
              custom prescriptions on any device.
            </p>

            <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
              {doctorPerks.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                    <div className="grid size-7 place-items-center rounded-lg bg-blue-400/15 text-blue-300">
                      <Icon size={14} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md transition hover:from-blue-400 hover:to-emerald-400"
              >
                <span>Register as a Specialist</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </AnimatedSection>
  );
}
