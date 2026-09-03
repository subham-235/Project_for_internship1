"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ScrollProgress from "@/components/motion/ScrollProgress";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AppMotionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;

      const pageTitle = rootRef.current.querySelectorAll("main h1");
      const pageCards = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>("main article"),
      ).slice(0, 18);
      const pageSections = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(
          'main section:not([data-motion-section="true"])',
        ),
      ).slice(1);

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (pageTitle.length) {
        intro.fromTo(
          pageTitle,
          { autoAlpha: 0, y: 24, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.72, clearProps: "filter" },
          0.08,
        );
      }
      if (pageCards.length) {
        intro.fromTo(
          pageCards,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.035 },
          0.18,
        );
      }

      pageSections.forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [pathname, reduceMotion], revertOnUpdate: true },
  );

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      <ScrollProgress />
      <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col">
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 32, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none fixed -left-40 top-24 -z-10 size-[28rem] rounded-full bg-blue-300/10 blur-3xl"
        />
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { x: [0, -55, 0], y: [0, -24, 0], scale: [1.08, 0.96, 1.08] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none fixed -right-44 top-[42%] -z-10 size-[32rem] rounded-full bg-sky-300/10 blur-3xl"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.997 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.998 }}
            transition={{ duration: reduceMotion ? 0 : 0.38 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
