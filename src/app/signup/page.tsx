"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowRight, Stethoscope, UserRound } from "lucide-react";

import AuthVisual from "@/components/auth/AuthVisual";
import Navbar from "@/components/layout/Navbar";
import { getRegisteredUsers, saveRegisteredDoctor, saveRegisteredUser } from "@/lib/client-storage";
import { specialties } from "@/lib/mock-data/doctors";
import { users } from "@/lib/mock-data/users";
import type { Doctor } from "@/types/doctor";
import type { User, UserRole } from "@/types/user";

const fieldClass = "mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)]/25";
const labelClass = "text-xs font-semibold uppercase tracking-[0.09em] text-[var(--foreground)]";

const signupSchema = z.object({
  role: z.enum(["patient", "doctor"]),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string(),
  password: z.string().min(6, "Password must contain at least 6 characters."),
  confirmPassword: z.string(),
  specialty: z.string(),
  registrationNumber: z.string(),
  qualification: z.string(),
  experience: z.string(),
  location: z.string(),
  fee: z.string(),
  languages: z.string(),
  bio: z.string(),
  image: z.string(),
}).superRefine((values, context) => {
  if (values.password !== values.confirmPassword) {
    context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
  }
  if (values.role !== "doctor") return;
  const doctorFields: Array<[keyof typeof values, boolean, string]> = [
    ["phone", /^\d{10}$/.test(values.phone.replace(/\D/g, "")), "Please enter a valid 10-digit phone number."],
    ["specialty", Boolean(values.specialty), "Please select your medical specialty."],
    ["registrationNumber", Boolean(values.registrationNumber.trim()), "Please enter your medical registration number."],
    ["qualification", Boolean(values.qualification.trim()), "Please enter your qualification."],
    ["experience", values.experience !== "" && Number(values.experience) >= 0, "Please enter valid years of experience."],
    ["location", Boolean(values.location.trim()), "Please enter your clinic location."],
    ["fee", Boolean(values.fee) && Number(values.fee) > 0, "Please enter a valid consultation fee."],
    ["bio", Boolean(values.bio.trim()), "Please add a short professional bio."],
  ];
  doctorFields.forEach(([path, valid, message]) => {
    if (!valid) context.addIssue({ code: "custom", path: [path], message });
  });
  if (values.image && !URL.canParse(values.image)) {
    context.addIssue({ code: "custom", path: ["image"], message: "Please enter a valid image URL." });
  }
});

type SignupValues = z.infer<typeof signupSchema>;

function createSignupId(role: UserRole) {
  return `${role === "doctor" ? "doc" : "patient"}-${Date.now()}`;
}

export default function SignupPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "patient",
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      specialty: "",
      registrationNumber: "",
      qualification: "",
      experience: "",
      location: "",
      fee: "",
      languages: "English",
      bio: "",
      image: "",
    },
  });
  const role = useWatch({ control, name: "role" });
  const error = errors.root?.message ?? Object.values(errors).find((item) => item?.message)?.message ?? "";

  const generateInitials = (value: string) => value
    .split(" ")
    .filter(Boolean)
    .filter((part) => part.toLowerCase() !== "dr.")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const submit = async (values: SignupValues) => {
    clearErrors("root");
    const normalizedEmail = values.email.trim().toLowerCase();

    if ([...users, ...getRegisteredUsers()].some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setError("root", { message: "An account with this email already exists." });
      return;
    }

    const newId = createSignupId(role);
    const newUser: User = {
      id: newId,
      name: values.name.trim(),
      email: normalizedEmail,
      password: values.password,
      role,
      ...(role === "doctor" ? { specialty: values.specialty, registrationNumber: values.registrationNumber.trim() } : {}),
    };

    await Promise.resolve();
    saveRegisteredUser(newUser);

    if (role === "doctor") {
      const doctorProfile: Doctor = {
        id: newId,
        userId: newId,
        name: values.name.trim(),
        initials: generateInitials(values.name),
        image: values.image.trim() || undefined,
        email: normalizedEmail,
        phone: values.phone.replace(/\D/g, ""),
        registrationNumber: values.registrationNumber.trim(),
        specialty: values.specialty,
        experience: Number(values.experience),
        rating: 0,
        reviews: 0,
        location: values.location.trim(),
        fee: Number(values.fee),
        availability: "No slots published yet",
        bio: values.bio.trim(),
        education: [values.qualification.trim()],
        languages: values.languages.split(",").map((item) => item.trim()).filter(Boolean),
        slots: [],
      };
      saveRegisteredDoctor(doctorProfile);
    }

    router.push("/login?registered=true");
  };

  const changeRole = (newRole: UserRole) => {
    setValue("role", newRole, { shouldValidate: true });
    clearErrors();
  };

  return (
    <>
      <Navbar />
      <main className="bg-[var(--background)]">
        <div className="mx-auto grid max-w-[1440px] border-x border-[var(--line)] lg:grid-cols-[.86fr_1.14fr]">
          <div className="hidden self-start lg:sticky lg:top-[68px] lg:block lg:h-[calc(100vh-68px)]">
            <AuthVisual mode="signup" />
          </div>

          <motion.section
            initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white px-5 py-12 sm:px-10 lg:px-12 xl:px-20"
          >
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-9 border-b border-[var(--line)] pb-8 lg:hidden">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]"><span className="size-2 bg-[var(--brand)]" /> Join Schedula</span>
                <p className="font-editorial mt-4 text-4xl leading-[0.95] tracking-[-0.055em]">One account.<br /><span className="text-[var(--brand)]">Every step of care.</span></p>
              </div>

              <div className="flex items-end justify-between gap-5 border-b border-[var(--line)] pb-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Create account / 01</p>
                  <h1 className="font-editorial mt-3 text-4xl tracking-[-0.05em] sm:text-5xl">Start with your role.</h1>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Choose how you will use Schedula. You can complete your profile below.</p>
                </div>
                <span className="hidden font-editorial text-5xl tracking-[-0.06em] text-[var(--line)] sm:block">01</span>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                {([
                  { value: "patient" as const, title: "Patient", note: "Find and book doctors", icon: UserRound },
                  { value: "doctor" as const, title: "Doctor", note: "Manage appointments", icon: Stethoscope },
                ]).map(({ value, title, note, icon: Icon }) => {
                  const selected = role === value;
                  return (
                    <button key={value} type="button" role="radio" aria-checked={selected} onClick={() => changeRole(value)} className={`relative overflow-hidden rounded-lg border p-4 text-left transition sm:p-5 ${selected ? "border-[var(--brand)]" : "border-[var(--line)] hover:border-[var(--muted)]"}`}>
                      {selected && <motion.span layoutId="signup-role" className="absolute inset-0 bg-[var(--background)]" transition={{ type: "spring", stiffness: 350, damping: 34 }} />}
                      <span className="relative flex items-start justify-between gap-3"><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-[var(--muted)]">{note}</span></span><span className={`grid size-9 place-items-center rounded-lg ${selected ? "bg-[var(--brand)] text-white" : "bg-[var(--background)] text-[var(--muted)]"}`}><Icon size={18} /></span></span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit(submit)} className="mt-9 space-y-10" noValidate>
                <section className="border-t border-[var(--line)] pt-7">
                  <div className="flex items-center justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">02 / Identity</p><h2 className="mt-1 text-lg font-semibold">Personal information</h2></div><span className="text-xs text-[var(--muted)]">Required fields</span></div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label><span className={labelClass}>Full name</span><input {...register("name")} aria-invalid={Boolean(errors.name)} placeholder={role === "doctor" ? "Dr. John Doe" : "John Doe"} autoComplete="name" className={`${fieldClass} ${errors.name ? "border-rose-400" : ""}`} /></label>
                    <label><span className={labelClass}>Email address</span><input type="email" {...register("email")} aria-invalid={Boolean(errors.email)} placeholder="you@example.com" autoComplete="email" className={`${fieldClass} ${errors.email ? "border-rose-400" : ""}`} /></label>
                  </div>
                </section>

                <AnimatePresence initial={false}>
                  {role === "doctor" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <div className="space-y-10">
                        <section className="border-t border-[var(--line)] pt-7">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">03 / Practice</p>
                          <h2 className="mt-1 text-lg font-semibold">Contact details</h2>
                          <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <label><span className={labelClass}>Phone number</span><input {...register("phone")} aria-invalid={Boolean(errors.phone)} placeholder="9876543210" inputMode="tel" autoComplete="tel" className={`${fieldClass} ${errors.phone ? "border-rose-400" : ""}`} /></label>
                            <label><span className={labelClass}>Clinic location</span><input {...register("location")} aria-invalid={Boolean(errors.location)} placeholder="Salt Lake, Kolkata" autoComplete="street-address" className={`${fieldClass} ${errors.location ? "border-rose-400" : ""}`} /></label>
                          </div>
                        </section>

                        <section className="border-t border-[var(--line)] pt-7">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">04 / Credentials</p>
                          <h2 className="mt-1 text-lg font-semibold">Professional details</h2>
                          <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <label><span className={labelClass}>Specialty</span><select {...register("specialty")} aria-invalid={Boolean(errors.specialty)} className={`${fieldClass} ${errors.specialty ? "border-rose-400" : ""}`}><option value="">Select specialty</option>{specialties.filter((item) => item !== "All").map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                            <label><span className={labelClass}>Registration number</span><input {...register("registrationNumber")} aria-invalid={Boolean(errors.registrationNumber)} placeholder="WBMC-12345" className={`${fieldClass} ${errors.registrationNumber ? "border-rose-400" : ""}`} /></label>
                            <label><span className={labelClass}>Qualification</span><input {...register("qualification")} aria-invalid={Boolean(errors.qualification)} placeholder="MBBS, MD" className={`${fieldClass} ${errors.qualification ? "border-rose-400" : ""}`} /></label>
                            <label><span className={labelClass}>Years of experience</span><input type="number" min="0" {...register("experience")} aria-invalid={Boolean(errors.experience)} placeholder="5" className={`${fieldClass} ${errors.experience ? "border-rose-400" : ""}`} /></label>
                            <label><span className={labelClass}>Consultation fee</span><input type="number" min="1" {...register("fee")} aria-invalid={Boolean(errors.fee)} placeholder="700" className={`${fieldClass} ${errors.fee ? "border-rose-400" : ""}`} /></label>
                            <label><span className={labelClass}>Languages</span><input {...register("languages")} placeholder="English, Bengali, Hindi" className={fieldClass} /></label>
                            <label className="sm:col-span-2"><span className={labelClass}>Profile image URL <span className="normal-case tracking-normal text-[var(--muted)]">(optional)</span></span><input type="url" {...register("image")} aria-invalid={Boolean(errors.image)} placeholder="https://example.com/profile.jpg" className={`${fieldClass} ${errors.image ? "border-rose-400" : ""}`} /></label>
                            <label className="sm:col-span-2"><span className={labelClass}>Professional bio</span><textarea rows={4} {...register("bio")} aria-invalid={Boolean(errors.bio)} placeholder="Tell patients about your experience and practice." className={`${fieldClass} resize-none ${errors.bio ? "border-rose-400" : ""}`} /></label>
                          </div>
                        </section>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <section className="border-t border-[var(--line)] pt-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">{role === "doctor" ? "05" : "03"} / Security</p>
                  <h2 className="mt-1 text-lg font-semibold">Protect your account</h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label><span className={labelClass}>Password</span><input type="password" {...register("password")} aria-invalid={Boolean(errors.password)} autoComplete="new-password" placeholder="At least 6 characters" className={`${fieldClass} ${errors.password ? "border-rose-400" : ""}`} /></label>
                    <label><span className={labelClass}>Confirm password</span><input type="password" {...register("confirmPassword")} aria-invalid={Boolean(errors.confirmPassword)} autoComplete="new-password" placeholder="Repeat password" className={`${fieldClass} ${errors.confirmPassword ? "border-rose-400" : ""}`} /></label>
                  </div>
                </section>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div key={error} initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="alert" className="flex gap-3 border-l-2 border-[var(--brand)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--brand-deep)]">
                      <AlertCircle size={17} className="mt-0.5 shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }} type="submit" disabled={isSubmitting} className="group flex w-full items-center justify-between rounded-xl bg-[var(--brand)] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60">
                  <span>{isSubmitting ? "Creating account..." : `Create ${role} account`}</span><ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </form>

              <p className="mt-8 border-t border-[var(--line)] pt-7 text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">Sign in</Link></p>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
