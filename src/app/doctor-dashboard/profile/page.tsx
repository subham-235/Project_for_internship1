"use client";


import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe2,
  GraduationCap,
  ImageIcon,
  Languages as LanguagesIcon,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  Doctor,
} from "@/types/doctor";

import type {
  DoctorSlot,
} from "@/types/availability";

import {
  doctors,
  specialties,
} from "@/lib/mock-data/doctors";

import {
  deleteDoctorSlot,
  ensureDoctorSlotsSeeded,
  getCurrentUser,
  getDoctorSlots,
  getRegisteredDoctors,
  mergeDoctorProfiles,
  saveCurrentUser,
  saveDoctorSlot,
  saveDoctorSlots,
  saveRegisteredDoctor,
  type StoredUser,
} from "@/lib/client-storage";


const WEEKDAYS = [
  {
    value:
      1,
    label:
      "Mon",
  },
  {
    value:
      2,
    label:
      "Tue",
  },
  {
    value:
      3,
    label:
      "Wed",
  },
  {
    value:
      4,
    label:
      "Thu",
  },
  {
    value:
      5,
    label:
      "Fri",
  },
  {
    value:
      6,
    label:
      "Sat",
  },
  {
    value:
      0,
    label:
      "Sun",
  },
];

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500";


function normalize(
  value: string
) {
  return value
    .trim()
    .toLowerCase();
}


function initials(
  value: string
) {
  return value
    .split(" ")
    .filter(Boolean)
    .filter(
      (item) =>
        item
          .toLowerCase() !==
        "dr."
    )
    .slice(
      0,
      2
    )
    .map(
      (item) =>
        item[0]
          ?.toUpperCase()
    )
    .join("");
}


function today() {
  const date =
    new Date();

  return [
    date.getFullYear(),

    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    ),

    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    ),
  ].join("-");
}


function displayTime(
  value: string
) {
  const [
    hourString,
    minuteString,
  ] =
    value.split(":");

  let hour =
    Number(
      hourString
    );

  const minute =
    minuteString;

  const period =
    hour >= 12
      ? "PM"
      : "AM";

  if (
    hour === 0
  ) {
    hour =
      12;
  } else if (
    hour > 12
  ) {
    hour -=
      12;
  }

  return `${String(
    hour
  ).padStart(
    2,
    "0"
  )}:${minute} ${period}`;
}


function displayDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday:
        "short",
      day:
        "numeric",
      month:
        "short",
      year:
        "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
}


export default function DoctorProfilePage() {
  const router =
    useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<
      StoredUser | null
    >(null);

  const [
    doctor,
    setDoctor,
  ] =
    useState<
      Doctor | null
    >(null);

  const [
    slots,
    setSlots,
  ] =
    useState<
      DoctorSlot[]
    >([]);


  const [
    name,
    setName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    specialty,
    setSpecialty,
  ] =
    useState("");

  const [
    registrationNumber,
    setRegistrationNumber,
  ] =
    useState("");

  const [
    experience,
    setExperience,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    fee,
    setFee,
  ] =
    useState("");

  const [
    bio,
    setBio,
  ] =
    useState("");

  const [
    image,
    setImage,
  ] =
    useState("");

  const [
    education,
    setEducation,
  ] =
    useState("");

  const [
    languages,
    setLanguages,
  ] =
    useState("");


  const [
    singleDate,
    setSingleDate,
  ] =
    useState(
      today()
    );

  const [
    singleTime,
    setSingleTime,
  ] =
    useState("");


  const [
    recurringStart,
    setRecurringStart,
  ] =
    useState(
      today()
    );

  const [
    recurringEnd,
    setRecurringEnd,
  ] =
    useState(
      today()
    );

  const [
    recurringTime,
    setRecurringTime,
  ] =
    useState("");

  const [
    recurringDays,
    setRecurringDays,
  ] =
    useState<
      number[]
    >([]);


  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  const refreshSlots =
    (
      doctorId:
        string
    ) => {
      setSlots(
        getDoctorSlots(
          doctorId
        )
      );
    };


  useEffect(() => {
    const user =
      getCurrentUser();

    if (
      !user ||
      user.role !==
        "doctor"
    ) {
      router.replace(
        "/login"
      );

      return;
    }


    const allDoctors =
      mergeDoctorProfiles(
        doctors,
        getRegisteredDoctors()
      );


    const profile =
      allDoctors.find(
        (item) =>
          item.userId ===
          user.id
      ) ??
      allDoctors.find(
        (item) =>
          item.id ===
          user.id
      ) ??
      allDoctors.find(
        (item) =>
          normalize(
            item.name
          ) ===
          normalize(
            user.name
          )
      );


    if (
      !profile
    ) {
      return;
    }


    ensureDoctorSlotsSeeded(
      profile.id,
      profile.slots
    );


    setCurrentUser(
      user
    );

    setDoctor(
      profile
    );

    setName(
      profile.name
    );

    setPhone(
      profile.phone ??
      ""
    );

    setSpecialty(
      profile.specialty
    );

    setRegistrationNumber(
      profile.registrationNumber ??
      ""
    );

    setExperience(
      String(
        profile.experience
      )
    );

    setLocation(
      profile.location
    );

    setFee(
      String(
        profile.fee
      )
    );

    setBio(
      profile.bio
    );

    setImage(
      profile.image ??
      ""
    );

    setEducation(
      profile.education.join(
        ", "
      )
    );

    setLanguages(
      profile.languages.join(
        ", "
      )
    );

    refreshSlots(
      profile.id
    );

  }, [
    router,
  ]);


  const saveProfile =
    () => {

      setError("");

      setMessage("");

      if (
        !doctor ||
        !currentUser
      ) {
        return;
      }

      if (
        !name.trim() ||
        !specialty ||
        !location.trim() ||
        Number(
          fee
        ) <= 0
      ) {
        setError(
          "Please complete the required profile details."
        );

        return;
      }


      const updated:
        Doctor = {
        ...doctor,

        name:
          name.trim(),

        initials:
          initials(
            name
          ),

        phone:
          phone.replace(
            /\D/g,
            ""
          ),

        specialty,

        registrationNumber:
          registrationNumber.trim(),

        experience:
          Number(
            experience
          ),

        location:
          location.trim(),

        fee:
          Number(
            fee
          ),

        bio:
          bio.trim(),

        image:
          image.trim() ||
          undefined,

        education:
          education
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(
              Boolean
            ),

        languages:
          languages
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(
              Boolean
            ),
      };


      saveRegisteredDoctor(
        updated
      );

      saveCurrentUser({
        ...currentUser,

        name:
          updated.name,
      });


      setDoctor(
        updated
      );

      setCurrentUser({
        ...currentUser,

        name:
          updated.name,
      });


      setMessage(
        "Profile updated successfully."
      );
    };


  const createSingleSlot =
    () => {

      setError("");

      setMessage("");

      if (
        !doctor ||
        !singleDate ||
        !singleTime
      ) {
        setError(
          "Select a date and time."
        );

        return;
      }


      const formattedTime =
        displayTime(
          singleTime
        );


      const startsAt =
        new Date(
          `${singleDate}T${singleTime}:00`
        );


      if (
        startsAt.getTime() <=
        Date.now()
      ) {
        setError(
          "Availability must be in the future."
        );

        return;
      }


      const slot:
        DoctorSlot = {
        id:
          `slot-${Date.now()}`,

        doctorId:
          doctor.id,

        date:
          singleDate,

        time:
          formattedTime,

        status:
          "available",

        createdAt:
          new Date()
            .toISOString(),
      };


      const saved =
        saveDoctorSlot(
          slot
        );


      if (
        !saved
      ) {
        setError(
          "This slot already exists."
        );

        return;
      }


      refreshSlots(
        doctor.id
      );

      setSingleTime("");

      setMessage(
        "Availability slot created."
      );
    };


  const toggleDay =
    (
      value:
        number
    ) => {

      setRecurringDays(
        (
          current
        ) =>
          current.includes(
            value
          )
            ? current.filter(
                (item) =>
                  item !==
                  value
              )
            : [
                ...current,
                value,
              ]
      );
    };


  const createRecurringSlots =
    () => {

      setError("");

      setMessage("");

      if (
        !doctor ||
        !recurringStart ||
        !recurringEnd ||
        !recurringTime ||
        recurringDays.length ===
          0
      ) {
        setError(
          "Complete all recurring availability options."
        );

        return;
      }


      const start =
        new Date(
          `${recurringStart}T00:00:00`
        );

      const end =
        new Date(
          `${recurringEnd}T00:00:00`
        );


      if (
        end <
        start
      ) {
        setError(
          "End date cannot be before start date."
        );

        return;
      }


      const maxEnd =
        new Date(
          start
        );

      maxEnd.setDate(
        maxEnd.getDate() +
          90
      );


      if (
        end >
        maxEnd
      ) {
        setError(
          "Recurring availability can be created for up to 90 days."
        );

        return;
      }


      const groupId =
        `recurring-${Date.now()}`;

      const generated:
        DoctorSlot[] =
          [];


      const cursor =
        new Date(
          start
        );


      while (
        cursor <=
        end
      ) {

        if (
          recurringDays.includes(
            cursor.getDay()
          )
        ) {

          const year =
            cursor.getFullYear();

          const month =
            String(
              cursor.getMonth() +
                1
            ).padStart(
              2,
              "0"
            );

          const day =
            String(
              cursor.getDate()
            ).padStart(
              2,
              "0"
            );

          const date =
            `${year}-${month}-${day}`;


          const startsAt =
            new Date(
              `${date}T${recurringTime}:00`
            );


          if (
            startsAt.getTime() >
            Date.now()
          ) {

            generated.push({
              id:
                `slot-${Date.now()}-${generated.length}`,

              doctorId:
                doctor.id,

              date,

              time:
                displayTime(
                  recurringTime
                ),

              status:
                "available",

              recurringGroupId:
                groupId,

              createdAt:
                new Date()
                  .toISOString(),
            });
          }
        }


        cursor.setDate(
          cursor.getDate() +
            1
        );
      }


      const created =
        saveDoctorSlots(
          generated
        );


      refreshSlots(
        doctor.id
      );


      setMessage(
        `${created} recurring slot${created === 1 ? "" : "s"} created.`
      );
    };


  const removeSlot =
    (
      slotId:
        string
    ) => {

      setError("");

      setMessage("");

      if (
        !doctor
      ) {
        return;
      }

      const removed =
        deleteDoctorSlot(
          slotId
        );

      if (
        !removed
      ) {
        setError(
          "Booked slots cannot be deleted."
        );

        return;
      }

      refreshSlots(
        doctor.id
      );

      setMessage(
        "Slot removed."
      );
    };


  if (
    !doctor ||
    !currentUser
  ) {
    return (
      <main className="grid min-h-screen place-items-center">
        Loading profile...
      </main>
    );
  }

  const availableSlots = slots.filter((slot) => slot.status === "available").length;
  const bookedSlots = slots.filter((slot) => slot.status === "booked").length;
  const profileValues = [name, phone, specialty, registrationNumber, experience, location, fee, bio, education, languages];
  const profileCompletion = Math.round((profileValues.filter((value) => value.trim()).length / profileValues.length) * 100);


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-7 sm:py-7 lg:px-10">
      <div className="mx-auto max-w-[92rem]">
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_-35px_rgba(15,23,42,0.35)]">
          <div className="relative overflow-hidden bg-[linear-gradient(120deg,#0f172a_0%,#172554_55%,#0c4a6e_100%)] px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="absolute -right-20 -top-32 size-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 size-44 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link href="/doctor-dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-blue-200 transition hover:text-white">
                  <ArrowLeft size={15} />
                  Back to dashboard
                </Link>
                <div className="mt-5 flex items-center gap-4">
                  <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-xl font-bold shadow-inner backdrop-blur">
                    {initials(name) || "DR"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
                      <BadgeCheck size={20} className="text-cyan-300" aria-label="Verified profile" />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-blue-200">{specialty}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin size={13} />
                      {location || "Clinic location not added"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-24 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center backdrop-blur sm:min-w-28">
                  <p className="text-xl font-bold">{profileCompletion}%</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">Profile</p>
                </div>
                <div className="min-w-24 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center backdrop-blur sm:min-w-28">
                  <p className="text-xl font-bold">{availableSlots}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">Open slots</p>
                </div>
                <div className="min-w-24 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center backdrop-blur sm:min-w-28">
                  <p className="text-xl font-bold">{bookedSlots}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-200">Booked</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white px-5 py-3 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ShieldCheck size={15} className="text-emerald-600" />
              Your public profile and booking availability stay synchronized.
            </div>
            <button type="button" onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
              <Save size={15} />
              Save profile
            </button>
          </div>
        </section>

        {message && (
          <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Profile readiness</p>
                <span className="text-sm font-bold text-blue-700">{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all" style={{ width: profileCompletion + "%" }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Complete your professional information to help patients choose confidently.</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Public profile preview</p>
              <div className="mt-4 grid size-14 place-items-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">{initials(name) || "DR"}</div>
              <h2 className="mt-4 text-lg font-bold">{name}</h2>
              <p className="mt-1 text-sm font-semibold text-blue-700">{specialty}</p>
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <p className="flex items-start gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-blue-600" /> {education || "Education not added"}</p>
                <p className="flex items-start gap-2"><LanguagesIcon size={15} className="mt-0.5 shrink-0 text-blue-600" /> {languages || "Languages not added"}</p>
                <p className="flex items-start gap-2"><CircleDollarSign size={15} className="mt-0.5 shrink-0 text-blue-600" /> ₹{fee || "—"} consultation</p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              <Link href="/doctor-dashboard/calendar" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                <CalendarDays size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-bold">Open calendar</p>
                <p className="mt-1 text-[11px] text-slate-500">Review daily schedule</p>
              </Link>
              <Link href="/doctor-dashboard/appointments" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                <Stethoscope size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-bold">Appointments</p>
                <p className="mt-1 text-[11px] text-slate-500">Manage patient requests</p>
              </Link>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)]">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserRound size={19} /></span>
                  <div>
                    <h2 className="text-lg font-bold">Professional identity</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Information used on your public doctor profile.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
                <label>
                  <span className={labelClass}>Doctor name *</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Account email</span>
                  <input value={currentUser.email} disabled className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Phone number</span>
                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass + " pl-10"} />
                  </div>
                </label>
                <label>
                  <span className={labelClass}>Specialty *</span>
                  <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className={inputClass}>
                    {specialties.filter((item) => item !== "All").map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Registration number</span>
                  <input value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Years of experience</span>
                  <input type="number" min="0" value={experience} onChange={(event) => setExperience(event.target.value)} className={inputClass} />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)]">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><BookOpen size={19} /></span>
                  <div>
                    <h2 className="text-lg font-bold">Practice details</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Clinic, pricing and clinical background.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                <label>
                  <span className={labelClass}>Clinic location *</span>
                  <div className="relative">
                    <MapPin size={15} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                    <input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass + " pl-10"} />
                  </div>
                </label>
                <label>
                  <span className={labelClass}>Consultation fee *</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                    <input type="number" min="1" value={fee} onChange={(event) => setFee(event.target.value)} className={inputClass + " pl-9"} />
                  </div>
                </label>
                <label>
                  <span className={labelClass}>Education</span>
                  <div className="relative">
                    <GraduationCap size={15} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                    <input value={education} onChange={(event) => setEducation(event.target.value)} placeholder="MBBS, MD - Medicine" className={inputClass + " pl-10"} />
                  </div>
                  <span className="mt-1.5 block text-[10px] text-slate-400">Separate qualifications with commas.</span>
                </label>
                <label>
                  <span className={labelClass}>Languages</span>
                  <div className="relative">
                    <LanguagesIcon size={15} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                    <input value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="English, Bengali, Hindi" className={inputClass + " pl-10"} />
                  </div>
                  <span className="mt-1.5 block text-[10px] text-slate-400">Separate languages with commas.</span>
                </label>
                <label className="sm:col-span-2">
                  <span className={labelClass}>Profile image URL</span>
                  <div className="relative">
                    <ImageIcon size={15} className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" />
                    <input value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/doctor-photo.jpg" className={inputClass + " pl-10"} />
                  </div>
                </label>
                <label className="sm:col-span-2">
                  <span className={labelClass}>Professional bio</span>
                  <textarea rows={5} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Describe your clinical focus, approach and areas of expertise." className={inputClass + " resize-none leading-6"} />
                  <span className="mt-1.5 block text-right text-[10px] text-slate-400">{bio.length} characters</span>
                </label>
              </div>

              <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                <button type="button" onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700">
                  <Save size={16} />
                  Save professional profile
                </button>
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_-28px_rgba(15,23,42,0.4)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CalendarDays size={20} /></span>
              <div>
                <h2 className="text-lg font-bold">Booking availability</h2>
                <p className="mt-0.5 text-xs text-slate-500">Publish one-time or recurring appointment slots.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">{availableSlots} open</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">{bookedSlots} booked</span>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/45 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white"><Plus size={17} /></span>
                <div>
                  <h3 className="font-bold">One-time slot</h3>
                  <p className="mt-1 text-xs text-slate-500">Add a specific date and time to your calendar.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Date</span>
                  <input type="date" min={today()} value={singleDate} onChange={(event) => setSingleDate(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Time</span>
                  <input type="time" value={singleTime} onChange={(event) => setSingleTime(event.target.value)} className={inputClass} />
                </label>
              </div>
              <button type="button" onClick={createSingleSlot} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
                <Plus size={16} />
                Add one-time slot
              </button>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white"><Globe2 size={17} /></span>
                <div>
                  <h3 className="font-bold">Recurring schedule</h3>
                  <p className="mt-1 text-xs text-slate-500">Repeat one appointment time on selected weekdays.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <label>
                  <span className={labelClass}>From</span>
                  <input type="date" min={today()} value={recurringStart} onChange={(event) => setRecurringStart(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Until</span>
                  <input type="date" min={recurringStart} value={recurringEnd} onChange={(event) => setRecurringEnd(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className={labelClass}>Time</span>
                  <input type="time" value={recurringTime} onChange={(event) => setRecurringTime(event.target.value)} className={inputClass} />
                </label>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Repeat on</p>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    aria-pressed={recurringDays.includes(day.value)}
                    className={"rounded-lg border px-1 py-2 text-[11px] font-bold transition " + (recurringDays.includes(day.value) ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300")}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={createRecurringSlots} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700">
                <CalendarDays size={16} />
                Create recurring slots
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-bold">Published schedule</h3>
                <p className="mt-1 text-xs text-slate-500">Open slots can be removed. Booked slots remain locked to protect appointments.</p>
              </div>
              <Link href="/doctor-dashboard/calendar" className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900">
                <CalendarDays size={15} />
                View full calendar
              </Link>
            </div>

            {slots.length > 0 ? (
              <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                {slots.map((slot) => (
                  <article key={slot.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-blue-200 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{displayDate(slot.date)}</p>
                        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><Clock3 size={14} className="text-blue-600" /> {slot.time}</p>
                      </div>
                      <span className={"rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide " + (slot.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
                        {slot.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-[10px] font-semibold text-slate-400">{slot.recurringGroupId ? "Recurring slot" : "One-time slot"}</span>
                      {slot.status === "available" ? (
                        <button type="button" onClick={() => removeSlot(slot.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50">
                          <Trash2 size={13} />
                          Remove
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400"><ShieldCheck size={12} /> Locked</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <CalendarDays size={28} className="mx-auto text-slate-300" />
                <p className="mt-3 font-bold">No availability published</p>
                <p className="mt-1 text-sm text-slate-500">Create a one-time or recurring slot above.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
