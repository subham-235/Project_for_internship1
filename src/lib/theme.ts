export const theme = {
  colors: {
    brand: "#2563eb",
    brandDeep: "#1d4ed8",
    accent: "#6366F1",
    background: "#F8FAFC",
    backgroundDark: "#0B1120",
    status: {
      confirmed: "#10B981",
      pending: "#F59E0B",
      cancelled: "#F43F5E",
      upcoming: "#0EA5E9",
    },
  },
  motion: {
    fast: 0.2,
    normal: 0.35,
    slow: 0.65,
    stagger: 0.05,
    easeOut: [0.16, 1, 0.3, 1] as const,
  },
} as const;

export type AppointmentVisualStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "missed"
  | "upcoming"
  | "scheduled";

export const statusTheme: Record<
  AppointmentVisualStatus,
  { label: string; dot: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-500",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  missed: {
    label: "Missed",
    dot: "bg-rose-500",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-sky-500",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  scheduled: {
    label: "Scheduled",
    dot: "bg-sky-500",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
};
