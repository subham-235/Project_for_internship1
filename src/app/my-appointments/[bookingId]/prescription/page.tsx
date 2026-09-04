"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import PrescriptionPdfButton from "@/components/prescriptions/PrescriptionPdfButton";
import PrescriptionView from "@/components/prescriptions/PrescriptionView";
import {
  getBookingById,
  getCurrentUser,
  getPrescriptionByBookingId,
} from "@/lib/client-storage";
import type { Booking } from "@/types/booking";
import type { Prescription } from "@/types/prescription";

export default function PatientPrescriptionPage() {
  const router = useRouter();
  const params = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const item = getBookingById(params.bookingId);
    const record = getPrescriptionByBookingId(params.bookingId);
    const belongsToPatient = item && (item.patientId === user.id || item.patientEmail.toLowerCase() === user.email.toLowerCase());
    const belongsToDoctor = item && user.role === "doctor";
    if (!item || !record || (!belongsToPatient && !belongsToDoctor)) {
      setLoading(false);
      return;
    }
    setBooking(item);
    setPrescription(record);
    setLoading(false);
  }, [params.bookingId, router]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-sm text-[var(--muted)]">Loading prescription...</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-73px)] bg-[#F8FAFC] px-4 py-8 sm:px-7">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/my-appointments" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand)]">
              <ArrowLeft size={16} /> My appointments
            </Link>
            {booking && prescription && <PrescriptionPdfButton booking={booking} prescription={prescription} />}
          </div>
          {booking && prescription ? (
            <PrescriptionView booking={booking} prescription={prescription} />
          ) : (
            <section className="rounded-[18px] border border-[#E2E8F0] bg-white p-10 text-center">
              <h1 className="text-xl font-bold">Prescription unavailable</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">This prescription could not be found or is not available to this account.</p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
