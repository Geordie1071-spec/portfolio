export const aboutRoles = [
  { id: "developer", label: "Developer", index: "01" },
  { id: "ai", label: "AI Student", index: "02" },
  { id: "designer", label: "Designer", index: "03" },
  { id: "personal", label: "Personal", index: "04" },
] as const;

export type AboutRoleId = (typeof aboutRoles)[number]["id"];

/** Approximate scroll progress (0–1) where each role becomes active. */
export const aboutRoleProgress: Record<AboutRoleId, number> = {
  developer: 0.28,
  ai: 0.52,
  designer: 0.76,
  personal: 0.92,
};

export const aboutCopy = {
  developer: {
    kicker: "01 — Developer",
    lines: [
      "I build full-stack applications,",
      "backend systems and interactive",
      "digital experiences.",
    ],
  },
  ai: {
    kicker: "02 — AI Student",
    lines: [
      "I'm studying artificial intelligence",
      "and exploring how data, software and",
      "machine learning work together.",
    ],
  },
  designer: {
    kicker: "03 — Designer",
    lines: [
      "I care about how software feels,",
      "not only how it works.",
    ],
  },
  personal: {
    kicker: "Away from the screen",
    lines: [
      "Competitive footballer.",
      "Regularly in the gym.",
      "Usually designing or building something.",
      "Based in Malta.",
    ],
  },
  summary: {
    name: "Geordie Ellis",
    roles: "Developer · AI Student · Designer",
    place: "Based in Malta",
  },
} as const;
