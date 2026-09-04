"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import Navbar from "@/components/layout/Navbar";

import BookingSummary from "@/components/booking/BookingSummary";

import {
  doctors,
} from "@/lib/mock-data/doctors";

import {
  ensureDoctorSlotsSeeded,
  getAvailableSlotsForDoctor,
  getCurrentUser,
  getRegisteredDoctors,
  mergeDoctorProfiles,
  saveBookingWithSlot,
  saveLatestBookingId,
} from "@/lib/client-storage";

import {
  deleteMedicalFile,
  saveMedicalFile,
} from "@/lib/file-storage";

import type {
  Booking,
  BookingAttachment,
} from "@/types/booking";

import type {
  AppointmentType,
} from "@/types/appointment";

import type {
  Doctor,
} from "@/types/doctor";

import type {
  DoctorSlot,
} from "@/types/availability";

import { CalendarDays, Check, Clock3, FileText, MapPin, Paperclip, RefreshCcw, Stethoscope, UserRound, Video } from "lucide-react";


const MAX_FILE_SIZE =
  5 * 1024 * 1024;


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];


const APPOINTMENT_TYPES:
  AppointmentType[] = [
    "In-person",
    "Video consultation",
    "Follow-up",
  ];


/* =========================================
   TIME CONVERSION
========================================= */

function to24Hour(
  time: string
) {
  const [
    clock,
    period,
  ] =
    time.split(" ");


  const [initialHours, minutes] =
    clock
      .split(":")
      .map(Number);

  let hours = initialHours;


  if (
    period === "PM" &&
    hours !== 12
  ) {
    hours += 12;
  }


  if (
    period === "AM" &&
    hours === 12
  ) {
    hours = 0;
  }


  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:00`;
}


/* =========================================
   FILE SIZE FORMATTER
========================================= */

function formatFileSize(
  bytes: number
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      1
    )} KB`;
  }


  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    1
  )} MB`;
}


/* =========================================
   FILE ID
========================================= */

function createFileId() {
  if (
    typeof crypto !==
      "undefined" &&
    "randomUUID" in crypto
  ) {
    return `medical-${crypto.randomUUID()}`;
  }


  return `medical-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


/* =========================================
   PAGE
========================================= */

export default function BookingPage() {
  const params =
    useParams<{
      doctorId: string;
    }>();


  const router =
    useRouter();


  /* =========================================
     DOCTOR
  ========================================= */

  const [
    doctor,
    setDoctor,
  ] =
    useState<
      Doctor | null
    >(null);


  const [
    availableSlots,
    setAvailableSlots,
  ] =
    useState<
      DoctorSlot[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false
    );


  /* =========================================
     APPOINTMENT DETAILS
  ========================================= */

  const [
    date,
    setDate,
  ] =
    useState("");


  const [
    time,
    setTime,
  ] =
    useState("");


  const [
    selectedSlotId,
    setSelectedSlotId,
  ] =
    useState("");


  const [
    appointmentType,
    setAppointmentType,
  ] =
    useState<AppointmentType>(
      "In-person"
    );


  /* =========================================
     PATIENT
  ========================================= */

  const [
    patientName,
    setPatientName,
  ] =
    useState("");


  const [
    patientEmail,
    setPatientEmail,
  ] =
    useState("");


  const [
    patientPhone,
    setPatientPhone,
  ] =
    useState("");


  const [
    patientAge,
    setPatientAge,
  ] =
    useState("");


  const [
    reason,
    setReason,
  ] =
    useState("");


  /* =========================================
     MEDICAL FILE
  ========================================= */

  /*
    attachment contains
    metadata only.

    selectedFile contains
    actual browser File.
  */

  const [
    attachment,
    setAttachment,
  ] =
    useState<
      BookingAttachment | undefined
    >();


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<
      File | null
    >(null);


  const [
    fileLoading,
    setFileLoading,
  ] =
    useState(
      false
    );


  /* =========================================
     ERROR
  ========================================= */

  const [
    error,
    setError,
  ] =
    useState("");


  /* =========================================
     LOAD DOCTOR + AVAILABLE SLOTS
  ========================================= */

  useEffect(() => {
    const profiles =
      mergeDoctorProfiles(
        doctors,
        getRegisteredDoctors()
      );


    const found =
      profiles.find(
        (
          item
        ) =>
          item.id ===
          params.doctorId
      );


    if (
      !found
    ) {
      setLoading(
        false
      );

      return;
    }


    /*
      Convert the old static
      doctor.slots into dated
      DoctorSlot objects once.
    */

    ensureDoctorSlotsSeeded(
      found.id,
      found.slots
    );


    const slots =
      getAvailableSlotsForDoctor(
        found.id
      );


    setDoctor(
      found
    );


    setAvailableSlots(
      slots
    );


    if (
      slots.length > 0
    ) {
      setDate(
        slots[0].date
      );
    }


    /*
      Prefill patient name/email
      when a patient is logged in.
    */

    const currentUser =
      getCurrentUser();


    if (
      currentUser?.role ===
      "patient"
    ) {
      setPatientName(
        currentUser.name
      );

      setPatientEmail(
        currentUser.email
      );
    }


    setLoading(
      false
    );

  }, [
    params.doctorId,
  ]);


  /* =========================================
     AVAILABLE DATES
  ========================================= */

  const availableDates =
    useMemo(
      () =>
        Array.from(
          new Set(
            availableSlots.map(
              (
                slot
              ) =>
                slot.date
            )
          )
        ).sort(),

      [
        availableSlots,
      ]
    );


  /* =========================================
     AVAILABLE TIMES FOR SELECTED DATE
  ========================================= */

  const slotsForDate =
    useMemo(
      () =>
        availableSlots.filter(
          (
            slot
          ) =>
            slot.date ===
            date
        ),

      [
        availableSlots,
        date,
      ]
    );


  /* =========================================
     SELECT DATE
  ========================================= */

  const chooseDate =
    (
      value: string
    ) => {
      setDate(
        value
      );

      /*
        Reset selected time when
        patient changes date.
      */

      setTime("");

      setSelectedSlotId("");
    };


  /* =========================================
     SELECT SLOT
  ========================================= */

  const chooseSlot =
    (
      slot:
        DoctorSlot
    ) => {
      setTime(
        slot.time
      );

      setSelectedSlotId(
        slot.id
      );
    };


  /* =========================================
     FILE SELECTION
  ========================================= */

  const handleFileUpload =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        event.target
          .files?.[0];


      setError("");


      if (
        !file
      ) {
        return;
      }


      /* FILE TYPE */

      if (
        !ALLOWED_FILE_TYPES.includes(
          file.type
        )
      ) {
        setError(
          "Only PDF, JPG and PNG files are allowed."
        );

        event.target.value =
          "";

        return;
      }


      /* FILE SIZE */

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          "Medical document must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }


      setFileLoading(
        true
      );


      const fileId =
        createFileId();


      /*
        Store only metadata
        inside the Booking.

        The actual file will
        go into IndexedDB.
      */

      setAttachment({
        id:
          fileId,

        name:
          file.name,

        type:
          file.type,

        size:
          file.size,
      });


      setSelectedFile(
        file
      );


      setFileLoading(
        false
      );
    };


  /* =========================================
     REMOVE FILE
  ========================================= */

  const removeAttachment =
    () => {
      setAttachment(
        undefined
      );

      setSelectedFile(
        null
      );
    };


  /* =========================================
     SUBMIT
  ========================================= */

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        submitting
      ) {
        return;
      }


      setError("");


      /* SLOT VALIDATION */

      if (
        !doctor ||
        !selectedSlotId ||
        !date ||
        !time
      ) {
        setError(
          "Please select an available appointment slot."
        );

        return;
      }


      /* PATIENT DETAILS */

      if (
        !patientName.trim() ||
        !patientEmail.trim() ||
        !patientPhone.trim() ||
        !patientAge.trim() ||
        !reason.trim()
      ) {
        setError(
          "Please complete all patient details."
        );

        return;
      }


      /* EMAIL */

      if (
        !/^\S+@\S+\.\S+$/.test(
          patientEmail.trim()
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }


      /* PHONE */

      const phone =
        patientPhone.replace(
          /\D/g,
          ""
        );


      if (
        !/^\d{10}$/.test(
          phone
        )
      ) {
        setError(
          "Please enter a valid 10-digit phone number."
        );

        return;
      }


      /* AGE */

      const age =
        Number(
          patientAge
        );


      if (
        !Number.isFinite(
          age
        ) ||
        age < 1 ||
        age > 120
      ) {
        setError(
          "Please enter a valid patient age."
        );

        return;
      }


      setSubmitting(
        true
      );


      let fileStored =
        false;


      try {

        /* =================================
           SAVE MEDICAL FILE
        ================================= */

        if (
          attachment &&
          selectedFile
        ) {
          fileStored =
            await saveMedicalFile(
              attachment.id,
              selectedFile
            );


          if (
            !fileStored
          ) {
            setError(
              "Unable to save your medical document. Please try again."
            );

            return;
          }
        }


        /* =================================
           CURRENT PATIENT
        ================================= */

        const currentUser =
          getCurrentUser();


        /* =================================
           CREATE BOOKING
        ================================= */

        const booking:
          Booking = {

          id:
            `apt-${Date.now()}`,


          /* DOCTOR */

          doctorId:
            doctor.id,

          doctorName:
            doctor.name,

          specialty:
            doctor.specialty,

          doctorLocation:
            doctor.location,


          /* SLOT */

          slotId:
            selectedSlotId,


          /* PATIENT ACCOUNT */

          patientId:
            currentUser?.role ===
            "patient"
              ? currentUser.id
              : undefined,


          /* PATIENT DETAILS */

          patientName:
            patientName.trim(),

          patientEmail:
            patientEmail
              .trim()
              .toLowerCase(),

          patientPhone:
            phone,

          patientAge:
            age,


          /* CONSULTATION */

          reason:
            reason.trim(),

          appointmentType,


          /* DATE / TIME */

          date,

          time,

          startsAt:
            `${date}T${to24Hour(
              time
            )}`,


          /* PAYMENT */

          fee:
            doctor.fee,


          /*
            VERY IMPORTANT:

            The appointment starts
            as pending.

            Doctor must confirm it
            from Doctor Portal.
          */

          status:
            "pending",


          createdAt:
            new Date()
              .toISOString(),


          /* MEDICAL FILE */

          attachment,
        };


        /* =================================
           SAVE BOOKING + LOCK SLOT
        ================================= */

        const success =
          saveBookingWithSlot(
            booking,
            selectedSlotId
          );


        if (
          !success
        ) {

          /*
            Booking failed.

            Delete file from
            IndexedDB so we don't
            leave an orphan file.
          */

          if (
            fileStored &&
            attachment
          ) {
            await deleteMedicalFile(
              attachment.id
            );
          }


          setError(
            "This slot is no longer available. Please choose another slot."
          );


          /*
            Refresh available slots.
          */

          setAvailableSlots(
            getAvailableSlotsForDoctor(
              doctor.id
            )
          );


          setSelectedSlotId(
            ""
          );


          setTime(
            ""
          );


          return;
        }


        /* =================================
           SAVE LATEST BOOKING
        ================================= */

        saveLatestBookingId(
          booking.id
        );


        /* =================================
           REDIRECT
        ================================= */

        router.push(
          "/booking-confirmation"
        );

      } catch (
        submitError
      ) {

        console.error(
          "Booking error:",
          submitError
        );


        /*
          Clean up stored medical
          file if booking fails.
        */

        if (
          fileStored &&
          attachment
        ) {
          await deleteMedicalFile(
            attachment.id
          );
        }


        setError(
          "Unable to complete your booking. Please try again."
        );

      } finally {

        setSubmitting(
          false
        );
      }
    };


  /* =========================================
     LOADING
  ========================================= */

  if (
    loading
  ) {
    return (
      <>
        <Navbar />

        <main className="grid min-h-[60vh] place-items-center">

          <div className="text-center">

            <div className="mx-auto size-9 animate-spin rounded-full border-4 border-[#dbeafe] border-t-[var(--brand)]" />

            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading availability...
            </p>

          </div>

        </main>
      </>
    );
  }


  /* =========================================
     DOCTOR NOT FOUND
  ========================================= */

  if (
    !doctor
  ) {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-20 text-center">

          <h1 className="text-3xl font-semibold">
            Doctor not found
          </h1>

          <p className="mt-3 text-sm text-[var(--muted)]">
            The requested doctor profile could not be loaded.
          </p>

          <Link
            href="/doctors"
            className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to doctors
          </Link>

        </main>
      </>
    );
  }


  /* =========================================
     PAGE
  ========================================= */

  return (
    <>
      <Navbar />


      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          href={`/doctors/${doctor.id}`}
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          ← Back to doctor profile
        </Link>

        <ol className="mt-7 hidden grid-cols-5 border-y border-[var(--line)] bg-[var(--card)] sm:grid" aria-label="Booking steps">
          {["Date", "Time", "Appointment type", "Patient information", "Confirmation"].map((label, index) => (
            <li key={label} className="border-r border-[var(--line)] px-3 py-4 last:border-r-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">0{index + 1}</span>
              <span className="mt-1 block text-xs font-semibold">{label}</span>
            </li>
          ))}
        </ol>


        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">

          <form
            onSubmit={
              submit
            }
            className="space-y-6"
          >

            {/* =================================
                HEADER
            ================================= */}

            <section className="rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Appointment Booking
              </p>


              <h1 className="font-editorial mt-2 text-4xl tracking-tight">
                Book your appointment
              </h1>


              <p className="mt-2 text-sm text-[var(--muted)]">

                Request an appointment with{" "}

                <span className="font-semibold text-[var(--foreground)]">
                  {doctor.name}
                </span>

                . The doctor will review and confirm your booking.

              </p>

            </section>


            {/* =================================
                DATE
            ================================= */}

            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 1
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Select available date
                  </h2>

                </div>


                <CalendarDays size={21} className="text-[var(--brand)]" />

              </div>


              {availableDates.length >
              0 ? (

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {availableDates.map(
                    (
                      item
                    ) => {

                      const currentDate =
                        new Date(
                          `${item}T00:00:00`
                        );


                      return (
                        <button
                          key={
                            item
                          }

                          type="button"

                          onClick={() =>
                            chooseDate(
                              item
                            )
                          }

                          className={`rounded-xl border p-3 text-left transition ${
                            date ===
                            item
                              ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                              : "border-[var(--line)] bg-white hover:border-[var(--brand)]"
                          }`}
                        >

                          <span className="block text-xs font-medium">

                            {new Intl.DateTimeFormat(
                              "en-IN",
                              {
                                weekday:
                                  "short",
                              }
                            ).format(
                              currentDate
                            )}

                          </span>


                          <span className="mt-1 block text-sm font-semibold">

                            {new Intl.DateTimeFormat(
                              "en-IN",
                              {
                                day:
                                  "numeric",

                                month:
                                  "short",
                              }
                            ).format(
                              currentDate
                            )}

                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="mt-5 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4 text-sm text-[#D96B32]">
                  This doctor currently has no available appointment slots.
                </div>

              )}

            </section>


            {/* =================================
                TIME
            ================================= */}

            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 2
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Select available time
                  </h2>

                </div>


                <span className="text-xl">
                  <Clock3 size={18} className="mx-auto text-[var(--brand)]" />
                </span>

              </div>


              {slotsForDate.length >
              0 ? (

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {slotsForDate.map(
                    (
                      slot
                    ) => (

                      <button
                        key={
                          slot.id
                        }

                        type="button"

                        onClick={() =>
                          chooseSlot(
                            slot
                          )
                        }

                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedSlotId ===
                          slot.id
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--line)] bg-white hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        }`}
                      >
                        {slot.time}
                      </button>

                    )
                  )}

                </div>

              ) : (

                <p className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-sm text-[var(--muted)]">
                  No available time slots for this date.
                </p>

              )}

            </section>


            {/* =================================
                APPOINTMENT TYPE
            ================================= */}

            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 3
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Appointment type
                  </h2>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Choose how you would like to consult the doctor.
                  </p>

                </div>

                <Stethoscope size={21} className="text-[var(--brand)]" />

              </div>


              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                {APPOINTMENT_TYPES.map(
                  (
                    item
                  ) => {

                    const selected =
                      appointmentType ===
                      item;


                    return (
                      <button
                        key={
                          item
                        }

                        type="button"

                        onClick={() =>
                          setAppointmentType(
                            item
                          )
                        }

                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-[var(--brand)] bg-[#F8FAFC] text-[var(--brand)]"
                            : "border-[var(--line)] bg-white hover:border-[var(--brand)]"
                        }`}
                      >

                        <span className="text-xl">

                          {item === "In-person" ? <MapPin size={20} /> : item === "Video consultation" ? <Video size={20} /> : <RefreshCcw size={20} />}

                        </span>


                        <p className="mt-3 text-sm font-semibold">
                          {item}
                        </p>


                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">

                          {item ===
                          "In-person"
                            ? "Visit the doctor's clinic for your consultation."
                            : item ===
                              "Video consultation"
                            ? "Consult remotely through a video appointment."
                            : "Continue treatment or review a previous consultation."}

                        </p>

                      </button>
                    );
                  }
                )}

              </div>

            </section>


            {/* =================================
                PATIENT DETAILS
            ================================= */}

            <section className="rounded-xl border border-[var(--line)] bg-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    Step 4
                  </p>

                  <h2 className="mt-1 font-semibold">
                    Patient details
                  </h2>

                </div>


                <UserRound size={21} className="text-[var(--brand)]" />

              </div>


              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                {/* NAME */}

                <label>

                  <span className="text-sm font-medium">
                    Full name
                  </span>

                  <input
                    value={
                      patientName
                    }

                    onChange={(
                      event
                    ) =>
                      setPatientName(
                        event.target.value
                      )
                    }

                    placeholder="Patient name"

                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />

                </label>


                {/* AGE */}

                <label>

                  <span className="text-sm font-medium">
                    Age
                  </span>

                  <input
                    type="number"

                    min="1"

                    max="120"

                    value={
                      patientAge
                    }

                    onChange={(
                      event
                    ) =>
                      setPatientAge(
                        event.target.value
                      )
                    }

                    placeholder="34"

                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />

                </label>


                {/* EMAIL */}

                <label>

                  <span className="text-sm font-medium">
                    Email
                  </span>

                  <input
                    type="email"

                    value={
                      patientEmail
                    }

                    onChange={(
                      event
                    ) =>
                      setPatientEmail(
                        event.target.value
                      )
                    }

                    placeholder="patient@example.com"

                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />

                </label>


                {/* PHONE */}

                <label>

                  <span className="text-sm font-medium">
                    Phone
                  </span>

                  <input
                    inputMode="tel"

                    value={
                      patientPhone
                    }

                    onChange={(
                      event
                    ) =>
                      setPatientPhone(
                        event.target.value
                      )
                    }

                    placeholder="9876543210"

                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />

                </label>


                {/* REASON */}

                <label className="sm:col-span-2">

                  <span className="text-sm font-medium">
                    Reason for consultation
                  </span>

                  <textarea
                    rows={
                      4
                    }

                    value={
                      reason
                    }

                    onChange={(
                      event
                    ) =>
                      setReason(
                        event.target.value
                      )
                    }

                    placeholder="Briefly describe the reason for your consultation"

                    className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-[#FFFFFF] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />

                </label>


                {/* =================================
                    MEDICAL DOCUMENT
                ================================= */}

                <div className="sm:col-span-2">

                  <p className="text-sm font-medium">

                    Medical document{" "}

                    <span className="font-normal text-[var(--muted)]">
                      (optional)
                    </span>

                  </p>


                  {!attachment ? (

                    <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--line)] bg-[#FFFFFF] px-6 py-8 text-center transition hover:border-[var(--brand)] hover:bg-[#F8FAFC]/30">

                      <Paperclip size={26} className="text-[var(--brand)]" />


                      <span className="mt-3 text-sm font-semibold">
                        Upload medical report
                      </span>


                      <span className="mt-1 text-xs text-[var(--muted)]">
                        PDF, JPG or PNG · Maximum 5 MB
                      </span>


                      <input
                        type="file"

                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"

                        onChange={
                          handleFileUpload
                        }

                        className="hidden"
                      />

                    </label>

                  ) : (

                    <div className="mt-2 rounded-xl border border-[#dbeafe] bg-[#F8FAFC]/50 p-4">

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">

                            <FileText size={15} className="mr-1 inline text-[var(--brand)]" />{" "}

                            {
                              attachment.name
                            }

                          </p>


                          <p className="mt-1 text-xs text-[var(--muted)]">

                            {formatFileSize(
                              attachment.size
                            )}

                            {" · "}

                            {
                              attachment.type
                            }

                          </p>

                        </div>


                        <button
                          type="button"

                          onClick={
                            removeAttachment
                          }

                          className="shrink-0 text-sm font-semibold text-[#C9362D] hover:underline"
                        >
                          Remove
                        </button>

                      </div>


                      <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-[#C9362D]">
                        <Check size={14} className="mr-1 inline" /> File ready to upload with this appointment request
                      </div>

                    </div>

                  )}


                  {fileLoading && (

                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Processing file...
                    </p>

                  )}

                </div>

              </div>

            </section>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

              <div
                role="alert"
                className="rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm text-[#C9362D]"
              >
                {error}
              </div>

            )}


            {/* =================================
                SUBMIT BUTTON
            ================================= */}

            <button
              type="submit"

              disabled={
                fileLoading ||
                submitting ||
                availableSlots.length ===
                  0
              }

              className="w-full rounded-xl bg-[var(--brand)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {submitting
                ? "Sending appointment request..."
                : "Request Appointment"}

            </button>


            <p className="text-center text-xs text-[var(--muted)]">
              Your booking will remain pending until the doctor confirms it.
            </p>

          </form>


          {/* =================================
              SUMMARY
          ================================= */}

          <BookingSummary
            doctor={
              doctor
            }

            date={
              date
            }

            time={
              time
            }
          />

        </div>

      </main>
    </>
  );
}
