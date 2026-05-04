import type { Sector } from "./biq-sectors";

export type Subscale =
  | "ee" | "dp" | "pa"
  | "workload" | "control" | "reward" | "community" | "fairness" | "values";

export interface BiqItem {
  id: string;
  subscale: Subscale;
  reverse: boolean;
  text: string;
  variants?: Partial<Record<Sector, string>>;
}

export interface OpenEnded {
  id: string;
  prompt: string;
}

export const BANK: BiqItem[] = [
  // ── Emotional Exhaustion (6) ─────────────────────────────────────────
  { id:"ee_1", subscale:"ee", reverse:false, text:"I feel emotionally drained by my work." },
  { id:"ee_2", subscale:"ee", reverse:false, text:"I feel used up at the end of the workday." },
  { id:"ee_3", subscale:"ee", reverse:false, text:"Facing another workday feels like a battle I've already lost." },
  { id:"ee_4", subscale:"ee", reverse:false, text:"I feel mentally or physically exhausted by what my job demands." },
  { id:"ee_5", subscale:"ee", reverse:false, text:"Working with people all day is a real strain on me." },
  { id:"ee_6", subscale:"ee", reverse:false, text:"I feel burned out from my work." },
  // ── Detachment / Cynicism (6) ────────────────────────────────────────
  { id:"dp_1", subscale:"dp", reverse:false, text:"I've become more detached or indifferent toward the people I work with." },
  {
    id:"dp_2", subscale:"dp", reverse:false,
    text:"I worry that this job is making me more callous toward people.",
    variants:{
      healthcare:"I worry that this job is making me more callous toward patients.",
      k12:"I worry that this job is making me more callous toward students.",
    },
  },
  { id:"dp_3", subscale:"dp", reverse:false, text:"I've lost genuine interest in how my work affects other people." },
  { id:"dp_4", subscale:"dp", reverse:false, text:"I feel like I'm going through the motions rather than genuinely engaging." },
  { id:"dp_5", subscale:"dp", reverse:false, text:"I don't really care anymore what happens at work." },
  { id:"dp_6", subscale:"dp", reverse:false, text:"I feel that others blame me for some of their problems." },
  // ── Reduced Effectiveness / PA (6, reverse-scored) ───────────────────
  { id:"pa_1", subscale:"pa", reverse:true, text:"I feel I'm making a meaningful difference through my work." },
  { id:"pa_2", subscale:"pa", reverse:true, text:"I feel confident and effective at what I do professionally." },
  { id:"pa_3", subscale:"pa", reverse:true, text:"I find my work stimulating and worth the effort." },
  { id:"pa_4", subscale:"pa", reverse:true, text:"In my work, I deal with difficult situations calmly." },
  {
    id:"pa_5", subscale:"pa", reverse:true,
    text:"Through my work, I have accomplished many worthwhile things.",
    variants:{
      healthcare:"Through my work, I have positively impacted my patients’ wellbeing.",
      k12:"Through my work, I have positively impacted my students.",
    },
  },
  { id:"pa_6", subscale:"pa", reverse:true, text:"I feel positively energized at the end of many workdays." },
  // ── Workload (3) ─────────────────────────────────────────────────────
  { id:"wl_1", subscale:"workload", reverse:false, text:"My workload is consistently more than I can handle well." },
  { id:"wl_2", subscale:"workload", reverse:false, text:"I don't have enough time to do my work as well as it should be done." },
  { id:"wl_3", subscale:"workload", reverse:false, text:"I am required to complete tasks without adequate resources or support." },
  // ── Control / Autonomy (3) ───────────────────────────────────────────
  { id:"ct_1", subscale:"control", reverse:false, text:"I have little control over how I do my work." },
  { id:"ct_2", subscale:"control", reverse:false, text:"My input is not valued in decisions that affect my work." },
  { id:"ct_3", subscale:"control", reverse:false, text:"I rarely have flexibility to adapt my responsibilities when needed." },
  // ── Reward / Recognition (3) ─────────────────────────────────────────
  { id:"rw_1", subscale:"reward", reverse:false, text:"I don't receive recognition that matches the effort I put in." },
  { id:"rw_2", subscale:"reward", reverse:false, text:"The rewards I receive feel out of proportion to what I contribute." },
  { id:"rw_3", subscale:"reward", reverse:false, text:"I feel that my work goes unnoticed or undervalued." },
  // ── Community / Belonging (3) ────────────────────────────────────────
  { id:"cm_1", subscale:"community", reverse:false, text:"There is little sense of team or belonging where I work." },
  { id:"cm_2", subscale:"community", reverse:false, text:"I feel isolated or unsupported by the people I work with." },
  { id:"cm_3", subscale:"community", reverse:false, text:"Conflict or tension with colleagues drains my energy." },
  // ── Fairness / Trust (3) ─────────────────────────────────────────────
  { id:"fn_1", subscale:"fairness", reverse:false, text:"I don't trust that decisions at work are made fairly." },
  { id:"fn_2", subscale:"fairness", reverse:false, text:"Favoritism or politics affect outcomes more than merit where I work." },
  { id:"fn_3", subscale:"fairness", reverse:false, text:"I feel treated unfairly compared to others in my organization." },
  // ── Values Alignment (3) ─────────────────────────────────────────────
  { id:"va_1", subscale:"values", reverse:false, text:"My organization's priorities conflict with my personal values." },
  { id:"va_2", subscale:"values", reverse:false, text:"I am asked to do things that feel ethically uncomfortable." },
  { id:"va_3", subscale:"values", reverse:false, text:"I have lost confidence that my organization genuinely cares about its people." },
];

export const OPEN_ENDED: OpenEnded[] = [
  { id:"oe_1", prompt:"What is the biggest source of pressure for you at work right now?" },
  { id:"oe_2", prompt:"What would make your work feel sustainable again?" },
  { id:"oe_3", prompt:"What do you wish leadership understood about your day-to-day experience?" },
];

export function itemText(item: BiqItem, sector?: Sector): string {
  if (sector && item.variants?.[sector]) return item.variants[sector]!;
  return item.text;
}
