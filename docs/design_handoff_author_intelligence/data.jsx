/* Mock data for Author Intelligence */
const AUTHORS = [
  { id: "vishen-lakhiani", name: "Vishen Lakhiani", role: "Founder & Lead Author", programs: 8, rating: 9.12, rewatch: 78, transformation: 81, fees2026: 0, fees2025: 240000, status: "active", trend: [82,84,83,85,87,86,88,89,90,89,91,91], flags: 0, gradient: "linear-gradient(135deg,#7a12d4,#df1a6f)" },
  { id: "jim-kwik", name: "Jim Kwik", role: "Memory & Learning", programs: 4, rating: 9.04, rewatch: 72, transformation: 76, fees2026: 90000, fees2025: 180000, status: "active", trend: [75,78,79,82,83,85,86,88,87,89,90,90], flags: 0, gradient: "linear-gradient(135deg,#329dff,#7a12d4)" },
  { id: "marisa-peer", name: "Marisa Peer", role: "Hypnotherapy & Mindset", programs: 6, rating: 8.91, rewatch: 70, transformation: 79, fees2026: 60000, fees2025: 145000, status: "active", trend: [70,72,71,74,76,78,80,82,84,85,87,88], flags: 1, gradient: "linear-gradient(135deg,#df1a6f,#ed6325)" },
  { id: "donna-eden", name: "Donna Eden", role: "Energy Medicine", programs: 3, rating: 8.74, rewatch: 64, transformation: 71, fees2026: null, fees2025: 95000, status: "review", trend: [65,67,66,68,70,72,71,73,72,74,75,73], flags: 2, gradient: "linear-gradient(135deg,#159f65,#329dff)" },
  { id: "srikumar-rao", name: "Srikumar Rao", role: "Quest in Bliss", programs: 2, rating: 8.82, rewatch: 68, transformation: 74, fees2026: 30000, fees2025: 60000, status: "active", trend: [60,62,65,68,70,72,73,74,75,76,77,78], flags: 0, gradient: "linear-gradient(135deg,#9b37f2,#329dff)" },
  { id: "jeffrey-allen", name: "Jeffrey Allen", role: "Energy & Intuition", programs: 5, rating: 9.06, rewatch: 75, transformation: 82, fees2026: 75000, fees2025: 160000, status: "active", trend: [78,80,81,82,83,85,86,87,88,89,90,91], flags: 0, gradient: "linear-gradient(135deg,#ed6325,#df1a6f)" },
  { id: "jimmy-naraine", name: "Jimmy Naraine", role: "Speaking & Influence", programs: 1, rating: 8.65, rewatch: null, transformation: 65, fees2026: null, fees2025: 20000, status: "new", trend: [null,null,null,null,null,null,null,null,86,87,86.5,86.5], flags: 1, gradient: "linear-gradient(135deg,#7a12d4,#329dff)" },
  { id: "ben-greenfield", name: "Ben Greenfield", role: "Longevity & Performance", programs: 3, rating: 8.55, rewatch: 61, transformation: 68, fees2026: 45000, fees2025: 110000, status: "active", trend: [65,66,68,67,69,70,71,72,71,73,74,73], flags: 1, gradient: "linear-gradient(135deg,#159f65,#7a12d4)" },
];

const FLAGS_FEED = [
  { id: 1, severity: "high", who: "Donna Eden", what: "Rewatch rate dropped 12% on Energy Medicine 101", when: "2h ago", color: "var(--mv-red)" },
  { id: 2, severity: "med", who: "Marisa Peer", what: "5 critical reviews flagged 'pacing' in last 7 days", when: "8h ago", color: "var(--mv-orange)" },
  { id: 3, severity: "low", who: "Ben Greenfield", what: "Cost-per-session 18% above category median", when: "1d ago", color: "var(--mv-orange)" },
  { id: 4, severity: "low", who: "Jimmy Naraine", what: "Q&A satisfaction needs follow-up data", when: "2d ago", color: "var(--mv-grey-450)" },
];

const THEMES_PRAISE = [
  { theme: "Actionable frameworks", count: 412, change: 14 },
  { theme: "High energy delivery", count: 308, change: 9 },
  { theme: "Clear storytelling", count: 287, change: -3 },
  { theme: "Personal vulnerability", count: 196, change: 22 },
  { theme: "Practical exercises", count: 184, change: 6 },
];
const THEMES_CRITIQUE = [
  { theme: "Felt rushed at the end", count: 89, change: 11 },
  { theme: "Wanted more Q&A time", count: 74, change: 4 },
  { theme: "Slides hard to read", count: 41, change: -8 },
  { theme: "Audio quality issues", count: 28, change: -22 },
];

/* For Jimmy Naraine specifically */
const JIMMY = {
  name: "Jimmy Naraine",
  role: "Speaking & Influence Mastery",
  joined: "Jan 2024",
  contract: "1-year, renewable",
  manager: "Naveen K.",
  bio: "Bestselling Udemy instructor (1.2M students) specializing in confidence, public speaking, and digital nomad work. Joined Mindvalley 2024 for the Speaking & Influence Mastery.",
  metrics: {
    programs: 1,
    rating: 8.65,
    rewatch: null,
    transformation: 65,
    feedback: 34,
    summit: 0,
    nps: null,
  },
  praise: ["Actionable frameworks", "High energy delivery", "Clear storytelling"],
  critique: ["Felt rushed at the end", "Wanted more Q&A time"],
  ratingTrend: [8.4, 8.5, 8.55, 8.6, 8.62, 8.65, 8.65],
  ratingDist: [
    { label: "10", count: 12 },
    { label: "9", count: 9 },
    { label: "8", count: 7 },
    { label: "7", count: 4 },
    { label: "≤6", count: 2 },
  ],
  programs: [
    { name: "Speaking & Influence Mastery", lessons: 12, rating: 8.65, rewatch: null, followup: 8.8, flags: 1, status: "live" },
  ],
  invoices: [
    { date: "Oct 21, 2025", number: "SpeakerFee_102125", product: "Mastery", memo: "Speaking and Influence Mastery Presenter Fee", amount: 5000 },
    { date: "Jul 3, 2025", number: "SpeakerFee_070325", product: "Mastery", memo: "Social Media Mastery Bonus Workshop fee (2 sessions, 4 hours total)", amount: 15000 },
  ],
};

Object.assign(window, { AUTHORS, FLAGS_FEED, THEMES_PRAISE, THEMES_CRITIQUE, JIMMY });
