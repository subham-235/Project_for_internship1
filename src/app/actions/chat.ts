"use server";
import Groq from "groq-sdk";
import { SCHEDULA_DOCTOR_CHAT_SYSTEM_INSTRUCTION, SCHEDULA_CHAT_SYSTEM_INSTRUCTION, } from "@/lib/chat-system-instruction";
import { doctors } from "@/lib/mock-data/doctors";
import type { ChatAudience, ChatLink, ChatTurn } from "@/types/chat";
const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_LENGTH = 1200;
const specialtySignals: Array<{
    specialty: string;
    terms: string[];
}> = [
    {
        specialty: "Dermatology",
        terms: [
            "skin",
            "rash",
            "acne",
            "hair loss",
            "itch",
            "pigmentation",
            "eczema",
        ],
    },
    {
        specialty: "Cardiology",
        terms: [
            "heart",
            "chest pain",
            "blood pressure",
            "palpitation",
            "cholesterol",
            "cardiac",
        ],
    },
    {
        specialty: "Orthopedics",
        terms: [
            "bone",
            "joint",
            "knee",
            "back pain",
            "fracture",
            "sprain",
            "shoulder",
            "sports injury",
        ],
    },
    {
        specialty: "Pediatrics",
        terms: [
            "child",
            "baby",
            "infant",
            "kid",
            "pediatric",
            "growth",
            "vaccination",
        ],
    },
    {
        specialty: "Neurology",
        terms: [
            "migraine",
            "headache",
            "seizure",
            "nerve",
            "numbness",
            "tingling",
            "dizziness",
            "neurolog",
        ],
    },
    {
        specialty: "General Medicine",
        terms: [
            "fever",
            "cold",
            "cough",
            "fatigue",
            "weakness",
            "infection",
            "general physician",
            "checkup",
        ],
    },
];
function getDoctorRecommendations(question: string, audience: ChatAudience) {
    if (audience !== "patient")
        return [];
    const normalized = question.toLowerCase();
    const emergencySignal = /severe chest pain|trouble breathing|difficulty breathing|stroke|unconscious|severe bleeding|self[- ]harm|suicid/.test(normalized);
    if (emergencySignal)
        return [];
    const matchedSpecialty = specialtySignals.find(({ specialty, terms }) => normalized.includes(specialty.toLowerCase()) ||
        terms.some((term) => normalized.includes(term)))?.specialty;
    const recommendationIntent = /which doctor|find (?:me )?a doctor|good doctor|specialist|recommend|suggest|who should i (?:see|consult)/i.test(question);
    if (!matchedSpecialty && !recommendationIntent)
        return [];
    const candidates = matchedSpecialty
        ? doctors.filter((doctor) => doctor.specialty === matchedSpecialty)
        : doctors.filter((doctor) => doctor.specialty === "General Medicine");
    return candidates
        .sort((first, second) => second.rating - first.rating || second.reviews - first.reviews)
        .slice(0, 3)
        .map((doctor) => doctor.id);
}
function getNavigationLinks(question: string, audience: ChatAudience): ChatLink[] {
    const normalized = question.toLowerCase();
    const links: ChatLink[] = [];
    const add = (label: string, href: string, description: string) => links.push({ label, href, description });
    if (audience === "patient") {
        if (/find|browse|doctor|specialist|book/.test(normalized))
            add("Browse doctors", "/doctors", "Compare Schedula doctors and available specialties");
        if (/my appointment|status|reschedul|cancel|upcoming|confirmation/.test(normalized))
            add("My appointments", "/my-appointments", "Review and manage your appointments");
        if (/my profile|health profile|medical profile/.test(normalized))
            add("Open profile", "/profile", "Review your saved patient information");
        return links.slice(0, 2);
    }
    if (/appointment|patient|request|confirm|reschedul|cancel/.test(normalized))
        add("Open appointments", "/doctor-dashboard/appointments", "Review patient requests and upcoming visits");
    if (/calendar|slot|availability|schedule/.test(normalized))
        add("Open calendar", "/doctor-dashboard/calendar", "Manage availability and appointment slots");
    if (/prescri|medicine|medication/.test(normalized))
        add("Open prescriptions", "/doctor-dashboard/prescriptions", "Review and create patient prescriptions");
    if (/profile|fee|bio|qualification|language/.test(normalized))
        add("Open profile", "/doctor-dashboard/profile", "Update your public doctor information");
    if (!links.length && /dashboard|overview|where|navigate/.test(normalized))
        add("Open overview", "/doctor-dashboard", "Return to your clinical dashboard");
    return links.slice(0, 2);
}
function getSuggestedPrompts(question: string, audience: ChatAudience): string[] {
    const normalized = question.toLowerCase();
    if (audience === "doctor") {
        if (/appointment|patient|request|confirm|reschedul|cancel/.test(normalized)) {
            return [
                "How should I prepare for my next consultation?",
                "Where can I manage my availability?",
                "Help me write clear visit notes",
            ];
        }
        if (/calendar|slot|availability|schedule/.test(normalized)) {
            return [
                "Where can I review appointment requests?",
                "How should I organize follow-up slots?",
                "Open my doctor profile options",
            ];
        }
        if (/prescri|medicine|medication/.test(normalized)) {
            return [
                "What should clear patient instructions include?",
                "Where can I review appointments?",
                "Help me make a consultation checklist",
            ];
        }
        return [
            "Show me today's appointment workflow",
            "How do I manage availability?",
            "Where can I create a prescription?",
        ];
    }
    const specialty = specialtySignals.find(({ specialty: name, terms }) => normalized.includes(name.toLowerCase()) ||
        terms.some((term) => normalized.includes(term)))?.specialty;
    if (specialty) {
        return [
            `Show me ${specialty} doctors`,
            "How should I prepare for the appointment?",
            "What symptoms should need urgent care?",
        ];
    }
    if (/appointment|book|reschedul|cancel|confirmation/.test(normalized)) {
        return [
            "Help me find the right doctor",
            "Where can I see my appointments?",
            "How should I prepare for my visit?",
        ];
    }
    return [
        "Which specialist should I consult?",
        "Help me find a doctor",
        "When should I seek urgent medical care?",
    ];
}
function cleanTurn(turn: ChatTurn): ChatTurn | null {
    if ((turn.role !== "user" && turn.role !== "assistant") ||
        typeof turn.content !== "string") {
        return null;
    }
    const content = turn.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    return content
        ? {
            role: turn.role,
            content,
        }
        : null;
}
export async function askSchedulaAssistant(history: ChatTurn[], message: string, audience: ChatAudience = "patient") {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const question = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    const safeAudience: ChatAudience = audience === "doctor" ? "doctor" : "patient";
    const doctorIds = getDoctorRecommendations(question, safeAudience);
    const links = getNavigationLinks(question, safeAudience);
    const suggestedPrompts = getSuggestedPrompts(question, safeAudience);
    if (!question) {
        return {
            ok: false as const,
            error: "Please enter a question.",
            doctorIds: [],
            links: [],
            suggestedPrompts: [],
        };
    }
    if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
        return {
            ok: false as const,
            error: "The chatbot is not configured yet. Add GROQ_API_KEY to .env.local and restart the development server.",
            doctorIds,
            links,
            suggestedPrompts,
        };
    }
    const safeHistory = history
        .slice(-MAX_HISTORY_TURNS)
        .map(cleanTurn)
        .filter((turn): turn is ChatTurn => Boolean(turn));
    const groq = new Groq({
        apiKey,
    });
    try {
        const response = await groq.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: safeAudience === "doctor"
                        ? SCHEDULA_DOCTOR_CHAT_SYSTEM_INSTRUCTION
                        : SCHEDULA_CHAT_SYSTEM_INSTRUCTION,
                },
                ...safeHistory.map((turn) => ({
                    role: turn.role === "assistant"
                        ? ("assistant" as const)
                        : ("user" as const),
                    content: turn.content,
                })),
                {
                    role: "user",
                    content: question,
                },
            ],
            temperature: 0.25,
            max_completion_tokens: 650,
            n: 1,
            stream: false,
        });
        const answer = response.choices?.[0]?.message?.content?.trim();
        if (!answer) {
            throw new Error("Groq returned an empty response.");
        }
        return {
            ok: true as const,
            answer,
            doctorIds,
            links,
            suggestedPrompts,
        };
    }
    catch (error) {
        console.error("Schedula Groq request failed:", error);
        return {
            ok: false as const,
            error: "The care assistant is temporarily unavailable. Please try again in a moment.",
            doctorIds,
            links,
            suggestedPrompts,
        };
    }
}
