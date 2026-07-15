export type Tool = { slug: string; name: string; use: string };

export const tools: Tool[] = [
  { slug: "go", name: "Go", use: "Backend services & APIs" },
  { slug: "typescript", name: "TypeScript", use: "Everything front-end & Node" },
  { slug: "python", name: "Python", use: "Data, ML & scripting" },
  { slug: "react", name: "React", use: "Every interface I build" },
  { slug: "nextdotjs", name: "Next.js", use: "Production React apps" },
  { slug: "postgresql", name: "Postgres", use: "The source of truth" },
  { slug: "supabase", name: "Supabase", use: "Auth, storage & realtime" },
  { slug: "docker", name: "Docker", use: "Reproducible environments" },
  { slug: "github", name: "GitHub", use: "Version control & CI" },
  { slug: "figma", name: "Figma", use: "Design before I build" },
  { slug: "claude", name: "Claude", use: "My daily pair-programmer" },
];
