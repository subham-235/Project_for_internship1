"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, ChartNoAxesCombined } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Booking, BookingStatus } from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const statusColors: Record<BookingStatus, string> = {
  confirmed: "#10B981",
  completed: "#10B981",
  pending: "#F59E0B",
  cancelled: "#F43F5E",
  missed: "#F43F5E",
};

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric" }).format(date);

export default function DashboardAnalytics({ bookings }: { bookings: Booking[] }) {
  const reduceMotion = useReducedMotion();
  const today = new Date();
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: formatShortDate(date),
      appointments: bookings.filter((booking) => booking.date === key).length,
    };
  });

  const statusData = (["confirmed", "pending", "completed", "cancelled", "missed"] as BookingStatus[])
    .map((status) => ({
      name: status[0].toUpperCase() + status.slice(1),
      status,
      value: bookings.filter((booking) => booking.status === status).length,
    }))
    .filter((item) => item.value > 0);

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,.75fr)]" aria-label="Practice analytics">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-4 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">Practice pulse</p>
            <CardTitle className="mt-1">Appointments over the last 7 days</CardTitle>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-brand ring-1 ring-blue-100">
            <ChartNoAxesCombined className="size-5" />
          </span>
        </CardHeader>
        <CardContent className="h-72 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} dy={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip
                cursor={{ stroke: "#bfdbfe", strokeWidth: 1.5 }}
                contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 16px 36px -20px rgba(15,23,42,.4)", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#appointmentGradient)"
                isAnimationActive={!reduceMotion}
                animationDuration={850}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-4 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Care outcomes</p>
            <CardTitle className="mt-1">Appointment mix</CardTitle>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-accent ring-1 ring-indigo-100">
            <Activity className="size-5" />
          </span>
        </CardHeader>
        <CardContent className="pt-5">
          {statusData.length ? (
            <>
              <div className="relative mx-auto h-44 max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={73} paddingAngle={4} stroke="none" isAnimationActive={!reduceMotion}>
                      {statusData.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <span><strong className="block font-heading text-2xl text-slate-950">{bookings.length}</strong><small className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total</small></span>
                </motion.div>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
                {statusData.map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 text-slate-500"><i className="size-2 rounded-full" style={{ backgroundColor: statusColors[entry.status] }} />{entry.name}</span>
                    <strong className="text-slate-900">{entry.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid h-52 place-items-center text-center text-sm text-slate-500">Analytics will appear after your first booking.</div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
