export const aboutIntro = [
  "I'm a software developer and AI student based in Malta. I build full-stack applications, backend services and data-driven products, with a strong interest in how software works and how it feels to use.",
  "I mainly work with TypeScript, React, Next.js, Go and Python, taking projects from early interface design through backend architecture and deployment. Outside development, I play competitive football and enjoy exploring product design and interactive web experiences.",
];

export type TimelineItem = {
  period: string;
  title: string;
  detail: string;
};

export const experience: TimelineItem[] = [
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

export type Capability = {
  title: string;
  body: string;
};

export const capabilities: Capability[] = [
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

export const currently = [
  "Studying artificial intelligence at the University of Malta",
  "Building full-stack and backend projects",
  "Open to internships, with room for freelance work and collaborations",
];
