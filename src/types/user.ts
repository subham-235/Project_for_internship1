export type UserRole = "patient" | "doctor";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;


  specialty?: string;
  registrationNumber?: string;
};


export type MockUser = User;

export type PatientProfile = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  heightCm: string;
  weightKg: string;
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  updatedAt: string;
};
