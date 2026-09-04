import Link from "next/link";
import { AlertTriangle, Building2, PhoneCall, ShieldCheck, Stethoscope } from "lucide-react";

const groups = [
  {
    title: "Patient Care",
    links: [
      ["Find Doctors", "/doctors"],
      ["My Appointments", "/my-appointments"],
      ["Health Profile", "/profile"],
      ["Book Follow-Up", "/doctors"],
    ],
  },
  {
    title: "Clinical Network",
    links: [
      ["Doctor Sign In", "/login"],
      ["Doctor Registration", "/signup"],
      ["Clinical Workspace", "/doctor-dashboard"],
      ["OPD Calendar", "/doctor-dashboard/calendar"],
    ],
  },
  {
    title: "Specialties",
    links: [
      ["General Medicine", "/doctors?specialty=General+Medicine"],
      ["Cardiology & ECG", "/doctors?specialty=Cardiology"],
      ["Dermatology", "/doctors?specialty=Dermatology"],
      ["Pediatrics", "/doctors?specialty=Pediatrics"],
    ],
  },
  {
    title: "Accreditation & Trust",
    links: [
      ["HIPAA Compliance", "#"],
      ["NABH Standards", "#"],
      ["Data Privacy Policy", "#"],
      ["Terms of Consultation", "#"],
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      {}
      <div className="border-b border-white/10 bg-slate-900/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <ShieldCheck size={14} /> NABH Accredited Standards
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <ShieldCheck size={14} /> HIPAA & 256-Bit Encrypted Records
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 size={14} /> 30+ Partner Hospitals in Kolkata
            </span>
          </div>

          <a href="tel:1800724338" className="inline-flex items-center gap-1.5 text-blue-300 font-bold hover:text-white">
            <PhoneCall size={13} />
            <span>24/7 Helpline: 1800-SCHEDULA</span>
          </a>
        </div>
      </div>

      {}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white">
                <Stethoscope size={20} strokeWidth={2.2} />
              </div>
              <span className="font-editorial text-3xl font-extrabold tracking-tight text-white">
                Schedula<span className="text-blue-400">.</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
              Kolkata’s premier doctor consultation platform. Transforming clinical coordination with verified
              practitioners, live OPD tokens, and integrated digital health records.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-200/90 leading-relaxed">
              <AlertTriangle size={14} className="mr-1 inline" /> <strong>Emergency Notice:</strong> Schedula is for outpatient consultations and scheduled care. In life-threatening emergencies, immediately dial <strong>108</strong> or proceed to the nearest emergency room.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs text-slate-400 transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Schedula Healthcare Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Operational across Kolkata • Salt Lake, Park Street, New Town, Anandapur</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
