"use client";
import { useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, FileText, MapPin, Search, Sparkles, Stethoscope, Zap, } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
const steps = [
    {
        step: "01",
        title: "Symptom & Specialty Match",
        note: "Filter 450+ doctors by specialty, nearby clinics in Kolkata, accepted insurances, and real-time availability.",
        icon: Search,
        detail: "Instant matching by condition (e.g. fever, migraine, joint pain)",
    },
    {
        step: "02",
        title: "1-Click Slot Reservation",
        note: "Pick your exact OPD slot or secure tele-consult slot. Zero booking fees and no advance payment required.",
        icon: CalendarCheck,
        detail: "Real-time calendar synchronization prevents double-booking",
    },
    {
        step: "03",
        title: "Fast-Track In-Clinic or Video Consult",
        note: "Show your digital QR token at the clinic reception to skip the registration queue, or join 1-on-1 encrypted video.",
        icon: Stethoscope,
        detail: "Average wait time under 10 minutes across partner hospitals",
    },
    {
        step: "04",
        title: "Unified Digital Rx & Follow-ups",
        note: "Doctor issues your digital prescription, medicine schedule, and lab recommendations directly in your patient account.",
        icon: FileText,
        detail: "Download PDF anytime or share directly with pharmacy",
    },
];
export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);
    return (<AnimatedSection id="how-it-works" className="border-b border-slate-200/80 bg-slate-50/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <Sparkles size={13} className="text-blue-600"/>
              <span>Step-by-Step Clinical Care</span>
            </div>

            <h2 className="font-editorial mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              From First Symptom to Complete Recovery.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Every detail is engineered to eliminate phone queues, clinic confusion, and misplaced records.
            </p>


            <div className="mt-8 space-y-4">
              {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeStep === index;
            return (<motion.div key={item.step} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} whileHover={{ x: 4 }} transition={{ duration: 0.5, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }} onClick={() => setActiveStep(index)} className={`cursor-pointer rounded-2xl border p-5 transition-all ${isActive
                    ? "border-blue-400 bg-white shadow-md ring-2 ring-blue-100"
                    : "border-slate-200/90 bg-white/70 hover:border-slate-300 hover:bg-white"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"}`}>
                        <Icon size={20}/>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-editorial text-base font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <span className="text-xs font-bold text-blue-700">Step {item.step}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.note}</p>

                        {isActive && (<div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-900">
                            <CheckCircle2 size={13} className="text-blue-600"/>
                            <span>{item.detail}</span>
                          </div>)}
                      </div>
                    </div>
                  </motion.div>);
        })}
            </div>
          </div>


          <motion.div initial={{ opacity: 0, x: 30, rotate: 1 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
                    <Stethoscope size={16}/>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Schedula Clinical Pass</p>
                    <p className="text-[10px] text-slate-600">Fast-Track OPD Access</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Confirmed
                </span>
              </div>


              <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Doctor & Clinic
                    </span>
                    <p className="font-editorial text-sm font-bold text-slate-900">Dr. Anika Rao, MD</p>
                    <p className="text-xs text-blue-700">Internal Medicine • Fortis Hospital</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Token #
                    </span>
                    <p className="font-mono text-base font-extrabold text-slate-900">#A-14</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-600">Date & Slot</span>
                    <strong className="text-slate-800">Today • 4:00 PM</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-600">Mode</span>
                    <strong className="text-blue-700">In-Clinic Visit</strong>
                  </div>
                </div>
              </div>


              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-blue-900">
                  <span className="flex items-center gap-2 font-medium">
                    <Clock size={14} className="text-blue-600"/>
                    Doctor is on schedule
                  </span>
                  <span className="font-bold">2 patients ahead</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <MapPin size={14} className="text-cyan-600"/>
                    Room 204, 2nd Floor, OPD Tower
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">Directions</span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <span className="text-[11px] text-slate-600">
                  <Zap size={13} className="mr-1 inline text-blue-600"/> All reports & prescriptions are automatically archived in your account.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>);
}
