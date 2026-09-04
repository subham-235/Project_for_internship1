"use client";


import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import type {
  Booking,
} from "@/types/booking";

import type {
  Doctor,
} from "@/types/doctor";

import type {
  DoctorSlot,
} from "@/types/availability";

import {
  confirmBooking,
  getBookingsForDoctor,
  getCurrentUser,
  getDoctorSlots,
  getRegisteredDoctors,
  mergeDoctorProfiles,
  rescheduleBooking,
  saveDoctorSlot,
  type StoredUser,
} from "@/lib/client-storage";

import {
  doctors,
} from "@/lib/mock-data/doctors";

import StatusBadge from "@/components/appointments/StatusBadge";
import PatientHealthSnapshot from "@/components/doctor/PatientHealthSnapshot";
import PatientIntakeSummary from "@/components/doctor/PatientIntakeSummary";


const calendarStatusStyles = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700",
  confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled:
    "border-rose-200 bg-rose-50 text-rose-700",
  missed:
    "border-rose-200 bg-rose-50 text-rose-700",
} as const;


const calendarStatusDots = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
  missed: "bg-rose-500",
} as const;


type CalendarView =
  | "day"
  | "week"
  | "month";


function normalize(
  value: string
) {
  return value
    .trim()
    .toLowerCase();
}


function findDoctorProfile(
  user: StoredUser
):
  Doctor | undefined {

  const profiles =
    mergeDoctorProfiles(
      doctors,
      getRegisteredDoctors()
    );

  return (
    profiles.find(
      (doctor) =>
        doctor.id ===
        user.id
    ) ??
    profiles.find(
      (doctor) =>
        normalize(
          doctor.name
        ) ===
        normalize(
          user.name
        )
    )
  );
}


function dateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function startOfWeek(
  value: Date
) {
  const result =
    new Date(value);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}


function addDays(
  value: Date,
  amount: number
) {
  const date =
    new Date(value);

  date.setDate(
    date.getDate() +
      amount
  );

  return date;
}


function formatHeader(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    }
  ).format(
    date
  );
}


function formatShortDate(
  date: Date
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
    }
  ).format(
    date
  );
}


function displayTime(
  value: string
) {
  const [hourValue, minute] = value.split(":");
  let hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
}


function isDraggable(
  booking: Booking
) {
  return (
    booking.status ===
      "confirmed" &&
    new Date(
      booking.startsAt
    ).getTime() >
      Date.now()
  );
}


export default function DoctorCalendarPage() {
  const router =
    useRouter();

  const [
    profile,
    setProfile,
  ] =
    useState<
      Doctor | null
    >(null);

  const [
    bookings,
    setBookings,
  ] =
    useState<
      Booking[]
    >([]);

  const [
    slots,
    setSlots,
  ] =
    useState<
      DoctorSlot[]
    >([]);

  const [
    view,
    setView,
  ] =
    useState<CalendarView>(
      "week"
    );

  const [
    cursor,
    setCursor,
  ] =
    useState(
      new Date()
    );

  const [
    draggingBookingId,
    setDraggingBookingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    selectedBooking,
    setSelectedBooking,
  ] =
    useState<Booking | null>(
      null
    );

  const [customSlotTime, setCustomSlotTime] = useState("");
  const [slotError, setSlotError] = useState("");


  const load =
    useCallback(() => {
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

      const doctor =
        findDoctorProfile(
          user
        );

      if (
        !doctor
      ) {
        router.replace(
          "/doctors"
        );

        return;
      }

      setProfile(
        doctor
      );

      setBookings(
        getBookingsForDoctor(
          doctor.id,
          doctor.name
        )
      );

      setSlots(
        getDoctorSlots(
          doctor.id
        )
      );

    }, [
      router,
    ]);


  useEffect(() => {
    load();
  }, [load]);


  const move =
    (
      direction:
        -1 | 1
    ) => {
      const next =
        new Date(
          cursor
        );

      if (
        view ===
        "day"
      ) {
        next.setDate(
          next.getDate() +
            direction
        );
      }

      if (
        view ===
        "week"
      ) {
        next.setDate(
          next.getDate() +
            direction *
              7
        );
      }

      if (
        view ===
        "month"
      ) {
        next.setMonth(
          next.getMonth() +
            direction
        );
      }

      setCursor(
        next
      );
    };


  const dropOnSlot =
    (
      slot:
        DoctorSlot
    ) => {
      if (
        !draggingBookingId
      ) {
        return;
      }

      if (
        slot.status !==
        "available"
      ) {
        setMessage(
          "This slot is unavailable."
        );

        return;
      }

      const updated =
        rescheduleBooking(
          draggingBookingId,
          slot.id
        );

      setDraggingBookingId(
        null
      );

      if (
        updated
      ) {
        setMessage(
          "New time proposed. This appointment is pending patient approval."
        );

        load();
      } else {
        setMessage(
          "Unable to reschedule. The slot may already be booked."
        );

        load();
      }

      setTimeout(
        () =>
          setMessage(
            ""
          ),
        3500
      );
    };


  const createCustomSlot = () => {
    setSlotError("");

    if (!profile || !customSlotTime) {
      setSlotError("Choose a time for the new slot.");
      return;
    }

    const date = dateKey(cursor);
    const startsAt = new Date(`${date}T${customSlotTime}:00`);

    if (startsAt.getTime() <= Date.now()) {
      setSlotError("The custom slot must be in the future.");
      return;
    }

    const saved = saveDoctorSlot({
      id: `slot-${profile.id}-${Date.now()}`,
      doctorId: profile.id,
      date,
      time: displayTime(customSlotTime),
      status: "available",
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      setSlotError("A slot already exists at this time.");
      return;
    }

    setCustomSlotTime("");
    setMessage(`Custom slot added for ${formatShortDate(cursor)}.`);
    load();
  };


  const confirmSelectedBooking = () => {
    if (!selectedBooking || selectedBooking.status !== "pending") return;

    const updated = confirmBooking(selectedBooking.id);

    if (!updated) {
      setMessage("Unable to confirm this appointment.");
      return;
    }

    setSelectedBooking(updated);
    setMessage(`Appointment with ${updated.patientName} confirmed.`);
    load();
  };


  const renderBooking =
    (
      booking:
        Booking
    ) => {
      const draggable =
        isDraggable(
          booking
        );

      return (
        <div
          key={
            booking.id
          }
          role="button"
          tabIndex={0}
          draggable={
            draggable
          }
          onClick={() =>
            setSelectedBooking(
              booking
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setSelectedBooking(
                booking
              );
            }
          }}
          onDragStart={() =>
            draggable &&
            setDraggingBookingId(
              booking.id
            )
          }
          onDragEnd={() =>
            setDraggingBookingId(
              null
            )
          }
          className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
            calendarStatusStyles[
              booking.status
            ]
          } ${
            draggable
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-pointer"
          }`}
        >
          <div className="flex items-start justify-between gap-2">

            <div>
              <p className="text-sm font-semibold">
                {
                  booking.patientName
                }
              </p>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {
                  booking.time
                }{" "}
                ·{" "}
                {
                  booking.appointmentType ??
                  "In-person"
                }
              </p>
            </div>

            <StatusBadge
              status={
                booking.status
              }
            />

          </div>

          {draggable && (
            <p className="mt-2 text-[10px] font-semibold text-[var(--brand)]">
              Drag to an available slot
            </p>
          )}

        </div>
      );
    };


  const renderSlot =
    (
      slot:
        DoctorSlot
    ) => (
      <div
        key={
          slot.id
        }
        onDragOver={(
          event
        ) => {
          if (
            slot.status ===
            "available"
          ) {
            event.preventDefault();
          }
        }}
        onDrop={() =>
          dropOnSlot(
            slot
          )
        }
        className={`rounded-xl border border-dashed p-3 text-xs font-semibold ${
          slot.status ===
          "available"
            ? "border-[#dbeafe] bg-white text-[#C9362D]"
            : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock3
            size={
              13
            }
          />

          {
            slot.time
          }
        </div>

        <p className="mt-1 text-[10px] uppercase tracking-wide">
          {
            slot.status
          }
        </p>
      </div>
    );


  const weekDays =
    useMemo(() => {
      const start =
        startOfWeek(
          cursor
        );

      return Array.from(
        {
          length:
            7,
        },
        (
          _,
          index
        ) =>
          addDays(
            start,
            index
          )
      );
    }, [
      cursor,
    ]);


  const monthDays =
    useMemo(() => {
      const first =
        new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          1
        );

      const start =
        startOfWeek(
          first
        );

      return Array.from(
        {
          length:
            42,
        },
        (
          _,
          index
        ) =>
          addDays(
            start,
            index
          )
      );
    }, [
      cursor,
    ]);


  if (
    !profile
  ) {
    return (
      <main className="grid min-h-screen place-items-center">
        Loading calendar...
      </main>
    );
  }


  const cursorKey =
    dateKey(
      cursor
    );


  const dayBookings =
    bookings.filter(
      (booking) =>
        booking.date ===
        cursorKey
    );


  const daySlots =
    slots.filter(
      (slot) =>
        slot.date ===
        cursorKey
    );


  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-8 lg:px-10">

      <div className="mx-auto max-w-[94rem]">

        <div className="flex flex-col justify-between gap-5 rounded-[18px] border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_24px_rgba(11,19,41,0.04)] lg:flex-row lg:items-end lg:p-7">

          <div>

            <Link
              href="/doctor-dashboard"
              className="text-sm font-semibold text-[var(--brand)]"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-6 text-sm font-semibold text-[var(--brand)]">
              Calendar
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Appointment Calendar
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Drag confirmed future appointments onto available slots to reschedule them.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            {(
              [
                "day",
                "week",
                "month",
              ] as CalendarView[]
            ).map(
              (
                item
              ) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  onClick={() =>
                    setView(
                      item
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize ${
                    view ===
                    item
                      ? "bg-[var(--brand)] text-white shadow-sm"
                      : "border border-[var(--line)] bg-[#F8FAFC] text-[#64748B] hover:bg-white"
                  }`}
                >
                  {
                    item
                  }
                </button>
              )
            )}

          </div>

        </div>


        {message && (
          <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#C9362D]">
            {
              message
            }
          </div>
        )}


        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs font-semibold text-[#64748B]">
          <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
            Status
          </span>

          {(
            [
              "confirmed",
              "pending",
              "completed",
              "cancelled",
              "missed",
            ] as const
          ).map((status) => (
            <span
              key={status}
              className="flex items-center gap-1.5 capitalize"
            >
              <span
                className={`size-2 rounded-full ${
                  calendarStatusDots[status]
                }`}
              />
              {status}
            </span>
          ))}

          <span className="ml-auto hidden text-[10px] text-[#64748B] sm:block">
            Confirmed future bookings can be dragged
          </span>
        </div>


        <div className="mt-5 flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-4 shadow-[0_8px_24px_rgba(11,19,41,0.04)]">

          <button
            type="button"
            onClick={() =>
              move(
                -1
              )
            }
            className="grid size-10 place-items-center rounded-xl border border-[var(--line)]"
          >
            <ArrowLeft
              size={
                18
              }
            />
          </button>


          <div className="text-center">

            <p className="font-semibold">
              {view ===
              "month"
                ? new Intl.DateTimeFormat(
                    "en-IN",
                    {
                      month:
                        "long",
                      year:
                        "numeric",
                    }
                  ).format(
                    cursor
                  )
                : formatHeader(
                    cursor
                  )}
            </p>

            <button
              type="button"
              onClick={() =>
                setCursor(
                  new Date()
                )
              }
              className="mt-1 text-xs font-semibold text-[var(--brand)]"
            >
              Today
            </button>

          </div>


          <button
            type="button"
            onClick={() =>
              move(
                1
              )
            }
            className="grid size-10 place-items-center rounded-xl border border-[var(--line)]"
          >
            <ArrowRight
              size={
                18
              }
            />
          </button>

        </div>


        {view ===
          "day" && (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">

            <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-bold">
                    <CalendarDays size={18} className="text-[var(--brand)]" />
                    Daily appointments
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">Pending, confirmed and completed visits for this date.</p>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{dayBookings.filter((item) => item.status === "pending").length} pending</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{dayBookings.filter((item) => item.status === "confirmed").length} confirmed</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">

                {dayBookings.length >
                0 ? (
                  dayBookings.map(
                    renderBooking
                  )
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    No appointments for this day.
                  </p>
                )}

              </div>

            </section>


            <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_8px_24px_rgba(11,19,41,0.04)] sm:p-6">

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">Day availability</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{daySlots.filter((item) => item.status === "available").length} open slots on this date.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">{daySlots.length} total</span>
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-900"><Plus size={15} className="text-blue-600" /> Add a custom slot</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="time"
                    value={customSlotTime}
                    onChange={(event) => {
                      setCustomSlotTime(event.target.value);
                      setSlotError("");
                    }}
                    aria-label="Custom slot time"
                    className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                  <button type="button" onClick={createCustomSlot} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                    Create slot
                  </button>
                </div>
                {slotError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{slotError}</p>}
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">All slots</p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">

                {daySlots.length >
                0 ? (
                  daySlots.map(
                    renderSlot
                  )
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    No availability configured.
                  </p>
                )}

              </div>

            </section>

          </div>
        )}


        {view ===
          "week" && (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-7">

            {weekDays.map(
              (
                date
              ) => {
                const key =
                  dateKey(
                    date
                  );

                const appointmentsForDay =
                  bookings.filter(
                    (booking) =>
                      booking.date ===
                      key
                  );

                const slotsForDay =
                  slots.filter(
                    (slot) =>
                      slot.date ===
                      key
                  );

                return (
                  <section
                    key={
                      key
                    }
                    className="min-h-[320px] rounded-xl border border-[var(--line)] bg-white p-3 shadow-[0_6px_20px_rgba(11,19,41,0.035)]"
                  >

                    <button
                      type="button"
                      onClick={() => {
                        setCursor(
                          date
                        );

                        setView(
                          "day"
                        );
                      }}
                      className="w-full text-left"
                    >
                      <p className="text-xs font-semibold text-[var(--brand)]">
                        {
                          formatShortDate(
                            date
                          )
                        }
                      </p>
                    </button>


                    <div className="mt-3 space-y-2">

                      {appointmentsForDay.map(
                        renderBooking
                      )}

                    </div>


                    <div className="mt-4 border-t border-[var(--line)] pt-3">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Available slots
                      </p>

                      <div className="mt-2 space-y-2">

                        {slotsForDay
                          .filter(
                            (slot) =>
                              slot.status ===
                              "available"
                          )
                          .map(
                            renderSlot
                          )}

                      </div>

                    </div>

                  </section>
                );
              }
            )}

          </div>
        )}


        {view ===
          "month" && (
          <div className="mt-6 grid min-w-[760px] grid-cols-7 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_8px_24px_rgba(11,19,41,0.04)]">

            {[
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sun",
            ].map(
              (
                day
              ) => (
                <div
                  key={
                    day
                  }
                  className="border-b border-r border-[var(--line)] p-3 text-center text-xs font-semibold text-[var(--muted)]"
                >
                  {
                    day
                  }
                </div>
              )
            )}


            {monthDays.map(
              (
                date
              ) => {
                const key =
                  dateKey(
                    date
                  );

                const appointmentsForDay =
                  bookings.filter(
                    (booking) =>
                      booking.date ===
                      key
                  );

                const availableSlots =
                  slots.filter(
                    (slot) =>
                      slot.date ===
                        key &&
                      slot.status ===
                        "available"
                  );

                const belongsToMonth =
                  date.getMonth() ===
                  cursor.getMonth();

                return (
                  <div
                    key={
                      key
                    }
                    onDragOver={(event) => {
                      if (
                        draggingBookingId &&
                        availableSlots[0]
                      ) {
                        event.preventDefault();
                      }
                    }}
                    onDrop={() => {
                      if (
                        availableSlots[0]
                      ) {
                        dropOnSlot(
                          availableSlots[0]
                        );
                      }
                    }}
                    className={`min-h-28 border-b border-r border-[var(--line)] p-2 text-left transition hover:bg-[#F8FAFC]/40 ${
                      belongsToMonth
                        ? "bg-white"
                        : "bg-[#F8FAFC] text-[#64748B]"
                    } ${
                      draggingBookingId &&
                      availableSlots[0]
                        ? "bg-[#dbeafe]/50"
                        : ""
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() => {
                        setCursor(
                          date
                        );

                        setView(
                          "day"
                        );
                      }}
                      className="grid size-7 place-items-center rounded-full text-xs font-semibold hover:bg-[#dbeafe]"
                    >
                      {
                        date.getDate()
                      }
                    </button>

                    {appointmentsForDay.length >
                      0 && (
                      <span className="mt-3 block space-y-1">
                        {appointmentsForDay
                          .slice(
                            0,
                            3
                          )
                          .map(
                            (
                              booking
                            ) => (
                              <button
                                type="button"
                                key={booking.id}
                                onClick={() =>
                                  setSelectedBooking(
                                    booking
                                  )
                                }
                                className={`flex items-center gap-1.5 truncate rounded-md border px-2 py-1 text-[9px] font-semibold ${
                                  calendarStatusStyles[
                                    booking.status
                                  ]
                                }`}
                              >
                                <span
                                  className={`size-1.5 shrink-0 rounded-full ${
                                    calendarStatusDots[
                                      booking.status
                                    ]
                                  }`}
                                />
                                {booking.patientName}
                              </button>
                            )
                          )}

                        {appointmentsForDay.length >
                          3 && (
                          <span className="block px-1 text-[9px] font-semibold text-[var(--brand)]">
                            +{appointmentsForDay.length - 3} more
                          </span>
                        )}
                      </span>
                    )}

                    {availableSlots.length >
                      0 && (
                      <p className="mt-1 rounded-lg bg-[#F8FAFC] px-2 py-1 text-[10px] font-semibold text-[#C9362D]">
                        {draggingBookingId
                          ? `Drop at ${availableSlots[0].time}`
                          : `${availableSlots.length} available`}
                      </p>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>


      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0B1329]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedBooking(
                null
              );
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-appointment-title"
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[22px] bg-white shadow-2xl"
          >
            <div
              className={`border-b p-5 ${
                calendarStatusStyles[
                  selectedBooking.status
                ]
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-white/75">
                    <UserRound
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-65">
                      Appointment details
                    </p>

                    <h2
                      id="calendar-appointment-title"
                      className="mt-1 text-lg font-bold"
                    >
                      {
                        selectedBooking.patientName
                      }
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close appointment details"
                  onClick={() =>
                    setSelectedBooking(
                      null
                    )
                  }
                  className="grid size-9 place-items-center rounded-xl bg-white/60 hover:bg-white"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                  calendarStatusStyles[
                    selectedBooking.status
                  ]
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    calendarStatusDots[
                      selectedBooking.status
                    ]
                  }`}
                />
                {
                  selectedBooking.status
                }
              </span>

              <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                <div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <CalendarDays
                      size={14}
                    />
                    Date & time
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {
                      formatHeader(
                        new Date(
                          selectedBooking.startsAt
                        )
                      )
                    }
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {
                      selectedBooking.time
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <Stethoscope
                      size={14}
                    />
                    Visit type
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {
                      selectedBooking.appointmentType ??
                      "In-person"
                    }
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Age {
                      selectedBooking.patientAge
                    }
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Reason for visit
                </p>
                <p className="mt-2 text-sm leading-6">
                  {
                    selectedBooking.reason
                  }
                </p>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Mail
                    size={16}
                    className="text-[var(--brand)]"
                  />
                  <div>
                    <dt className="text-[10px] text-[var(--muted)]">Email</dt>
                    <dd className="break-all font-semibold">{selectedBooking.patientEmail}</dd>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Phone
                    size={16}
                    className="text-[var(--brand)]"
                  />
                  <div>
                    <dt className="text-[10px] text-[var(--muted)]">Phone</dt>
                    <dd className="font-semibold">{selectedBooking.patientPhone}</dd>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <MapPin
                    size={16}
                    className="text-[var(--brand)]"
                  />
                  <div>
                    <dt className="text-[10px] text-[var(--muted)]">Location</dt>
                    <dd className="font-semibold">{selectedBooking.doctorLocation ?? "Clinic"}</dd>
                  </div>
                </div>
              </dl>
                </div>

              <div>
                <PatientHealthSnapshot booking={selectedBooking} />
                <div className="mt-4">
                  <PatientIntakeSummary booking={selectedBooking} />
                </div>
              </div>
              </div>

              {isDraggable(
                selectedBooking
              ) && (
                <p className="mt-5 rounded-xl bg-[#F8FAFC] px-4 py-3 text-xs font-semibold leading-5 text-[#C9362D]">
                  Drag this appointment to any dashed orange available slot to reschedule it.
                </p>
              )}

              {selectedBooking.status === "pending" && !selectedBooking.rescheduleApprovalPending && (
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-500">Confirming reserves this visit and notifies the patient immediately.</p>
                  <button
                    type="button"
                    onClick={confirmSelectedBooking}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={17} />
                    Confirm appointment
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

    </main>
  );
}
