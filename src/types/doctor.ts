export type Doctor = {
  id: string;


  userId?: string;

  name: string;

  initials: string;

  image?: string;

  email?: string;

  phone?: string;

  registrationNumber?: string;

  specialty: string;

  experience: number;

  rating: number;

  reviews: number;

  location: string;

  fee: number;

  availability: string;

  bio: string;

  education: string[];

  languages: string[];







  slots: string[];
};