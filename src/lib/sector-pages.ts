// BurnoutIQ sector landing page content.
//
// One config object per sector. Used by /healthcare, /k-12, /higher-ed,
// /nonprofit, /first-responders, /government — each route renders the
// shared <SectorLanding /> component with this data.
//
// All routes pass `?sector=<key>` to /assessment/take so item wording
// matches the audience (e.g. "patients" instead of "clients").

import type { Sector } from "./biq-sectors";

export interface SectorPageContent {
  /** URL slug (must match Sector type). */
  slug: Sector;
  /** Human-readable label for headers and meta. */
  name: string;
  /** SEO <title>. */
  metaTitle: string;
  /** SEO <meta description>. */
  metaDescription: string;
  /** Short qualifier above the hero headline. */
  heroEyebrow: string;
  /** Hero H1 — names the problem the audience lives. */
  heroTitle: string;
  /** Hero subtitle — positioning sentence. */
  heroSubtitle: string;
  /** Three sector-specific friction points. */
  painPoints: string[];
  /** Hard-number stat with citation. */
  stat: { value: string; label: string; source: string };
  /** Why BurnoutIQ specifically helps this sector. */
  whyFit: string;
}

export const SECTOR_PAGES: Record<Sector, SectorPageContent> = {
  healthcare: {
    slug: "healthcare",
    name: "Healthcare",
    metaTitle: "Burnout Assessment for Healthcare Workers | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment built for physicians, nurses, and clinical staff. Measures the burnout you can't take a sick day from.",
    heroEyebrow: "For physicians, nurses, and clinical staff",
    heroTitle:
      "Patients on schedule. Charts to close. And somehow you're supposed to recover too.",
    heroSubtitle:
      "BurnoutIQ is the burnout assessment built for the people whose mistakes have names.",
    painPoints: [
      "EHR notes that follow you home",
      "12-hour shifts that bleed into 14",
      "The moral injury of saying no to a patient who needs more time",
    ],
    stat: {
      value: "63%",
      label: "of physicians report at least one symptom of burnout",
      source: "AMA, 2023",
    },
    whyFit:
      "We score compassion fatigue and depersonalization separately from raw exhaustion. The reading is different when you treat people for a living — and the recovery plan reflects that.",
  },

  "k-12": {
    slug: "k-12",
    name: "K-12 Education",
    metaTitle: "Burnout Assessment for K-12 Teachers and School Staff | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment for teachers, counselors, and school staff. Built for the people the country runs on but rarely thanks.",
    heroEyebrow: "For teachers, counselors, principals, and school staff",
    heroTitle:
      "The kids come back tomorrow. So does the work you didn't finish today.",
    heroSubtitle:
      "BurnoutIQ is the burnout assessment for the people the country runs on but rarely thanks.",
    painPoints: [
      "Parent emails at 9 p.m.",
      "Behavior plans that take more energy than the lesson",
      "Being asked to do the work of two roles for the salary of half a job",
    ],
    stat: {
      value: "55%",
      label:
        "of K-12 educators are likely or somewhat likely to leave the profession earlier than planned",
      source: "NEA, 2022",
    },
    whyFit:
      "We measure the distinct way classroom burnout shows up — emotional exhaustion from the students you care about, paired with cynicism toward the system that hasn't caught up to the work.",
  },

  "higher-ed": {
    slug: "higher-ed",
    name: "Higher Education",
    metaTitle: "Burnout Assessment for Higher Ed Faculty and Staff | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment for college and university faculty, staff, and graduate students. Built for the people whose career trajectory is decided by people who don't see them.",
    heroEyebrow: "For faculty, staff, and graduate students",
    heroTitle:
      "Publish or perish runs both ways: you publish, and a part of you perishes.",
    heroSubtitle:
      "BurnoutIQ is built for the people whose career trajectory is decided by people who don't see them.",
    painPoints: [
      "Service work that doesn't count toward tenure",
      "Office hours that have become triage",
      "Mentoring loads that quietly tripled",
    ],
    stat: {
      value: "57%",
      label:
        "of full-time U.S. faculty report serious or moderate burnout",
      source: "Chronicle of Higher Education, 2023",
    },
    whyFit:
      "We score Fairness/Trust and Values Alignment separately — the two dimensions that hit hardest in shared-governance institutions where decisions don't follow rules anyone could articulate out loud.",
  },

  nonprofit: {
    slug: "nonprofit",
    name: "Nonprofit",
    metaTitle: "Burnout Assessment for Nonprofit Leaders and Staff | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment for mission-driven leaders and front-line nonprofit staff. Built for people who can't separate the job from the cause.",
    heroEyebrow:
      "For mission-driven leaders, program staff, and front-line workers",
    heroTitle:
      "You came to do the work. The work came back differently.",
    heroSubtitle:
      "BurnoutIQ is the burnout assessment for people who can't separate the job from the cause.",
    painPoints: [
      "Grant deadlines on top of service delivery",
      "Boards that don't know what you actually do",
      "Capacity that hasn't grown with mission scope",
    ],
    stat: {
      value: "45%",
      label:
        "of nonprofit employees plan to leave their jobs within five years, primarily due to burnout",
      source: "Nonprofit HR, 2022",
    },
    whyFit:
      "We separate Reward/Recognition from Workload — because in mission-driven work, volume is rarely the only problem. It's volume plus the invisibility of the labor that breaks people.",
  },

  "first-responders": {
    slug: "first-responders",
    name: "First Responders",
    metaTitle: "Burnout Assessment for First Responders | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment for paramedics, firefighters, law enforcement, and emergency staff. Built for the people whose job is everyone else's worst day.",
    heroEyebrow:
      "For paramedics, firefighters, law enforcement, and emergency staff",
    heroTitle:
      "You run toward what others run from. Eventually your nervous system runs back.",
    heroSubtitle:
      "BurnoutIQ is the burnout assessment for the people whose job is everyone else's worst day.",
    painPoints: [
      "Shift work that breaks your circadian sleep",
      "Calls that don't leave when the call ends",
      "Cultures that confuse asking for help with weakness",
    ],
    stat: {
      value: "5×",
      label:
        "the general workforce rate for PTSD and burnout symptoms among first responders",
      source: "SAMHSA, 2023",
    },
    whyFit:
      "We measure Detachment/Cynicism separately from Emotional Exhaustion — because in first-responder work, going numb is often the cost of doing the job, and you need to know where on the spectrum you actually are.",
  },

  government: {
    slug: "government",
    name: "Government",
    metaTitle: "Burnout Assessment for Government Employees | BurnoutIQ",
    metaDescription:
      "BurnoutIQ is the 45-item burnout assessment for federal, state, and municipal employees. Built for the people who keep institutions running while institutions get blamed.",
    heroEyebrow: "For federal, state, and municipal employees",
    heroTitle:
      "Public service in a public that doesn't always believe in service.",
    heroSubtitle:
      "BurnoutIQ is the burnout assessment for the people who keep institutions running while the institutions get blamed.",
    painPoints: [
      "Hiring freezes and the workloads that don't freeze with them",
      "Public-facing roles in a public that's grown more hostile",
      "Decisions made by political appointees with no operational context",
    ],
    stat: {
      value: "47%",
      label:
        "of federal employees report symptoms of burnout, with engagement at multi-year lows",
      source: "OPM/FEVS, 2023",
    },
    whyFit:
      "We separate Control/Autonomy from Fairness/Trust — the two dimensions that hit hardest when accountability and authority don't match in your role.",
  },
};
