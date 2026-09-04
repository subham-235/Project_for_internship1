"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BookingStatus } from "@/types/booking";
import { statusTheme } from "@/lib/theme";

export default function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const reduceMotion = useReducedMotion();
  const visual = statusTheme[status];

  return (
    <span className="inline-flex min-h-7 min-w-[5.75rem] items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          layout
          initial={{ opacity: 0, y: reduceMotion ? 0 : 5, scale: reduceMotion ? 1 : 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -4, scale: reduceMotion ? 1 : 0.96 }}
          transition={{ duration: 0.22 }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${visual.className}`}
          aria-label={`Appointment status: ${visual.label}`}
        >
          <motion.span
            className={`size-1.5 rounded-full ${visual.dot}`}
            animate={status === "pending" && !reduceMotion ? { opacity: [1, 0.4, 1] } : undefined}
            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
            aria-hidden="true"
          />
          {visual.label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
