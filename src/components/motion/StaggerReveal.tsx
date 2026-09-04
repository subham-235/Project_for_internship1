"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function StaggerReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -6%" }}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: reduceMotion ? 0 : 0.11 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", lift = true }: { children: ReactNode; className?: string; lift?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: 0.975, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } },
      }}
      whileHover={reduceMotion || !lift ? undefined : { y: -6, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
