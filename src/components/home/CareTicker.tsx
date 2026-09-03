import { Award, Building2, CheckCircle2, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";

const hospitals = [
  "Apollo Hospitals",
  "Fortis Healthcare",
  "AIIMS Network",
  "Manipal Hospitals",
  "Medica Superspecialty",
  "Woodlands Multispeciality",
  "AMRI Hospitals",
];

const clinicalMetrics = [
  { label: "450+ Board Certified MDs", icon: Stethoscope },
  { label: "14,800+ Verified Visits", icon: Users },
  { label: "99.2% Patient Satisfaction", icon: Award },
  { label: "Instant SMS & App Ticket", icon: CheckCircle2 },
  { label: "NABH & HIPAA Compliant", icon: ShieldCheck },
  { label: "Avg Wait: 8 Mins", icon: HeartPulse },
];

export default function CareTicker() {
  const repeatedMetrics = [...clinicalMetrics, ...clinicalMetrics, ...clinicalMetrics];

  return (
    <div className="border-y border-slate-200 bg-white" aria-label="Hospital networks and metrics">
      {/* Top Hospitals Affiliation Line */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-600 sm:block hidden">
            Affiliated Healthcare Networks:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs font-semibold text-slate-600 sm:justify-end">
            {hospitals.map((hospital) => (
              <span key={hospital} className="inline-flex items-center gap-1.5 transition hover:text-blue-700">
                <Building2 size={12} className="text-blue-600" />
                {hospital}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Animated Pulse Marquee */}
      <div className="overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 py-3 text-white">
        <div className="schedula-marquee flex w-max items-center">
          {repeatedMetrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <span
                key={`${item.label}-${index}`}
                className="flex items-center whitespace-nowrap px-6 text-xs font-semibold tracking-wide text-slate-200"
              >
                <Icon size={14} className="mr-2 text-blue-400" />
                <span>{item.label}</span>
                <span className="ml-6 size-1 rounded-full bg-blue-400/60" aria-hidden="true" />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

