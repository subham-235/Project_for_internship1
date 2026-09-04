"use client";

import * as Popover from "@radix-ui/react-popover";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, CalendarClock, CheckCheck, CircleCheck, CreditCard, FileText, RefreshCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ensureAppointmentReminderNotifications,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  type StoredUser,
} from "@/lib/client-storage";
import type { AppNotification, NotificationType } from "@/types/notification";

const icons = {
  booking: CalendarClock,
  confirmed: CircleCheck,
  rescheduled: RefreshCcw,
  cancelled: XCircle,
  reminder: Bell,
  missed: XCircle,
  completed: CircleCheck,
  prescription: FileText,
  payment_success: CreditCard,
  payment_failed: CreditCard,
} satisfies Record<NotificationType, typeof Bell>;

const iconTones: Partial<Record<NotificationType, string>> = {
  confirmed: "bg-emerald-50 text-emerald-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-rose-50 text-rose-600",
  missed: "bg-rose-50 text-rose-600",
  reminder: "bg-sky-50 text-sky-600",
  rescheduled: "bg-amber-50 text-amber-600",
  payment_success: "bg-emerald-50 text-emerald-600",
  payment_failed: "bg-rose-50 text-rose-600",
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function NotificationBell({
  user,
  href = "/my-appointments",
  reminders = true,
  className = "size-9",
}: {
  user: StoredUser;
  href?: string;
  reminders?: boolean;
  className?: string;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const load = useCallback(() => {
    if (reminders) ensureAppointmentReminderNotifications(user.id, user.email);
    setNotifications(getNotificationsForUser(user.id, user.email));
  }, [reminders, user.email, user.id]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);
    window.addEventListener("schedula-notifications-change", load);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
      window.removeEventListener("schedula-notifications-change", load);
    };
  }, [load]);

  const unread = notifications.filter((item) => !item.read).length;

  const openNotification = (notification: AppNotification) => {
    markNotificationRead(notification.id);
    load();
    setOpen(false);
  };

  const markAll = () => {
    markAllNotificationsRead(user.id, user.email);
    load();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) load();
      }}
    >
      <Popover.Trigger asChild>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          className={`relative grid ${className} place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-brand`}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell size={17} />
          {unread > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={reduceMotion ? { scale: 1 } : { scale: 1, y: [0, -2, 0] }}
              transition={{ y: { delay: 0.45, duration: 0.55 }, scale: { duration: 0.25 } }}
              className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          ) : null}
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content asChild align="end" sideOffset={10} collisionPadding={16}>
          <motion.section
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="z-[70] w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl outline-none"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <Popover.Arrow className="fill-white" />
                <p className="font-heading font-bold text-slate-950">Notifications</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You’re all caught up"}
                </p>
              </div>
              {unread > 0 ? (
                <button type="button" onClick={markAll} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-deep">
                  <CheckCheck size={14} /> Mark all read
                </button>
              ) : null}
            </header>

            <div className="warm-scrollbar max-h-[28rem] overflow-y-auto">
              {notifications.length ? (
                notifications.slice(0, 10).map((notification, index) => {
                  const Icon = icons[notification.type];
                  return (
                    <motion.div key={notification.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.04 }}>
                      <Link
                        href={href}
                        onClick={() => openNotification(notification)}
                        className={`group grid grid-cols-[40px_1fr] gap-3 border-b border-slate-100 px-5 py-4 hover:bg-slate-50 ${notification.read ? "" : "bg-blue-50/45"}`}
                      >
                        <span className={`grid size-10 place-items-center rounded-xl ${iconTones[notification.type] ?? "bg-blue-50 text-brand"}`}>
                          <Icon size={17} />
                        </span>
                        <span>
                          <span className="flex items-start justify-between gap-3">
                            <strong className="text-sm font-bold text-slate-900">{notification.title}</strong>
                            {!notification.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" /> : null}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{notification.message}</span>
                          <span className="mt-2 block text-[10px] font-medium text-slate-400">{formatTime(notification.createdAt)}</span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <motion.span animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }} className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Bell size={20} />
                  </motion.span>
                  <p className="mt-3 text-sm font-bold text-slate-900">No notifications yet</p>
                  <p className="mt-1 text-xs text-slate-500">Appointment updates will appear here.</p>
                </div>
              )}
            </div>
          </motion.section>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
