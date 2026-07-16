import { tools, type Tool } from "./tools";

export const aboutIntro = {
  label: "01 / About",
  title: "More than just code.",
  paragraphs: [
    "I'm a software developer and AI student based in Malta. I build full-stack applications, backend services and data-driven products — with equal attention to how software works and how it feels to use.",
    "I mainly work with TypeScript, React, Next.js, Go and Python, taking projects from early interface design through backend architecture and deployment.",
  ],
};

export const capabilities = [
  {
    title: "Full-Stack Development",
    body: "Responsive interfaces, APIs, authentication, databases and deployment.",
  },
  {
    title: "Backend and AI",
    body: "Go/Python services, data processing, machine-learning integration and automation.",
  },
  {
    title: "Product and Web Design",
    body: "Wireframes, interface systems, prototyping and interaction design.",
  },
];

export type StackGroup = {
  title: string;
  tools: Tool[];
};

const bySlug = Object.fromEntries(tools.map((t) => [t.slug, t])) as Record<string, Tool>;

export const stackGroups: StackGroup[] = [
  {
    title: "Languages & Frameworks",
    tools: [bySlug.typescript, bySlug.react, bySlug.nextdotjs, bySlug.go, bySlug.python],
  },
  {
    title: "Backend & Data",
    tools: [bySlug.postgresql, bySlug.supabase, bySlug.docker],
  },
  {
    title: "Design & Workflow",
    tools: [bySlug.figma, bySlug.github, bySlug.claude],
  },
];

export const experience = [
  {
    period: "2026–Present",
    title: "B.Sc. Artificial Intelligence",
    detail: "University of Malta",
  },
  {
    period: "2025–Present",
    title: "Independent Software Developer",
    detail: "Full-stack, backend and product-design projects",
  },
  {
    period: "2024–2025",
    title: "Independent Learning & Projects",
    detail: "Frontend, backend and product-design practice through personal builds",
  },
];

export const personal = {
  title: "Away from the screen",
  items: [
    "Competitive footballer",
    "Regularly in the gym",
    "Usually designing or building something",
    "Based in Malta",
  ],
  currently: [
    "Studying artificial intelligence",
    "Building full-stack and backend projects",
    "Open to internships, freelance work and collaborations",
  ],
};
