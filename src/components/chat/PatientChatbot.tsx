"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bot, CalendarCheck, MapPin, Send, Sparkles, Star, Trash2, X } from "lucide-react";
import { askSchedulaAssistant } from "@/app/actions/chat";
import { getCurrentUser, type StoredUser } from "@/lib/client-storage";
import { doctors } from "@/lib/mock-data/doctors";
import type { ChatAudience, ChatLink, ChatMessage, ChatTurn } from "@/types/chat";

const PATIENT_PROMPTS = [
  "Which doctor should I see for a skin problem?",
  "Help me find a doctor for recurring headaches",
  "How do I book an appointment?",
  "When should chest pain be treated as an emergency?",
];

const DOCTOR_PROMPTS = [
  "Show me where to manage today's appointments",
  "How do I add availability slots?",
  "Help me prepare a concise consultation checklist",
  "Where can I create a prescription?",
];

function welcomeFor(role: ChatAudience): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: role === "doctor"
      ? "Welcome, Doctor. I can help with your clinical workflow and guide you around appointments, availability, prescriptions, and your profile."
      : "Hi! Tell me what you need help with. I can suggest a suitable Schedula doctor, explain general health topics, and help with appointments.",
  };
};

function storageKey(userId: string) {
  return `schedula-care-chat:${userId}`;
}

function newMessage(role: ChatMessage["role"], content: string, doctorIds?: string[], links?: ChatLink[], suggestedPrompts?: string[]): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, content, doctorIds, links, suggestedPrompts };
}

function formatInlineMarkdown(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={`${part}-${index}`} className="font-bold text-[#0B1329]">{part.slice(2, -2)}</strong>
      : <span key={`${part}-${index}`}>{part}</span>,
  );
}

function ChatAnswer({ content }: { content: string }) {
  return <div className="space-y-2.5">{content.split("\n").map((line, index) => {
    const value = line.trim();
    if (!value) return <div key={`space-${index}`} className="h-1" aria-hidden="true" />;

    const heading = value.match(/^#{1,6}\s*(.+)$/);
    if (heading) return <p key={`heading-${index}`} className="pt-1 text-sm font-bold leading-5 text-[#0B1329]">{formatInlineMarkdown(heading[1])}</p>;

    const bullet = value.match(/^[-*]\s+(.+)$/);
    if (bullet) return <div key={`bullet-${index}`} className="flex gap-2 pl-1"><span className="mt-[0.58rem] size-1.5 shrink-0 rounded-full bg-[#2563eb]" /><p className="min-w-0 flex-1">{formatInlineMarkdown(bullet[1])}</p></div>;

    const numbered = value.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered) return <div key={`number-${index}`} className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563eb]">{numbered[1]}</span><p className="min-w-0 flex-1">{formatInlineMarkdown(numbered[2])}</p></div>;

    return <p key={`text-${index}`}>{formatInlineMarkdown(value)}</p>;
  })}</div>;
}

export default function PatientChatbot() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeFor("patient")]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const reduceMotion = useReducedMotion();
  const endRef = useRef<HTMLDivElement>(null);
  const activeUserIdRef = useRef<string | null>(null);
  const authSessionRef = useRef(0);

  useEffect(() => {
    const syncPatient = () => {
      authSessionRef.current += 1;
      const current = getCurrentUser();
      const previousUserId = activeUserIdRef.current;

      if (!current && previousUserId) {
        localStorage.removeItem(storageKey(previousUserId));
      }

      activeUserIdRef.current = current?.id ?? null;
      setUser(current);
      setOpen(false);

      if (!current) {
        setInput("");
        setSending(false);
        setMessages([welcomeFor("patient")]);
        return;
      }

      try {
        const saved = localStorage.getItem(storageKey(current.id));
        if (saved) {
          const parsed = JSON.parse(saved) as ChatMessage[];
          setMessages(Array.isArray(parsed) && parsed.length ? parsed.slice(-30) : [welcomeFor(current.role)]);
        } else {
          setMessages([welcomeFor(current.role)]);
        }
      } catch {
        localStorage.removeItem(storageKey(current.id));
        setMessages([welcomeFor(current.role)]);
      }
    };

    syncPatient();
    window.addEventListener("schedula-auth-change", syncPatient);
    window.addEventListener("storage", syncPatient);
    return () => {
      window.removeEventListener("schedula-auth-change", syncPatient);
      window.removeEventListener("storage", syncPatient);
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(storageKey(user.id), JSON.stringify(messages.slice(-30)));
    if (open) endRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, open, reduceMotion, user]);

  if (!user) return null;

  const audience: ChatAudience = user.role;
  const prompts = audience === "doctor" ? DOCTOR_PROMPTS : PATIENT_PROMPTS;

  const submitQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || sending) return;
    const requestSession = authSessionRef.current;

    const history: ChatTurn[] = messages
      .filter((item) => item.id !== "welcome")
      .map(({ role, content }) => ({ role, content }));
    const outgoing = newMessage("user", question);
    setMessages((current) => [...current, outgoing]);
    setInput("");
    setSending(true);

    const result = await askSchedulaAssistant(history, question, audience);
    if (authSessionRef.current !== requestSession) return;
    setMessages((current) => [
      ...current,
      newMessage("assistant", result.ok ? result.answer : result.error, result.doctorIds, result.links, result.suggestedPrompts),
    ]);
    setSending(false);
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion(input);
  };

  const clearHistory = () => {
    setMessages([welcomeFor(audience)]);
    localStorage.removeItem(storageKey(user.id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Schedula care assistant"
            className="absolute bottom-[4.75rem] right-0 flex h-[min(38rem,calc(100vh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_28px_90px_rgba(11,19,41,0.24)]"
          >
            <header className="flex items-center justify-between gap-4 bg-[#0B1329] px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="relative grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329]"><Bot size={21} /><i className="absolute right-1 top-1 size-1.5 rounded-full bg-[#2E9B57] ring-2 ring-[#dbeafe]" /></span>
                <div><p className="text-sm font-bold">{audience === "doctor" ? "Clinical Workspace AI" : "Schedula Care AI"}</p><p className="mt-0.5 text-[10px] text-white/55">{audience === "doctor" ? "Clinical workflow &bull; dashboard guidance" : "Doctors &bull; appointments &bull; general health"}</p></div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={clearHistory} aria-label="Clear chat history" className="grid size-8 place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"><Trash2 size={15} /></button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-8 place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"><X size={17} /></button>
              </div>
            </header>

            <div className="warm-scrollbar flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] px-4 py-5" aria-live="polite">
              {messages.map((message, messageIndex) => {
                const recommendedDoctors = (message.doctorIds ?? []).map((id) => doctors.find((doctor) => doctor.id === id)).filter((doctor) => Boolean(doctor));
                const isLatestMessage = messageIndex === messages.length - 1;
                return <motion.div key={message.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[92%] ${message.role === "user" ? "rounded-2xl rounded-br-md bg-[#2563eb] px-3.5 py-3 text-white" : "space-y-3"}`}>
                    <div className={`text-sm leading-6 ${message.role === "assistant" ? "rounded-2xl rounded-bl-md border border-[#E2E8F0] bg-white px-3.5 py-3 text-[#334155] shadow-sm" : ""}`}>{message.role === "assistant" ? <ChatAnswer content={message.content} /> : message.content}</div>
                    {recommendedDoctors.map((doctor) => doctor && (
                      <article key={doctor.id} className="overflow-hidden rounded-2xl border border-[#D7E3F4] bg-white shadow-sm">
                        <div className="flex gap-3 p-3">
                          <Image src={doctor.image ?? "/logo.svg"} alt={doctor.name} width={56} height={56} className="size-14 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#0B1329]">{doctor.name}</p><p className="text-xs font-semibold text-[#2563eb]">{doctor.specialty}</p><div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#64748B]"><span className="inline-flex items-center gap-1"><Star size={11} fill="currentColor" className="text-amber-500" />{doctor.rating} ({doctor.reviews})</span><span className="inline-flex items-center gap-1"><MapPin size={11} />{doctor.location}</span></div></div>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"><div><p className="text-[10px] text-[#64748B]">Consultation fee</p><p className="text-xs font-bold text-[#0B1329]">₹{doctor.fee}</p></div><Link href={`/booking/${doctor.id}`} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-3 py-2 text-xs font-bold text-white hover:bg-[#0B1329]"><CalendarCheck size={14} /> Book now</Link></div>
                      </article>
                    ))}
                    {(message.links ?? []).map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl border border-[#D7E3F4] bg-white p-3 shadow-sm hover:border-[#2563eb]"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#DBEAFE] text-[#2563eb]"><ArrowRight size={16} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[#0B1329]">{link.label}</span><span className="block truncate text-[10px] text-[#64748B]">{link.description}</span></span><ArrowRight size={14} className="text-[#94A3B8] transition group-hover:translate-x-0.5" /></Link>)}
                    {message.role === "assistant" && isLatestMessage && (message.suggestedPrompts?.length ?? 0) > 0 && <div className="pt-1"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">You may also ask</p><div className="flex flex-wrap gap-2">{message.suggestedPrompts?.map((prompt) => <button key={prompt} type="button" disabled={sending} onClick={() => void submitQuestion(prompt)} className="rounded-xl border border-[#D7E3F4] bg-white px-3 py-2 text-left text-xs leading-5 text-[#334155] shadow-sm hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50">{prompt}</button>)}</div></div>}
                  </div>
                </motion.div>;
              })}
              {messages.length === 1 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Try asking</p><div className="flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => void submitQuestion(prompt)} className="rounded-xl border border-[#D7E3F4] bg-white px-3 py-2 text-left text-xs leading-5 text-[#334155] shadow-sm hover:border-[#2563eb] hover:text-[#2563eb]">{prompt}</button>)}</div></div>}
              {sending && <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#E2E8F0] bg-white px-4 py-3"><i className="size-1.5 animate-bounce rounded-full bg-[#2563eb]" /><i className="size-1.5 animate-bounce rounded-full bg-[#D96B32] [animation-delay:120ms]" /><i className="size-1.5 animate-bounce rounded-full bg-[#64748B] [animation-delay:240ms]" /></div></div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t border-[#E2E8F0] bg-white p-3">
              <div className="flex items-end gap-2 rounded-2xl bg-[#F8FAFC] p-2">
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={1200} placeholder={audience === "doctor" ? "Ask about your clinical workspace..." : "Ask about doctors or your health..."} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#64748B]" />
                <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#2563eb] text-white hover:bg-[#C9362D] disabled:cursor-not-allowed disabled:opacity-45"><Send size={17} /></button>
              </div>
              <p className="mt-2 text-center text-[9px] leading-4 text-[#64748B]">{audience === "doctor" ? "Workflow support only. Use clinical judgment and local protocols." : "General guidance only. Not a diagnosis or emergency service."}</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={reduceMotion ? undefined : { y: -4, rotate: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        aria-label={open ? "Close Schedula care assistant" : "Open Schedula care assistant"}
        className="group relative grid size-16 place-items-center rounded-[22px] bg-[#0B1329] text-white shadow-[0_18px_45px_rgba(11,19,41,0.3)]"
      >
        {!open && <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute inset-0 rounded-[22px] border border-[#2563eb]" />}
        <span className="absolute -top-1.5 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#dbeafe]" />
        <span className="absolute -top-2.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#2563eb]" />
        {open ? <X size={24} /> : <Bot size={27} className="transition-transform group-hover:scale-110" />}
        {!open && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-[#2563eb] text-white ring-2 ring-[#F8FAFC]"><Sparkles size={12} /></span>}
      </motion.button>
    </div>
  );
}
