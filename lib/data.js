// lib/data.js
// MOCK DATA — replace with Supabase server fetches when wiring into the real
// app (see the earlier fixes package: lib/supabase/server.ts + .select()).

export const REELS = [
  {
    id: "r1",
    name: "Maya Chen",
    headline: "Product designer · NYC",
    skills: [
      { label: "Figma", hit: true },
      { label: "Design systems", hit: false },
      { label: "B2B SaaS", hit: false },
    ],
    bg: 0,
  },
  {
    id: "r2",
    name: "Devon Okafor",
    headline: "Full-stack engineer · Austin",
    skills: [
      { label: "Next.js", hit: true },
      { label: "Supabase", hit: true },
      { label: "Stripe", hit: false },
    ],
    bg: 1,
  },
  {
    id: "r3",
    name: "Priya Raman",
    headline: "Data engineer · Princeton NJ",
    skills: [
      { label: "PySpark", hit: true },
      { label: "dbt", hit: false },
      { label: "Governance", hit: false },
    ],
    bg: 2,
  },
];

export const JOBS = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    company: "Voltify",
    location: "Remote (US)",
    initial: "V",
    salary: "$150k–$190k",
    skills: [
      { label: "React", hit: true },
      { label: "Next.js", hit: true },
      { label: "Supabase", hit: false },
    ],
  },
  {
    id: "j2",
    title: "Product Designer",
    company: "Northbeam",
    location: "New York, NY",
    initial: "N",
    salary: "$120k–$155k",
    skills: [
      { label: "Figma", hit: true },
      { label: "Mobile", hit: false },
      { label: "B2C", hit: false },
    ],
  },
  {
    id: "j3",
    title: "Data Engineer",
    company: "Driftline",
    location: "Hybrid · Princeton NJ",
    initial: "D",
    salary: "$140k–$170k",
    skills: [
      { label: "PySpark", hit: true },
      { label: "dbt", hit: false },
      { label: "Governance", hit: false },
    ],
  },
  {
    id: "j4",
    title: "Growth Marketer",
    company: "Loopline",
    location: "Remote (US/CA)",
    initial: "L",
    salary: "$110k–$140k",
    skills: [
      { label: "Short-form video", hit: true },
      { label: "SEO", hit: false },
      { label: "Analytics", hit: false },
    ],
  },
];
