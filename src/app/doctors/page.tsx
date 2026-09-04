"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck2, Clock3, MapPin, Search, ShieldCheck, SlidersHorizontal, Stethoscope, UsersRound, X, } from "lucide-react";
import DoctorCard from "@/components/doctors/DoctorCard";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ensureDoctorSlotsSeeded, applyDoctorReviewStats, getDoctorReviews, getAvailableSlotsForDoctor, getRegisteredDoctors, mergeDoctorProfiles, } from "@/lib/client-storage";
import { doctors, specialties } from "@/lib/mock-data/doctors";
import type { Doctor } from "@/types/doctor";
type SortOption = "recommended" | "rating" | "experience" | "fee-low";
const specialtyDescriptions: Record<string, string> = {
    All: "All doctors",
    "General Medicine": "Primary care",
    Dermatology: "Skin & hair",
    Cardiology: "Heart care",
    Orthopedics: "Bones & joints",
    Pediatrics: "Child care",
    Neurology: "Brain & nerves",
};
export default function DoctorsPage() {
    const reduceMotion = useReducedMotion();
    const [query, setQuery] = useState("");
    const [specialty, setSpecialty] = useState("All");
    const [location, setLocation] = useState("");
    const [availabilityOnly, setAvailabilityOnly] = useState(false);
    const [maximumFee, setMaximumFee] = useState(2000);
    const [minimumExperience, setMinimumExperience] = useState(0);
    const [sortBy, setSortBy] = useState<SortOption>("recommended");
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const loadDoctors = () => {
        const submittedReviews = getDoctorReviews();
        const combined = mergeDoctorProfiles(doctors, getRegisteredDoctors()).map((doctor) => applyDoctorReviewStats(doctor, submittedReviews));
        const withAvailability = combined.map((doctor) => {
            ensureDoctorSlotsSeeded(doctor.id, doctor.slots);
            const slotCount = getAvailableSlotsForDoctor(doctor.id).length;
            return {
                ...doctor,
                availability: slotCount > 0
                    ? `${slotCount} slot${slotCount === 1 ? "" : "s"} available`
                    : "No slots available",
            };
        });
        setAllDoctors(withAvailability);
        setIsLoading(false);
    };
    useEffect(() => {
        const initializeTimer = window.setTimeout(() => {
            loadDoctors();
            const params = new URLSearchParams(window.location.search);
            const specialtyFromUrl = params.get("specialty");
            const locationFromUrl = params.get("location");
            const availabilityFromUrl = params.get("availability");
            if (specialtyFromUrl &&
                specialties.includes(specialtyFromUrl as (typeof specialties)[number])) {
                setSpecialty(specialtyFromUrl);
            }
            if (locationFromUrl)
                setLocation(locationFromUrl);
            if (availabilityFromUrl && availabilityFromUrl !== "Any day")
                setAvailabilityOnly(true);
        }, 0);
        window.addEventListener("focus", loadDoctors);
        window.addEventListener("schedula-reviews-change", loadDoctors);
        window.addEventListener("storage", loadDoctors);
        return () => {
            window.clearTimeout(initializeTimer);
            window.removeEventListener("focus", loadDoctors);
            window.removeEventListener("schedula-reviews-change", loadDoctors);
            window.removeEventListener("storage", loadDoctors);
        };
    }, []);
    const visible = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedLocation = location.trim().toLowerCase();
        const matches = allDoctors.filter((doctor) => {
            const matchesSpecialty = specialty === "All" || doctor.specialty === specialty;
            const matchesLocation = !normalizedLocation ||
                doctor.location.toLowerCase().includes(normalizedLocation);
            const matchesQuery = !normalizedQuery ||
                doctor.name.toLowerCase().includes(normalizedQuery) ||
                doctor.specialty.toLowerCase().includes(normalizedQuery) ||
                doctor.bio.toLowerCase().includes(normalizedQuery);
            const matchesAvailability = !availabilityOnly || !doctor.availability.startsWith("No");
            const matchesFee = doctor.fee <= maximumFee;
            const matchesExperience = doctor.experience >= minimumExperience;
            return matchesSpecialty && matchesLocation && matchesQuery && matchesAvailability && matchesFee && matchesExperience;
        });
        return [...matches].sort((a, b) => {
            if (sortBy === "rating")
                return b.rating - a.rating;
            if (sortBy === "experience")
                return b.experience - a.experience;
            if (sortBy === "fee-low")
                return a.fee - b.fee;
            return b.rating * Math.log10(b.reviews + 10) - a.rating * Math.log10(a.reviews + 10);
        });
    }, [allDoctors, availabilityOnly, location, maximumFee, minimumExperience, query, sortBy, specialty]);
    const hasActiveFilters = Boolean(query || location || specialty !== "All" || availabilityOnly || maximumFee < 2000 || minimumExperience > 0);
    const clearFilters = () => {
        setQuery("");
        setLocation("");
        setSpecialty("All");
        setAvailabilityOnly(false);
        setMaximumFee(2000);
        setMinimumExperience(0);
    };
    return (<>
      <Navbar />

      <main className="min-h-screen bg-slate-50/70">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }} className="relative overflow-hidden bg-[#101a3a] pb-20 text-white sm:pb-24">
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:px-8">
            <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
                <Stethoscope size={13}/>
                <span>Verified Outpatient & Telehealth Network</span>
              </div>
              <h1 className="font-editorial mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Find Board-Certified Specialists in Kolkata.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Instant OPD appointments and secure video consultations. Filter by experience, hospital affiliations,
                and next available time slot.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-400"/> 100% Medical Council Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 size={15} className="text-blue-400"/> Real-time Slot Sync
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarCheck2 size={15} className="text-blue-400"/> Zero Booking Fee
                </span>
              </div>
            </motion.div>

            <div className="hidden lg:block">
              <div className="rounded-3xl border border-blue-300/20 bg-[#18264d] p-6 shadow-[0_22px_55px_-32px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                  <span className="font-bold text-blue-300">Clinical Overview</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Live Roster
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-2xl border border-blue-300/10 bg-[#21315c] p-3">
                    <p className="text-2xl font-extrabold text-white">{allDoctors.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Specialists</p>
                  </div>
                  <div className="rounded-2xl border border-blue-300/10 bg-[#21315c] p-3">
                    <p className="text-2xl font-extrabold text-blue-300">30+</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Hospital OPDs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>


        <motion.section initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
          <div className="depth-panel mx-auto max-w-7xl rounded-2xl p-3 shadow-lg border border-slate-200">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <Search className="size-5 shrink-0 text-blue-600"/>
                <span className="sr-only">Search doctors</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Doctor name, condition, or specialty..." className="min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"/>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                <MapPin className="size-5 shrink-0 text-cyan-600"/>
                <span className="sr-only">Search by location</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Area in Kolkata (e.g. Salt Lake, Park Street)" className="min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"/>
              </label>

              <button type="button" onClick={() => document.getElementById("doctor-results")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-700/20 transition hover:from-blue-700 hover:to-blue-800">
                <Search className="size-4"/>
                <span>Filter Doctors</span>
              </button>
            </div>
          </div>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.06 }} transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }} id="doctor-results" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            {filtersOpen && <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"/>}
            <aside className={`${filtersOpen ? "fixed inset-x-3 bottom-3 z-50 block max-h-[85vh] overflow-y-auto shadow-2xl" : "hidden"} depth-panel h-fit rounded-2xl p-5 border border-slate-200/90 bg-white lg:sticky lg:top-24 lg:block lg:max-h-none lg:overflow-visible`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-blue-600"/>
                  <h2 className="font-bold text-slate-900 text-sm">Filter Specialists</h2>
                </div>
                {hasActiveFilters && (<button type="button" onClick={clearFilters} className="text-xs font-bold text-blue-700 hover:text-blue-900">
                    Reset
                  </button>)}
                <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="grid size-8 place-items-center rounded-lg hover:bg-slate-100 lg:hidden"><X size={17}/></button>
              </div>

              <div className="mt-4 space-y-1">
                {specialties.map((item) => {
            const selected = specialty === item;
            return (<button type="button" key={item} onClick={() => setSpecialty(item)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${selected
                    ? "bg-blue-50 font-bold text-blue-900 border border-blue-200/80"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                      <span>
                        <span className="block">{item}</span>
                        <span className={`mt-0.5 block text-[10px] ${selected ? "text-blue-700" : "text-slate-600"}`}>
                          {specialtyDescriptions[item]}
                        </span>
                      </span>
                      {selected && <motion.span layoutId="active-specialty" className="size-2 rounded-full bg-blue-600" transition={{ type: "spring", stiffness: 420, damping: 30 }}/>}
                    </button>);
        })}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Availability</h3>
                <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={availabilityOnly} onChange={(event) => setAvailabilityOnly(event.target.checked)} className="size-4 rounded accent-blue-600"/>
                  Only with Available Slots
                </label>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Max Fee</h3>
                  <span className="text-xs font-bold text-blue-700">₹{maximumFee}</span>
                </div>
                <input type="range" min="500" max="2000" step="100" value={maximumFee} onChange={(event) => setMaximumFee(Number(event.target.value))} className="mt-3 w-full accent-blue-600"/>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Experience Level</h3>
                <select value={minimumExperience} onChange={(event) => setMinimumExperience(Number(event.target.value))} className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500">
                  <option value={0}>Any experience</option>
                  <option value={5}>5+ years practice</option>
                  <option value={10}>10+ years practice</option>
                  <option value={15}>15+ years practice</option>
                </select>
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand)]"/>
                  <div>
                    <p className="text-sm font-semibold">Verified profiles</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Credentials and professional details are reviewed.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><UsersRound size={17}/></span>
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Available specialists</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    {isLoading ? "Finding doctors…" : `${visible.length} doctor${visible.length === 1 ? "" : "s"} found`}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {specialty === "All" ? "Across all specialties" : `Specializing in ${specialty}`}
                  </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-semibold lg:hidden"><SlidersHorizontal size={16}/> Filters</button>
                <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  Sort by
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 font-semibold text-[var(--foreground)] outline-none focus:border-[var(--brand)]">
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest rated</option>
                    <option value="experience">Most experienced</option>
                    <option value="fee-low">Lowest fee</option>
                  </select>
                </label>
                </div>
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
              {isLoading ? (<motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (<div key={item} className="h-80 animate-pulse rounded-xl border border-[var(--line)] bg-white"/>))}
                </motion.div>) : visible.length > 0 ? (<motion.div layout key="results" className="grid gap-5 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {visible.map((doctor, index) => (<motion.div layout key={doctor.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -14, scale: reduceMotion ? 1 : 0.97 }} transition={{ duration: 0.38, delay: reduceMotion ? 0 : Math.min(index * 0.055, 0.22), ease: [0.22, 1, 0.36, 1] }}>
                        <DoctorCard doctor={doctor}/>
                      </motion.div>))}
                  </AnimatePresence>
                </motion.div>) : (<motion.div key="empty" initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-dashed border-[var(--line)] bg-white px-6 py-16 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Search className="size-5"/>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No matching doctors</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                    Try a different specialty, doctor name, or nearby location.
                  </p>
                  <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]">
                    <X className="size-4"/>
                    Reset filters
                  </button>
                </motion.div>)}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </>);
}
