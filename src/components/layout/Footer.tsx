import Link from "next/link";
import { ShieldCheck, Stethoscope } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
            <Stethoscope size={16} />
          </div>
          <span className="font-editorial text-lg font-bold text-slate-900">
            Schedula<span className="text-blue-600">.</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/doctors" className="hover:text-blue-700">Find Doctors</Link>
          <Link href="/my-appointments" className="hover:text-blue-700">My Appointments</Link>
          <Link href="/login" className="hover:text-blue-700">Sign In</Link>
          <span className="inline-flex items-center gap-1 text-blue-700">
            <ShieldCheck size={13} /> NABH Standards
          </span>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Schedula. Clinical Healthcare Coordination.
        </p>
      </div>
    </footer>
  );
}
