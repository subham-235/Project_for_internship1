import type {
  AppointmentType,
} from "@/types/appointment";


export type BookingAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;


  dataUrl?: string;
};

export type BookingPayment = {
  method: "upi" | "card";
  status: "paid";
  amount: number;
  transactionId: string;
  paidAt: string;
};

export type BookingPatientProfile = {
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  heightCm: string;
  weightKg: string;
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  updatedAt: string;
};

export type BookingIntakeAnswer = {
  questionId: string;
  label: string;
  value: string;
};

export type BookingIntake = {
  specialty: string;
  primaryConcern: string;
  symptomDuration: string;
  severity: "mild" | "moderate" | "severe";
  answers: BookingIntakeAnswer[];
  consentToShare: boolean;
  completedAt: string;
};

export type BookingQueue = {
  token: string;
  status: "waiting" | "in_consultation" | "completed";
  checkedInAt: string;
  consultationStartedAt?: string;
  completedAt?: string;
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
  patientProfile?: BookingPatientProfile;
  intake?: BookingIntake;
  queue?: BookingQueue;

  reason: string;

  appointmentType: AppointmentType;

  date: string;
  time: string;
  startsAt: string;

  fee: number;

  payment?: BookingPayment;

  status: BookingStatus;

  createdAt: string;

  rescheduledAt?: string;
  originalStartsAt?: string;
  rescheduleApprovalPending?: boolean;
  rescheduleApprovedAt?: string;

  attachment?: BookingAttachment;
};
