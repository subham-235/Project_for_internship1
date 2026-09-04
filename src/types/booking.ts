import type {
  AppointmentType,
} from "@/types/appointment";


export type BookingAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;

  // Compatibility with old localStorage bookings
  dataUrl?: string;
};


export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "missed";


export type Booking = {
  id: string;

  doctorId: string;
  doctorName: string;
  specialty: string;
  doctorLocation?: string;

  slotId?: string;

  patientId?: string;

  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;

  reason: string;

  appointmentType: AppointmentType;

  date: string;
  time: string;
  startsAt: string;

  fee: number;

  status: BookingStatus;

  createdAt: string;

  rescheduledAt?: string;
  originalStartsAt?: string;
  rescheduleApprovalPending?: boolean;
  rescheduleApprovedAt?: string;

  attachment?: BookingAttachment;
};
