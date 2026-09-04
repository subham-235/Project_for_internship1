"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type AnimatedSectionProps = HTMLMotionProps<"section"> & { delay?: number };

export default function AnimatedSection({ children, delay = 0, ...props }: AnimatedSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      data-motion-section="true"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 36, scale: reduceMotion ? 1 : 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -7%" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
