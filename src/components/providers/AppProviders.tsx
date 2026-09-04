"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={250} skipDelayDuration={100}>
      {children}
      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-slate-200 !bg-white/95 !font-sans !shadow-xl !backdrop-blur-xl",
            title: "!font-bold !text-slate-950",
            description: "!text-slate-500",
          },
        }}
      />
    </Tooltip.Provider>
  );
}
