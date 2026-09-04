export type PrescriptionMedicine = {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export type StructuredCarePlan = {
  treatmentGoal: string;
  selfCareInstructions: string;
  recommendedTests: string;
  warningSigns: string;
  followUpDate: string;
  followUpNotes: string;
  publishedAt: string;
};

export type Prescription = {
  id: string;

  bookingId: string;

  doctorId: string;

  doctorName: string;

  patientName: string;

  diagnosis: string;

  medications: string[];



  medicines?: PrescriptionMedicine[];

  carePlan?: StructuredCarePlan;

  notes: string;

  createdAt: string;

  updatedAt?: string;
};
