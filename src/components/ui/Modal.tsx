"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.section
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={cn("fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none", className)}
              >
                <div className="pr-10">
                  <Dialog.Title className="font-heading text-xl font-bold text-slate-950">{title}</Dialog.Title>
                  {description ? <Dialog.Description className="mt-1.5 text-[15px] leading-relaxed text-slate-500">{description}</Dialog.Description> : null}
                </div>
                <Dialog.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95" aria-label="Close dialog">
                  <X className="size-4" />
                </Dialog.Close>
                <div className="mt-6">{children}</div>
              </motion.section>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
