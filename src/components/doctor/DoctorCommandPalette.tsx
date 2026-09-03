"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { CalendarDays, Search, Stethoscope, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Booking } from "@/types/booking";
import StatusBadge from "@/components/appointments/StatusBadge";
import { formatAppointmentDate, formatAppointmentTime } from "@/lib/appointment-utils";

export default function DoctorCommandPalette({ bookings, onSelect }: { bookings: Booking[]; onSelect: (booking: Booking) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const chooseBooking = (booking: Booking) => {
    setOpen(false);
    onSelect(booking);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-brand sm:inline-flex">
          <Search className="size-4" /> Search patients
          <kbd className="ml-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">Ctrl K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-[16vh] z-[101] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <Dialog.Title className="sr-only">Search patients and appointments</Dialog.Title>
          <Dialog.Description className="sr-only">Type a patient name, appointment reason, date, or status.</Dialog.Description>
          <Command label="Patient and appointment command menu" className="w-full bg-transparent">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5">
              <Search className="size-5 shrink-0 text-slate-400" />
              <Command.Input autoFocus placeholder="Search patient, reason, date, or status…" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400" />
              <Dialog.Close className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Close search"><X className="size-4" /></Dialog.Close>
            </div>
            <Command.List className="warm-scrollbar max-h-[25rem] overflow-y-auto p-2">
              <Command.Empty className="px-5 py-12 text-center text-sm text-slate-500">No matching patient or appointment.</Command.Empty>
              <Command.Group heading="Appointments" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[.18em] [&_[cmdk-group-heading]]:text-slate-400">
                {bookings.map((booking) => (
                  <Command.Item
                    key={booking.id}
                    value={`${booking.patientName} ${booking.reason} ${booking.date} ${booking.status}`}
                    onSelect={() => chooseBooking(booking)}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 outline-none data-[selected=true]:bg-blue-50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 group-data-[selected=true]:bg-blue-100 group-data-[selected=true]:text-brand">
                      <UserRound className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">{booking.patientName}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{formatAppointmentDate(booking.startsAt)} · {formatAppointmentTime(booking.startsAt)}</span>
                        <span className="inline-flex items-center gap-1"><Stethoscope className="size-3" />{booking.reason}</span>
                      </span>
                    </span>
                    <StatusBadge status={booking.status} />
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
