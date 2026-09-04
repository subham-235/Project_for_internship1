export type IntakeQuestion = {
  id: string;
  label: string;
  help?: string;
  type: "text" | "textarea" | "select" | "yesno";
  required?: boolean;
  options?: string[];
};

export type IntakeTemplate = {
  title: string;
  description: string;
  questions: IntakeQuestion[];
};

const templates: Array<{ match: string[]; template: IntakeTemplate }> = [
  {
    match: ["cardiology", "cardiac", "heart"],
    template: {
      title: "Heart health intake",
      description: "Help the cardiologist understand your symptoms and recent cardiovascular readings.",
      questions: [
        { id: "chest_discomfort", label: "Are you currently experiencing chest pain or pressure?", type: "yesno", required: true },
        { id: "breathlessness", label: "When do you experience breathlessness?", type: "select", options: ["Never", "At rest", "During light activity", "During strenuous activity"], required: true },
        { id: "recent_bp", label: "Most recent blood-pressure reading", help: "For example: 120/80. Enter Not known if unavailable.", type: "text", required: true },
        { id: "cardiac_history", label: "Previous heart tests, procedures or family history", type: "textarea" },
      ],
    },
  },
  {
    match: ["dermatology", "skin"],
    template: {
      title: "Skin and hair intake",
      description: "Describe the affected area and anything that may have triggered the condition.",
      questions: [
        { id: "affected_area", label: "Which area is affected?", type: "text", required: true },
        { id: "skin_sensation", label: "What are you experiencing?", type: "select", options: ["Itching", "Pain or burning", "Swelling", "Discolouration", "Hair loss", "Other"], required: true },
        { id: "spreading", label: "Is the condition spreading or changing quickly?", type: "yesno", required: true },
        { id: "new_products", label: "Recent products, medicines, foods or environmental exposure", type: "textarea" },
      ],
    },
  },
  {
    match: ["orthopedic", "orthopaedic", "bone", "joint"],
    template: {
      title: "Bone and joint intake",
      description: "Share how the pain or injury affects your movement and daily activity.",
      questions: [
        { id: "body_area", label: "Which body part or joint is affected?", type: "text", required: true },
        { id: "injury_related", label: "Did this begin after an injury or fall?", type: "yesno", required: true },
        { id: "mobility", label: "How is your movement affected?", type: "select", options: ["No limitation", "Some limitation", "Difficult to walk or use limb", "Unable to bear weight or move"], required: true },
        { id: "swelling", label: "Describe swelling, stiffness, numbness or weakness", type: "textarea" },
      ],
    },
  },
  {
    match: ["pediatric", "paediatric", "child"],
    template: {
      title: "Child health intake",
      description: "Provide the child’s current symptoms and key observations for the paediatrician.",
      questions: [
        { id: "child_weight", label: "Child’s approximate weight", help: "Include kg where possible.", type: "text", required: true },
        { id: "temperature", label: "Most recent temperature", help: "Enter Not measured if unavailable.", type: "text", required: true },
        { id: "fluids", label: "Is the child eating and drinking normally?", type: "yesno", required: true },
        { id: "vaccinations", label: "Are routine vaccinations up to date?", type: "yesno", required: true },
      ],
    },
  },
  {
    match: ["neurology", "neuro"],
    template: {
      title: "Neurology intake",
      description: "Describe the pattern, onset and functional impact of the neurological symptoms.",
      questions: [
        { id: "neurological_symptom", label: "Primary symptom", type: "select", options: ["Headache or migraine", "Dizziness", "Numbness or tingling", "Weakness", "Tremor", "Memory or concentration", "Other"], required: true },
        { id: "sudden_onset", label: "Did the symptom begin suddenly?", type: "yesno", required: true },
        { id: "consciousness", label: "Was there fainting, seizure or loss of consciousness?", type: "yesno", required: true },
        { id: "triggers", label: "Known triggers and previous similar episodes", type: "textarea" },
      ],
    },
  },
];

const generalTemplate: IntakeTemplate = {
  title: "General medical intake",
  description: "Give the doctor a focused summary before your consultation.",
  questions: [
    { id: "temperature", label: "Most recent temperature", help: "Enter Not measured if unavailable.", type: "text", required: true },
    { id: "other_symptoms", label: "Other symptoms you are experiencing", type: "textarea", required: true },
    { id: "previous_treatment", label: "Have you tried any medicine or treatment for this concern?", type: "textarea" },
    { id: "recent_exposure", label: "Recent travel, illness exposure or major lifestyle change", type: "textarea" },
  ],
};

export function getSpecialtyIntakeTemplate(specialty: string): IntakeTemplate {
  const normalized = specialty.trim().toLowerCase();
  return templates.find(({ match }) => match.some((term) => normalized.includes(term)))?.template ?? generalTemplate;
}
