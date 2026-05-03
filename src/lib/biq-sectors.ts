// Sector + role enums for the BurnoutIQ pre-assessment intake screen.
// Drives sector-aware item phrasing in src/lib/biq-bank.ts and segments
// downstream analytics.

export type Sector =
  | "healthcare"
  | "k-12"
  | "higher-ed"
  | "corporate"
  | "nonprofit"
  | "first-responders"
  | "government"
  | "other";

export type Role =
  | "ic"
  | "manager"
  | "director"
  | "executive"
  | "other";

export interface SectorOption {
  value: Sector;
  label: string;
  hint: string;
}

export const SECTORS: SectorOption[] = [
  { value: "healthcare", label: "Healthcare", hint: "Hospitals, clinics, mental-health, behavioral health" },
  { value: "k-12", label: "K-12 Education", hint: "Public, charter, or private school district" },
  { value: "higher-ed", label: "Higher Education", hint: "Colleges, universities, community colleges" },
  { value: "corporate", label: "Corporate", hint: "For-profit company across any industry" },
  { value: "nonprofit", label: "Nonprofit", hint: "Mission-driven organization (501(c)(3) or equivalent)" },
  { value: "first-responders", label: "First Responders", hint: "EMS, fire, law enforcement, emergency dispatch" },
  { value: "government", label: "Government", hint: "Federal, state, county, or local public service" },
  { value: "other", label: "Other", hint: "Pick this if nothing above fits" },
];

export interface RoleOption {
  value: Role;
  label: string;
  hint: string;
}

export const ROLES: RoleOption[] = [
  { value: "ic", label: "Individual Contributor", hint: "You do the work; you don't manage others" },
  { value: "manager", label: "Manager", hint: "You manage one team" },
  { value: "director", label: "Director / VP", hint: "You manage managers, or own a function" },
  { value: "executive", label: "Executive", hint: "C-level / org-wide leadership" },
  { value: "other", label: "Other", hint: "Pick this if nothing above fits" },
];

export const SECTOR_LABELS: Record<Sector, string> = SECTORS.reduce(
  (acc, s) => ((acc[s.value] = s.label), acc),
  {} as Record<Sector, string>,
);

export const ROLE_LABELS: Record<Role, string> = ROLES.reduce(
  (acc, r) => ((acc[r.value] = r.label), acc),
  {} as Record<Role, string>,
);
