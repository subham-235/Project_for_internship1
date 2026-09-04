import type { Booking, BookingStatus } from "@/types/booking";

import type { Doctor } from "@/types/doctor";

import type { DoctorSlot } from "@/types/availability";

import type { PatientProfile, User, UserRole } from "@/types/user";

import type { AppNotification, NotificationType } from "@/types/notification";

import type { Prescription } from "@/types/prescription";

import type { DoctorReview } from "@/types/review";

const BOOKINGS_KEY = "schedula-bookings";

const USER_KEY = "schedula-user";

const REGISTERED_USERS_KEY = "schedula-registered-users";

const REGISTERED_DOCTORS_KEY = "schedula-registered-doctors";

const DOCTOR_SLOTS_KEY = "schedula-doctor-slots";

const SEEDED_DOCTORS_KEY = "schedula-seeded-slot-doctors";

const LATEST_BOOKING_ID_KEY = "schedula-latest-booking-id";

const NOTIFICATIONS_KEY = "schedula-notifications";

const PRESCRIPTIONS_KEY = "schedula-prescriptions";

const REVIEWS_KEY = "schedula-reviews";

const PATIENT_PROFILES_KEY = "schedula-patient-profiles";

export type StoredUser = {
  id: string;

  name: string;

  email: string;

  role: UserRole;
};

/* =========================================
   GENERIC HELPERS
========================================= */

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = localStorage.getItem(key);

    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`Unable to write ${key}:`, error);

    return false;
  }
}

/* =========================================
   CURRENT USER
========================================= */

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = localStorage.getItem(USER_KEY);

    return value ? (JSON.parse(value) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: StoredUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("schedula-auth-change"));
}

export function clearCurrentUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("schedula-auth-change"));
}

/* =========================================
   REGISTERED USERS
========================================= */

export function getRegisteredUsers(): User[] {
  return readArray<User>(REGISTERED_USERS_KEY);
}

export function saveRegisteredUser(user: User) {
  const users = getRegisteredUsers();

  const index = users.findIndex((item) => item.id === user.id);

  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }

  writeArray(REGISTERED_USERS_KEY, users);
}

/* =========================================
   PATIENT PROFILES
========================================= */

export function getPatientProfile(userId: string): PatientProfile | null {
  return readArray<PatientProfile>(PATIENT_PROFILES_KEY).find(
    (profile) => profile.userId === userId,
  ) ?? null;
}

export function savePatientProfile(profile: PatientProfile): boolean {
  const profiles = readArray<PatientProfile>(PATIENT_PROFILES_KEY);
  const index = profiles.findIndex((item) => item.userId === profile.userId);

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }

  const saved = writeArray(PATIENT_PROFILES_KEY, profiles);

  if (saved) {
    const current = getCurrentUser();
    if (current?.id === profile.userId) {
      saveCurrentUser({ ...current, name: profile.name });
    }
  }

  return saved;
}

/* =========================================
   DOCTORS
========================================= */

export function getRegisteredDoctors(): Doctor[] {
  return readArray<Doctor>(REGISTERED_DOCTORS_KEY);
}

export function saveRegisteredDoctor(doctor: Doctor) {
  const doctors = getRegisteredDoctors();

  const index = doctors.findIndex((item) => item.id === doctor.id);

  if (index >= 0) {
    doctors[index] = doctor;
  } else {
    doctors.push(doctor);
  }

  writeArray(REGISTERED_DOCTORS_KEY, doctors);
}

export function mergeDoctorProfiles(
  baseDoctors: Doctor[],
  storedDoctors: Doctor[] = getRegisteredDoctors(),
): Doctor[] {
  const map = new Map<string, Doctor>();

  baseDoctors.forEach((doctor) => {
    map.set(doctor.id, doctor);
  });

  storedDoctors.forEach((doctor) => {
    const existing = map.get(doctor.id);

    map.set(
      doctor.id,
      existing
        ? {
            ...existing,
            ...doctor,
          }
        : doctor,
    );
  });

  return Array.from(map.values());
}

/* =========================================
   BOOKINGS
========================================= */

export function getBookings(): Booking[] {
  return readArray<Booking>(BOOKINGS_KEY);
}

export function getBookingById(bookingId: string): Booking | null {
  return getBookings().find((booking) => booking.id === bookingId) ?? null;
}

export function getBookingsForDoctor(
  doctorId: string,
  doctorName?: string,
): Booking[] {
  const normalizedName = doctorName?.trim().toLowerCase();

  return getBookings()
    .filter(
      (booking) =>
        booking.doctorId === doctorId ||
        (normalizedName &&
          booking.doctorName.trim().toLowerCase() === normalizedName),
    )
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

export function getBookingsForPatient(
  patientId?: string,
  patientEmail?: string,
): Booking[] {
  const normalizedEmail = patientEmail?.trim().toLowerCase();

  return getBookings()
    .filter(
      (booking) =>
        (patientId && booking.patientId === patientId) ||
        (normalizedEmail &&
          booking.patientEmail.trim().toLowerCase() === normalizedEmail),
    )
    .sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
}

export function saveBooking(booking: Booking): boolean {
  const bookings = getBookings();

  const index = bookings.findIndex((item) => item.id === booking.id);

  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.unshift(booking);
  }

  return writeArray(BOOKINGS_KEY, bookings);
}

/* =========================================
   LATEST BOOKING
========================================= */

export function saveLatestBookingId(bookingId: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LATEST_BOOKING_ID_KEY, bookingId);
}

export function getLatestBooking(): Booking | null {
  if (typeof window === "undefined") {
    return null;
  }

  const id = localStorage.getItem(LATEST_BOOKING_ID_KEY);

  if (!id) {
    return null;
  }

  return getBookingById(id);
}

/* =========================================
   SLOT DATE HELPERS
========================================= */

function toDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function timeTo24Hour(value: string) {
  if (!value.includes(" ")) {
    return value;
  }

  const [clock, period] = value.split(" ");

  const [initialHours, minutes] = clock.split(":").map(Number);
  let hours = initialHours;

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

function slotTimestamp(slot: DoctorSlot) {
  return new Date(`${slot.date}T${timeTo24Hour(slot.time)}:00`).getTime();
}

/* =========================================
   DOCTOR SLOTS
========================================= */

export function getDoctorSlots(doctorId?: string): DoctorSlot[] {
  const slots = readArray<DoctorSlot>(DOCTOR_SLOTS_KEY);

  const filtered = doctorId
    ? slots.filter((slot) => slot.doctorId === doctorId)
    : slots;

  return filtered.sort((a, b) => slotTimestamp(a) - slotTimestamp(b));
}

export function saveDoctorSlot(slot: DoctorSlot): boolean {
  const slots = getDoctorSlots();

  const duplicate = slots.some(
    (item) =>
      item.doctorId === slot.doctorId &&
      item.date === slot.date &&
      item.time === slot.time,
  );

  if (duplicate) {
    return false;
  }

  return writeArray(DOCTOR_SLOTS_KEY, [...slots, slot]);
}

export function saveDoctorSlots(newSlots: DoctorSlot[]): number {
  const existing = getDoctorSlots();

  const keys = new Set(
    existing.map((slot) => `${slot.doctorId}|${slot.date}|${slot.time}`),
  );

  const accepted: DoctorSlot[] = [];

  newSlots.forEach((slot) => {
    const key = `${slot.doctorId}|${slot.date}|${slot.time}`;

    if (keys.has(key)) {
      return;
    }

    keys.add(key);

    accepted.push(slot);
  });

  if (accepted.length === 0) {
    return 0;
  }

  const success = writeArray(DOCTOR_SLOTS_KEY, [...existing, ...accepted]);

  return success ? accepted.length : 0;
}

export function deleteDoctorSlot(slotId: string): boolean {
  const slots = getDoctorSlots();

  const slot = slots.find((item) => item.id === slotId);

  if (!slot || slot.status === "booked") {
    return false;
  }

  return writeArray(
    DOCTOR_SLOTS_KEY,
    slots.filter((item) => item.id !== slotId),
  );
}

export function getAvailableSlotsForDoctor(doctorId: string): DoctorSlot[] {
  const now = Date.now();

  return getDoctorSlots(doctorId).filter(
    (slot) => slot.status === "available" && slotTimestamp(slot) > now,
  );
}

export function markDoctorSlotBooked(
  slotId: string,
  bookingId: string,
): boolean {
  const slots = getDoctorSlots();

  const index = slots.findIndex((slot) => slot.id === slotId);

  if (index < 0 || slots[index].status !== "available") {
    return false;
  }

  slots[index] = {
    ...slots[index],

    status: "booked",

    bookingId,
  };

  return writeArray(DOCTOR_SLOTS_KEY, slots);
}

export function releaseDoctorSlot(
  slotId?: string,
  bookingId?: string,
): boolean {
  if (!slotId) {
    return false;
  }

  const slots = getDoctorSlots();

  const index = slots.findIndex((slot) => slot.id === slotId);

  if (index < 0) {
    return false;
  }

  if (
    bookingId &&
    slots[index].bookingId &&
    slots[index].bookingId !== bookingId
  ) {
    return false;
  }

  slots[index] = {
    ...slots[index],

    status: "available",
  };

  delete slots[index].bookingId;

  return writeArray(DOCTOR_SLOTS_KEY, slots);
}

/* =========================================
   SAVE BOOKING + RESERVE SLOT
========================================= */

export function saveBookingWithSlot(booking: Booking, slotId: string): boolean {
  const slots = getDoctorSlots();

  const slotIndex = slots.findIndex((slot) => slot.id === slotId);

  if (slotIndex < 0 || slots[slotIndex].status !== "available") {
    return false;
  }

  const bookings = getBookings();

  slots[slotIndex] = {
    ...slots[slotIndex],

    status: "booked",

    bookingId: booking.id,
  };

  try {
    localStorage.setItem(DOCTOR_SLOTS_KEY, JSON.stringify(slots));

    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...bookings]));

    createNotification({
      recipientUserId: booking.patientId,

      recipientEmail: booking.patientEmail,

      type: "booking",

      title: "Appointment request sent",

      message: `Your appointment request with ${booking.doctorName} has been submitted.`,

      appointmentId: booking.id,
    });

    return true;
  } catch (error) {
    console.error("Unable to save booking:", error);

    return false;
  }
}

/* =========================================
   UPDATE STATUS
========================================= */

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Booking | null {
  const bookings = getBookings();

  const index = bookings.findIndex((booking) => booking.id === bookingId);

  if (index < 0) {
    return null;
  }

  const booking = bookings[index];

  const updated: Booking = {
    ...booking,
    status,
  };

  bookings[index] = updated;

  if (status === "cancelled" && booking.slotId) {
    releaseDoctorSlot(booking.slotId, booking.id);
  }

  const saved = writeArray(BOOKINGS_KEY, bookings);

  if (!saved) {
    return null;
  }

  let notificationType: NotificationType | null = null;

  let title = "";

  let message = "";

  if (status === "confirmed") {
    notificationType = "confirmed";

    title = "Appointment confirmed";

    message = `${booking.doctorName} confirmed your appointment for ${booking.date} at ${booking.time}.`;
  }

  if (status === "cancelled") {
    notificationType = "cancelled";

    title = "Appointment cancelled";

    message = `Your appointment with ${booking.doctorName} has been cancelled.`;
  }

  if (status === "completed") {
    notificationType = "completed";

    title = "Appointment completed";

    message = `Your appointment with ${booking.doctorName} has been marked as completed.`;
  }

  if (status === "missed") {
    notificationType = "missed";

    title = "Appointment missed";

    message = `Your appointment with ${booking.doctorName} has been marked as missed.`;
  }

  if (notificationType) {
    createNotification({
      recipientUserId: booking.patientId,

      recipientEmail: booking.patientEmail,

      type: notificationType,

      title,

      message,

      appointmentId: booking.id,
    });
  }

  return updated;
}

export function confirmBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "confirmed");
}

export function declineBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "cancelled");
}

export function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "cancelled");
}

export function markBookingCompleted(bookingId: string) {
  return updateBookingStatus(bookingId, "completed");
}

export function markBookingMissed(bookingId: string) {
  return updateBookingStatus(bookingId, "missed");
}

/* =========================================
   RESCHEDULE APPOINTMENT
========================================= */

export function rescheduleBooking(
  bookingId: string,
  newSlotId: string,
): Booking | null {
  const bookings = getBookings();

  const bookingIndex = bookings.findIndex(
    (booking) => booking.id === bookingId,
  );

  if (bookingIndex < 0) {
    return null;
  }

  const booking = bookings[bookingIndex];

  if (
    booking.status !== "confirmed" ||
    new Date(booking.startsAt).getTime() <= Date.now()
  ) {
    return null;
  }

  const slots = getDoctorSlots();

  const newSlotIndex = slots.findIndex((slot) => slot.id === newSlotId);

  if (
    newSlotIndex < 0 ||
    slots[newSlotIndex].status !== "available" ||
    slots[newSlotIndex].doctorId !== booking.doctorId
  ) {
    return null;
  }

  const newSlot = slots[newSlotIndex];

  if (booking.slotId) {
    const oldSlotIndex = slots.findIndex((slot) => slot.id === booking.slotId);

    if (oldSlotIndex >= 0 && slots[oldSlotIndex].bookingId === booking.id) {
      slots[oldSlotIndex] = {
        ...slots[oldSlotIndex],

        status: "available",
      };

      delete slots[oldSlotIndex].bookingId;
    }
  }

  slots[newSlotIndex] = {
    ...newSlot,

    status: "booked",

    bookingId: booking.id,
  };

  const updated: Booking = {
    ...booking,

    slotId: newSlot.id,

    originalStartsAt: booking.originalStartsAt ?? booking.startsAt,

    date: newSlot.date,

    time: newSlot.time,

    startsAt: `${newSlot.date}T${timeTo24Hour(newSlot.time)}:00`,

    status: "pending",

    rescheduledAt: new Date().toISOString(),

    rescheduleApprovalPending: true,
  };

  bookings[bookingIndex] = updated;

  try {
    localStorage.setItem(DOCTOR_SLOTS_KEY, JSON.stringify(slots));

    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    createNotification({
      recipientUserId: booking.patientId,

      recipientEmail: booking.patientEmail,

      type: "rescheduled",

      title: "Approve new appointment time",

      message: `${booking.doctorName} proposed ${newSlot.date} at ${newSlot.time}. Review and approve the new time from your dashboard.`,

      appointmentId: booking.id,
    });

    return updated;
  } catch (error) {
    console.error("Unable to reschedule booking:", error);

    return null;
  }
}

export function approveRescheduledBooking(bookingId: string): Booking | null {
  const bookings = getBookings();
  const index = bookings.findIndex((booking) => booking.id === bookingId);

  if (index < 0 || !bookings[index].rescheduleApprovalPending) {
    return null;
  }

  const updated: Booking = {
    ...bookings[index],
    status: "confirmed",
    rescheduleApprovalPending: false,
    rescheduleApprovedAt: new Date().toISOString(),
  };

  bookings[index] = updated;
  return writeArray(BOOKINGS_KEY, bookings) ? updated : null;
}

/* =========================================
   NOTIFICATIONS
========================================= */

export function getNotifications(): AppNotification[] {
  return readArray<AppNotification>(NOTIFICATIONS_KEY);
}

export function createNotification(notification: {
  recipientUserId?: string;
  recipientEmail?: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string;
}): AppNotification {
  const item: AppNotification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    ...notification,

    read: false,

    createdAt: new Date().toISOString(),
  };

  const notifications = getNotifications();

  writeArray(NOTIFICATIONS_KEY, [item, ...notifications]);

  return item;
}

export function getNotificationsForUser(
  userId?: string,
  email?: string,
): AppNotification[] {
  const normalizedEmail = email?.trim().toLowerCase();

  return getNotifications()
    .filter(
      (notification) =>
        (userId && notification.recipientUserId === userId) ||
        (normalizedEmail &&
          notification.recipientEmail?.trim().toLowerCase() ===
            normalizedEmail),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function markNotificationRead(notificationId: string) {
  const notifications = getNotifications();

  const updated = notifications.map((notification) =>
    notification.id === notificationId
      ? {
          ...notification,
          read: true,
        }
      : notification,
  );

  writeArray(NOTIFICATIONS_KEY, updated);
}

export function markAllNotificationsRead(userId?: string, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase();

  const notifications = getNotifications();

  const updated = notifications.map((notification) => {
    const belongs =
      (userId && notification.recipientUserId === userId) ||
      (normalizedEmail &&
        notification.recipientEmail?.trim().toLowerCase() === normalizedEmail);

    return belongs
      ? {
          ...notification,
          read: true,
        }
      : notification;
  });

  writeArray(NOTIFICATIONS_KEY, updated);
}

export function ensureAppointmentReminderNotifications(
  userId?: string,
  email?: string,
) {
  const now = Date.now();

  const twentyFourHours = 24 * 60 * 60 * 1000;

  const bookings = getBookingsForPatient(userId, email);

  const notifications = getNotificationsForUser(userId, email);

  bookings.forEach((booking) => {
    if (booking.status !== "confirmed") {
      return;
    }

    const appointmentTime = new Date(booking.startsAt).getTime();

    const difference = appointmentTime - now;

    if (difference <= 0 || difference > twentyFourHours) {
      return;
    }

    const alreadyCreated = notifications.some(
      (notification) =>
        notification.type === "reminder" &&
        notification.appointmentId === booking.id,
    );

    if (alreadyCreated) {
      return;
    }

    createNotification({
      recipientUserId: booking.patientId,

      recipientEmail: booking.patientEmail,

      type: "reminder",

      title: "Appointment reminder",

      message: `You have an appointment with ${booking.doctorName} on ${booking.date} at ${booking.time}.`,

      appointmentId: booking.id,
    });
  });
}

/* =========================================
   PRESCRIPTIONS
========================================= */

export function getPrescriptions(): Prescription[] {
  return readArray<Prescription>(PRESCRIPTIONS_KEY);
}

export function getPrescriptionByBookingId(
  bookingId: string,
): Prescription | null {
  return (
    getPrescriptions().find((item) => item.bookingId === bookingId) ?? null
  );
}

export function savePrescription(prescription: Prescription): boolean {
  const prescriptions = getPrescriptions();

  const existingIndex = prescriptions.findIndex(
    (item) => item.bookingId === prescription.bookingId,
  );

  const isNew = existingIndex < 0;

  if (existingIndex >= 0) {
    prescriptions[existingIndex] = prescription;
  } else {
    prescriptions.unshift(prescription);
  }

  const saved = writeArray(PRESCRIPTIONS_KEY, prescriptions);

  if (saved && isNew) {
    const booking = getBookingById(prescription.bookingId);

    if (booking) {
      createNotification({
        recipientUserId: booking.patientId,

        recipientEmail: booking.patientEmail,

        type: "prescription",

        title: "Prescription available",

        message: `Your prescription from ${booking.doctorName} is now available.`,

        appointmentId: booking.id,
      });
    }
  }

  return saved;
}

/* =========================================
   REVIEWS
========================================= */

export function getDoctorReviews(): DoctorReview[] {
  return readArray<DoctorReview>(REVIEWS_KEY);
}

export function getReviewsForDoctor(doctorId: string): DoctorReview[] {
  return getDoctorReviews()
    .filter((review) => review.doctorId === doctorId)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
}

export function applyDoctorReviewStats(
  doctor: Doctor,
  submittedReviews: DoctorReview[] = getDoctorReviews(),
): Doctor {
  const validReviews = submittedReviews.filter(
    (review) =>
      review.doctorId === doctor.id &&
      Number.isFinite(review.rating) &&
      review.rating >= 1 &&
      review.rating <= 5,
  );
  const reviewCount = doctor.reviews + validReviews.length;

  if (!validReviews.length) return doctor;

  const submittedTotal = validReviews.reduce(
    (total, review) => total + review.rating,
    0,
  );
  const weightedRating =
    (doctor.rating * doctor.reviews + submittedTotal) / reviewCount;

  return {
    ...doctor,
    rating: Number(weightedRating.toFixed(2)),
    reviews: reviewCount,
  };
}

export function getReviewByBookingId(bookingId: string): DoctorReview | null {
  return (
    getDoctorReviews().find((review) => review.bookingId === bookingId) ?? null
  );
}

export function saveDoctorReview(review: DoctorReview): boolean {
  const reviews = getDoctorReviews();

  const existing = reviews.some((item) => item.bookingId === review.bookingId);

  if (existing) {
    return false;
  }

  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    return false;
  }

  const saved = writeArray(REVIEWS_KEY, [review, ...reviews]);
  if (saved) window.dispatchEvent(new Event("schedula-reviews-change"));
  return saved;
}

/* =========================================
   INITIAL LEGACY SLOT SEED
========================================= */

export function ensureDoctorSlotsSeeded(
  doctorId: string,
  legacyTimes: string[],
  days = 5,
) {
  if (typeof window === "undefined") {
    return;
  }

  let seededDoctors: string[] = [];

  try {
    seededDoctors = JSON.parse(
      localStorage.getItem(SEEDED_DOCTORS_KEY) ?? "[]",
    ) as string[];
  } catch {
    seededDoctors = [];
  }

  if (seededDoctors.includes(doctorId)) {
    return;
  }

  const now = new Date();

  const generated: DoctorSlot[] = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(now);

    date.setDate(now.getDate() + day);

    const dateKey = toDateKey(date);

    legacyTimes.forEach((slotTime, index) => {
      generated.push({
        id: `slot-${doctorId}-${dateKey}-${index}-${Date.now()}`,

        doctorId,

        date: dateKey,

        time: slotTime,

        status: "available",

        createdAt: new Date().toISOString(),
      });
    });
  }

  saveDoctorSlots(generated);

  localStorage.setItem(
    SEEDED_DOCTORS_KEY,
    JSON.stringify([...seededDoctors, doctorId]),
  );
}
