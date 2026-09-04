export type ChatRole = "user" | "assistant";

export type ChatTurn = {
  role: ChatRole;
  content: string;
};

export type ChatMessage = ChatTurn & {
  id: string;
  doctorIds?: string[];
  links?: ChatLink[];
  suggestedPrompts?: string[];
};

export type ChatAudience = "patient" | "doctor";

export type ChatLink = {
  label: string;
  href: string;
  description: string;
};
