export type ProjectStat = { n: string; c: string };
export type ProjectPage = { id: string; ph: string; cap: string; img?: string };

export type Project = {
  year: string;
  title: string;
  category: string;
  role: string;
  tagline: string;
  previewVideo: string;
  stats: ProjectStat[];
  overview: string[];
  tools: string[];
  pages: ProjectPage[];
};

const frame = (id: string, ph: string, cap: string) => ({
  id,
  ph,
  cap,
  img: `/uploads/frames/${id}.jpg`,
});

/** Placeholder projects sourced from realstoman/nextjs-tailwindcss-portfolio (MIT) */
export const projects: Project[] = [
  {
    year: "2021",
    title: "Google Health",
    category: "Web Application",
    role: "UI / Frontend",
    tagline: "A healthcare platform UI focused on clarity, accessibility, and patient-first workflows.",
    previewVideo: "/uploads/previews/health.mp4",
    stats: [
      { n: "6", c: "Core screens" },
      { n: "WCAG", c: "AA target" },
      { n: "Vue", c: "Component library" },
    ],
    overview: [
      "End-to-end UI for a health platform spanning intake, records, and provider dashboards — designed for high-trust, low-friction interactions.",
    ],
    tools: ["Vue.js", "Tailwind CSS", "Adobe XD", "JavaScript", "HTML", "CSS"],
    pages: [
      frame("health-p1", "Dashboard overview", "Patient dashboard — overview"),
      frame("health-p2", "Web portal", "Provider web portal"),
      frame("health-p3", "Mobile companion", "Mobile health companion"),
      frame("health-p4", "Design system", "UI kit & components"),
    ],
  },
  {
    year: "2021",
    title: "Phoenix Agency",
    category: "Mobile Application",
    role: "UI Design",
    tagline: "A digital agency app showcasing services, case studies, and client onboarding on mobile.",
    previewVideo: "/uploads/previews/phoenix.mp4",
    stats: [
      { n: "4", c: "App flows" },
      { n: "iOS", c: "+ Android" },
      { n: "Figma", c: "Handoff" },
    ],
    overview: [
      "Mobile-first agency experience with bold typography, service discovery, and portfolio browsing built for thumb-friendly navigation.",
    ],
    tools: ["Figma", "Vue.js", "Tailwind CSS", "JavaScript"],
    pages: [
      frame("phoenix-p1", "Home screen", "Agency home — services hero"),
      frame("phoenix-p2", "Case studies", "Case study grid"),
      frame("phoenix-p3", "Web showcase", "Responsive web showcase"),
      frame("phoenix-p4", "Onboarding", "Client onboarding flow"),
    ],
  },
  {
    year: "2021",
    title: "Cloud Storage",
    category: "Web Application",
    role: "Frontend Dev",
    tagline: "A cloud storage dashboard for uploading, organizing, and sharing files across devices.",
    previewVideo: "/uploads/previews/cloud.mp4",
    stats: [
      { n: "3", c: "Platforms" },
      { n: "Sync", c: "Real-time" },
      { n: "Vue", c: "SPA" },
    ],
    overview: [
      "Storage platform UI with folder hierarchy, upload progress, and share links — optimized for quick file retrieval and team collaboration.",
    ],
    tools: ["Vue.js", "Tailwind CSS", "Node.js", "JavaScript"],
    pages: [
      frame("cloud-p1", "File browser", "File browser — grid view"),
      frame("cloud-p2", "Upload flow", "Drag-and-drop upload"),
      frame("cloud-p3", "Mobile access", "Mobile file access"),
      frame("cloud-p4", "Share panel", "Share & permissions"),
    ],
  },
  {
    year: "2021",
    title: "WeTalk",
    category: "Social Application",
    role: "Full Stack",
    tagline: "A social messaging app with profiles, chat threads, and media sharing.",
    previewVideo: "/uploads/previews/wetalk.mp4",
    stats: [
      { n: "10k", c: "Beta users" },
      { n: "Real-time", c: "Messaging" },
      { n: "4", c: "Platforms" },
    ],
    overview: [
      "Social chat product spanning mobile and web — focused on fast messaging, rich media, and a clean profile experience.",
    ],
    tools: ["React", "Node.js", "MongoDB", "Socket.io", "Tailwind CSS"],
    pages: [
      frame("wetalk-p1", "Chat list", "Conversations inbox"),
      frame("wetalk-p2", "Profile UI", "User profile screen"),
      frame("wetalk-p3", "Web client", "Web messaging client"),
      frame("wetalk-p4", "Media share", "Media sharing flow"),
    ],
  },
];

export const offers = [
  "End-to-end product development",
  "AI & ML pipelines",
  "UI & motion design",
  "Design systems & front-end",
];
