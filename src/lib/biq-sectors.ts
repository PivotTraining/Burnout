export type Sector =
  | "healthcare" | "k12" | "higher-ed" | "corporate"
  | "nonprofit" | "first-responders" | "government" | "other";

export type Role = "ic" | "manager" | "director" | "executive" | "other";

export const SECTOR_LABELS: Record<Sector, string> = {
  healthcare: "Healthcare",
  k12: "K–12 Education",
  "higher-ed": "Higher Education",
  corporate: "Corporate / Business",
  nonprofit: "Nonprofit",
  "first-responders": "First Responders / Public Safety",
  government: "Government",
  other: "Other",
};

export const ROLE_LABELS: Record<Role, string> = {
  ic: "Individual Contributor",
  manager: "Manager / Team Lead",
  director: "Director / VP",
  executive: "Executive / C-Suite",
  other: "Other",
};
