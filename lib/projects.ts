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

export const projects: Project[] = [
  {
    year: "2026",
    title: "BLIRK",
    category: "AI Pipeline",
    role: "Solo build",
    tagline:
      "An agent pipeline that turns WhatsApp briefings into designed web proposals.",
    previewVideo: "/uploads/previews/blirk.mp4",
    stats: [
      { n: "95", c: "Proposals / 2 mo" },
      { n: "−90%", c: "Time per proposal" },
      { n: "14", c: "Blocks ← 130+ designs" },
    ],
    overview: [
      "BLIRK compresses what used to be a 27-minute manual handoff into a 1–4 minute automated flow. Sales pastes a WhatsApp briefing; the pipeline parses intent, selects layout blocks and returns a fully designed, editable web proposal.",
      "The system distilled 130+ historical designs into 14 reusable blocks, so every generated proposal stays on-brand while remaining flexible enough for last-mile edits.",
    ],
    tools: ["Python", "LangChain", "OpenAI API", "React", "Node.js", "Postgres"],
    pages: [
      { id: "blirk-p1", ph: "Briefing intake screen", cap: "Briefing intake — paste and parse" },
      { id: "blirk-p2", ph: "Block selection view", cap: "Automated block selection" },
      { id: "blirk-p3", ph: "Generated proposal", cap: "Generated proposal, editable" },
      { id: "blirk-p4", ph: "Analytics dashboard", cap: "Delivery & engagement analytics" },
    ],
  },
  {
    year: "2025",
    title: "CHAMP",
    category: "Web App",
    role: "Design + Front-end",
    tagline:
      "A gamified leaderboard and rewards layer that built a daily habit for thousands.",
    previewVideo: "/uploads/previews/champ.mp4",
    stats: [
      { n: "4.2k", c: "Active members" },
      { n: "+38%", c: "D30 retention" },
      { n: "12", c: "Reward tiers" },
    ],
    overview: [
      "CHAMP turned one-off signups into a daily ritual with streaks, tiered rewards and a live leaderboard. The core loop was tuned around a single question: what makes someone come back tomorrow?",
      "A motion-rich reward reveal and clear progress states pushed 30-day retention up 38% within the first quarter after launch.",
    ],
    tools: ["React", "TypeScript", "Framer Motion", "Node.js", "Redis"],
    pages: [
      { id: "champ-p1", ph: "Leaderboard screen", cap: "Live leaderboard" },
      { id: "champ-p2", ph: "Rewards / tiers screen", cap: "Reward tiers & progress" },
      { id: "champ-p3", ph: "Streak reveal", cap: "Streak reveal animation" },
    ],
  },
  {
    year: "2025",
    title: "ODDS",
    category: "ML Model",
    role: "ML + Data",
    tagline:
      "A model that ingests live odds and form data to surface value bets across five leagues.",
    previewVideo: "/uploads/previews/odds.mp4",
    stats: [
      { n: "5", c: "Leagues covered" },
      { n: "71%", c: "Hit rate" },
      { n: "900k", c: "Rows / day" },
    ],
    overview: [
      "ODDS pulls live market prices and historical form, engineers features on the fly and ranks fixtures by expected value. The pipeline ingests roughly 900k rows daily and refreshes predictions in near real time.",
      "A calibrated gradient-boosted model reached a 71% directional hit rate in backtesting across five leagues, wrapped in a clean dashboard for quick daily review.",
    ],
    tools: ["Python", "scikit-learn", "XGBoost", "Pandas", "FastAPI"],
    pages: [
      { id: "odds-p1", ph: "Value bets dashboard", cap: "Daily value board" },
      { id: "odds-p2", ph: "Fixture detail", cap: "Fixture breakdown" },
      { id: "odds-p3", ph: "Model performance", cap: "Backtest performance" },
    ],
  },
  {
    year: "2024",
    title: "CLINIC",
    category: "Product Design",
    role: "UX + Research",
    tagline: "An end-to-end UX redesign of a clinical intake tool for busy nurses.",
    previewVideo: "/uploads/previews/clinic.mp4",
    stats: [
      { n: "−44%", c: "Intake time" },
      { n: "9", c: "Screens shipped" },
      { n: "3", c: "Clinics live" },
    ],
    overview: [
      "CLINIC reworked the pre-appointment intake flow nurses run dozens of times a day. Field research surfaced the redundant steps; the redesign collapsed them into a focused, error-resistant sequence.",
      "The rebuilt flow cut average intake time by 44% and is now live in three clinics across nine shipped screens.",
    ],
    tools: ["Figma", "React", "TypeScript", "FHIR", "Playwright"],
    pages: [
      { id: "clinic-p1", ph: "Patient lookup", cap: "Patient lookup" },
      { id: "clinic-p2", ph: "Intake form", cap: "Streamlined intake form" },
      { id: "clinic-p3", ph: "Review & confirm", cap: "Review & confirm" },
      { id: "clinic-p4", ph: "Nurse dashboard", cap: "Shift dashboard" },
    ],
  },
];

export const offers = [
  "End-to-end product development",
  "AI & ML pipelines",
  "UI & motion design",
  "Design systems & front-end",
];
