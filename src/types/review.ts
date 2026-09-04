export type DoctorReview = {
  id: string;

  bookingId: string;

  doctorId: string;

  patientId?: string;

  patientName?: string;

  patientEmail: string;

  rating: number;

  comment: string;

  createdAt: string;
};
