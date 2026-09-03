"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { useEffect, type ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("schedula-theme");
    document.documentElement.dataset.theme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

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
