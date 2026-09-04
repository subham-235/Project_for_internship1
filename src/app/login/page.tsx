"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Stethoscope, UserRound } from "lucide-react";

import AuthVisual from "@/components/auth/AuthVisual";
import Navbar from "@/components/layout/Navbar";
import { getRegisteredUsers, saveCurrentUser } from "@/lib/client-storage";
import { users } from "@/lib/mock-data/users";

const inputClass = "w-full rounded-lg border border-[var(--line)] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)]/25";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must contain at least 6 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered") === "true");
  }, []);

  const submit = async ({ email, password }: LoginValues) => {
    clearErrors("root");
    const normalizedEmail = email.trim().toLowerCase();

    const user = [...users, ...getRegisteredUsers()].find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    );

    if (!user) {
      setError("root", { message: "Invalid email or password." });
      return;
    }

    await Promise.resolve();
    saveCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    router.push(user.role === "doctor" ? "/doctor-dashboard" : "/doctors");
  };

  const fillDemoCredentials = (type: "patient" | "doctor") => {
    setValue("email", type === "patient" ? "patient@schedula.com" : "anika@schedula.com", { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
    clearErrors();
  };

  return (
    <>
      <Navbar />
      <main className="bg-[var(--background)]">
        <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1440px] border-x border-[var(--line)] lg:grid-cols-[1.03fr_.97fr]">
          <AuthVisual mode="login" />

          <motion.section
            initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center bg-white px-5 py-12 sm:px-10 lg:px-12 xl:px-20"
          >
            <div className="mx-auto w-full max-w-md">
              <div className="mb-9 border-b border-[var(--line)] pb-8 lg:hidden">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]"><span className="size-2 bg-[var(--brand)]" /> Secure access</span>
                <p className="font-editorial mt-4 text-4xl leading-[0.95] tracking-[-0.055em]">Back to care,<br /><span className="text-[var(--brand)]">without friction.</span></p>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Sign in / Schedula</p>
              <h2 className="font-editorial mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">Welcome back.</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Access your appointments, confirmations and care documents.</p>

              <AnimatePresence mode="popLayout">
                {registered && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-6 flex gap-3 border-l-2 border-[var(--accent)] bg-[var(--background)] px-4 py-3 text-sm" role="status">
                    <Check size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                    <p><span className="font-semibold">Account created.</span> Sign in using your new credentials.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5" noValidate>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">Email address</span>
                  <span className="relative mt-2 block">
                    <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} className={`${inputClass} ${errors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`} placeholder="you@example.com" />
                  </span>
                  <AnimatePresence>{errors.email ? <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 block text-xs font-semibold text-rose-600">{errors.email.message}</motion.span> : null}</AnimatePresence>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">Password</span>
                  <span className="relative mt-2 block">
                    <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password")} aria-invalid={Boolean(errors.password)} className={`${inputClass} pr-11 ${errors.password ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`} placeholder="Minimum 6 characters" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-[var(--muted)] hover:text-[var(--foreground)]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                  <AnimatePresence>{errors.password ? <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 block text-xs font-semibold text-rose-600">{errors.password.message}</motion.span> : null}</AnimatePresence>
                </label>

                <AnimatePresence mode="wait">
                  {errors.root?.message && (
                    <motion.div key={errors.root.message} initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                      {errors.root.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }} disabled={isSubmitting} type="submit" className="group flex w-full items-center justify-between rounded-xl bg-[var(--brand)] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60">
                  <span>{isSubmitting ? "Signing in..." : "Sign in securely"}</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </form>

              <div className="mt-8">
                <div className="flex items-center gap-3"><span className="h-px flex-1 bg-[var(--line)]" /><span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Try a demo</span><span className="h-px flex-1 bg-[var(--line)]" /></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => fillDemoCredentials("patient")} className="group rounded-lg border border-[var(--line)] p-4 text-left hover:border-[var(--brand)] hover:bg-[var(--background)]">
                    <UserRound size={18} className="text-[var(--brand)]" /><span className="mt-3 block text-sm font-semibold">Patient demo</span><span className="mt-1 block truncate text-[11px] text-[var(--muted)]">patient@schedula.com</span>
                  </button>
                  <button type="button" onClick={() => fillDemoCredentials("doctor")} className="group rounded-lg border border-[var(--line)] p-4 text-left hover:border-[var(--brand)] hover:bg-[var(--background)]">
                    <Stethoscope size={18} className="text-[var(--brand)]" /><span className="mt-3 block text-sm font-semibold">Doctor demo</span><span className="mt-1 block truncate text-[11px] text-[var(--muted)]">anika@schedula.com</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-sm">
                <p className="text-[var(--muted)]">New to Schedula? <Link href="/signup" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">Create an account</Link></p>
                <Link href="/" className="text-xs font-semibold hover:text-[var(--brand)]">Back home</Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
