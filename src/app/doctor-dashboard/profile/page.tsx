"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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


  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">

      <div className="mx-auto max-w-6xl">

        <Link
          href="/doctor-dashboard"
          className="text-sm font-semibold text-[var(--brand)]"
        >
          ← Back to dashboard
        </Link>


        <div className="mt-6">

          <p className="text-sm font-semibold text-[var(--brand)]">
            Doctor Profile
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Profile & Availability
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Update your professional information
            and manage patient booking slots.
          </p>

        </div>


        {message && (
          <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4 text-sm text-[#C9362D]">
            {message}
          </div>
        )}


        {error && (
          <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] p-4 text-sm text-[#C9362D]">
            {error}
          </div>
        )}


        <section className="mt-8 rounded-xl border border-[var(--line)] bg-white p-6">

          <h2 className="text-lg font-semibold">
            Profile Details
          </h2>


          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <label>
              <span className="text-sm font-medium">
                Name
              </span>

              <input
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Account Email
              </span>

              <input
                value={
                  currentUser.email
                }
                disabled
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#F8FAFC] px-4 py-3 text-sm text-[var(--muted)]"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Phone
              </span>

              <input
                value={
                  phone
                }
                onChange={(
                  event
                ) =>
                  setPhone(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Specialty
              </span>

              <select
                value={
                  specialty
                }
                onChange={(
                  event
                ) =>
                  setSpecialty(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              >
                {specialties
                  .filter(
                    (item) =>
                      item !==
                      "All"
                  )
                  .map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
              </select>
            </label>


            <label>
              <span className="text-sm font-medium">
                Registration Number
              </span>

              <input
                value={
                  registrationNumber
                }
                onChange={(
                  event
                ) =>
                  setRegistrationNumber(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Experience
              </span>

              <input
                type="number"
                min="0"
                value={
                  experience
                }
                onChange={(
                  event
                ) =>
                  setExperience(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Clinic Location
              </span>

              <input
                value={
                  location
                }
                onChange={(
                  event
                ) =>
                  setLocation(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label>
              <span className="text-sm font-medium">
                Consultation Fee
              </span>

              <input
                type="number"
                value={
                  fee
                }
                onChange={(
                  event
                ) =>
                  setFee(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Profile Image URL
              </span>

              <input
                value={
                  image
                }
                onChange={(
                  event
                ) =>
                  setImage(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Education
              </span>

              <input
                value={
                  education
                }
                onChange={(
                  event
                ) =>
                  setEducation(
                    event.target.value
                  )
                }
                placeholder="MBBS, MD - Medicine"
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Languages
              </span>

              <input
                value={
                  languages
                }
                onChange={(
                  event
                ) =>
                  setLanguages(
                    event.target.value
                  )
                }
                placeholder="English, Bengali, Hindi"
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>


            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Bio
              </span>

              <textarea
                rows={
                  4
                }
                value={
                  bio
                }
                onChange={(
                  event
                ) =>
                  setBio(
                    event.target.value
                  )
                }
                className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
              />
            </label>

          </div>


          <button
            type="button"
            onClick={
              saveProfile
            }
            className="mt-6 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            Update Profile
          </button>

        </section>


        <section className="mt-8 rounded-xl border border-[var(--line)] bg-white p-6">

          <h2 className="text-lg font-semibold">
            Appointment Availability
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Create single or recurring appointment
            slots for patients.
          </p>


          <div className="mt-6 rounded-xl bg-[#F8FAFC] p-5">

            <h3 className="font-semibold">
              Add Single Slot
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">

              <input
                type="date"
                min={
                  today()
                }
                value={
                  singleDate
                }
                onChange={(
                  event
                ) =>
                  setSingleDate(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />

              <input
                type="time"
                value={
                  singleTime
                }
                onChange={(
                  event
                ) =>
                  setSingleTime(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />

              <button
                type="button"
                onClick={
                  createSingleSlot
                }
                className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
              >
                Add Slot
              </button>

            </div>

          </div>


          <div className="mt-5 rounded-xl bg-[#F8FAFC] p-5">

            <h3 className="font-semibold">
              Recurring Availability
            </h3>


            <div className="mt-4 grid gap-4 sm:grid-cols-3">

              <label>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  From
                </span>

                <input
                  type="date"
                  min={
                    today()
                  }
                  value={
                    recurringStart
                  }
                  onChange={(
                    event
                  ) =>
                    setRecurringStart(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>


              <label>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Until
                </span>

                <input
                  type="date"
                  min={
                    recurringStart
                  }
                  value={
                    recurringEnd
                  }
                  onChange={(
                    event
                  ) =>
                    setRecurringEnd(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>


              <label>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Time
                </span>

                <input
                  type="time"
                  value={
                    recurringTime
                  }
                  onChange={(
                    event
                  ) =>
                    setRecurringTime(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </label>

            </div>


            <p className="mt-5 text-xs font-semibold text-[var(--muted)]">
              Repeat on
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              {WEEKDAYS.map(
                (
                  day
                ) => (

                  <button
                    key={
                      day.value
                    }
                    type="button"
                    onClick={() =>
                      toggleDay(
                        day.value
                      )
                    }
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      recurringDays.includes(
                        day.value
                      )
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {
                      day.label
                    }
                  </button>

                )
              )}

            </div>


            <button
              type="button"
              onClick={
                createRecurringSlots
              }
              className="mt-5 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
            >
              Create Recurring Slots
            </button>

          </div>


          <div className="mt-8">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold">
                Existing Slots
              </h3>

              <span className="text-sm text-[var(--muted)]">
                {
                  slots.length
                } total
              </span>

            </div>


            {slots.length >
            0 ? (

              <div className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">

                {slots.map(
                  (
                    slot
                  ) => (

                    <div
                      key={
                        slot.id
                      }
                      className="grid gap-3 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
                    >

                      <p className="text-sm font-semibold">
                        {
                          displayDate(
                            slot.date
                          )
                        }
                      </p>

                      <p className="text-sm">
                        {
                          slot.time
                        }
                      </p>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          slot.status ===
                          "available"
                            ? "bg-[#F8FAFC] text-[#C9362D]"
                            : "bg-[#F8FAFC] text-[#D96B32]"
                        }`}
                      >
                        {
                          slot.status
                        }
                      </span>


                      {slot.status ===
                      "available" ? (

                        <button
                          type="button"
                          onClick={() =>
                            removeSlot(
                              slot.id
                            )
                          }
                          className="text-sm font-semibold text-[#C9362D]"
                        >
                          Delete
                        </button>

                      ) : (

                        <span className="text-xs text-[var(--muted)]">
                          Locked
                        </span>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] p-10 text-center">

                <p className="font-semibold">
                  No availability created yet
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Add your first appointment slot above.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}
