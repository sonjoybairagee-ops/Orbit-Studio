export interface PlanTierConfig {
  id: "free" | "starter" | "pro" | "agency";
  name: string;
  tagline: string;
  bestFor: string;
  storageGB: number;
  storageBytes: number;
  priceMonthlyUSD: number;
  priceAnnualMonthlyEquivalentUSD: number;
  priceAnnualTotalUSD: number;
  priceMonthlyBDT: number;
  membersIncluded: number;
  activeProjectsLimit: number; // -1 for unlimited
  popular?: boolean;
  features: string[];
}

export interface StorageAddonConfig {
  id: string;
  name: string;
  gb: number;
  bytes: number;
  priceMonthlyUSD: number;
  priceMonthlyBDT: number;
}

export const AGENCY_PLANS: Record<"free" | "starter" | "pro" | "agency", PlanTierConfig> = {
  free: {
    id: "free",
    name: "Free Forever",
    tagline: "Explore the platform with no commitment",
    bestFor: "Solo creators & testing",
    storageGB: 2,
    storageBytes: 2 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 0,
    priceAnnualMonthlyEquivalentUSD: 0,
    priceAnnualTotalUSD: 0,
    priceMonthlyBDT: 0,
    membersIncluded: 2,
    activeProjectsLimit: 2,
    features: [
      "2 GB Cloudflare R2 storage",
      "1 workspace",
      "2 internal members",
      "2 active projects",
      "Basic client video review",
      "Secure delivery links",
      "Basic file manager",
      "Always 100% free external client reviews",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Professional client delivery & revision workflow",
    bestFor: "Best for freelancers",
    storageGB: 100,
    storageBytes: 100 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 9,
    priceAnnualMonthlyEquivalentUSD: 7.5,
    priceAnnualTotalUSD: 90,
    priceMonthlyBDT: 990,
    membersIncluded: 2,
    activeProjectsLimit: 10,
    features: [
      "100 GB Cloudflare R2 storage",
      "2 internal members",
      "Unlimited clients",
      "10 active projects",
      "Frame-accurate video review + timestamp comments",
      "File version history",
      "Client approval portal",
      "Final master delivery links",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "High-volume video production & team collaboration",
    bestFor: "Best for small agencies",
    popular: true,
    storageGB: 500,
    storageBytes: 500 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 19,
    priceAnnualMonthlyEquivalentUSD: 15.83,
    priceAnnualTotalUSD: 190,
    priceMonthlyBDT: 2100,
    membersIncluded: 5,
    activeProjectsLimit: -1, // Unlimited
    features: [
      "500 GB Cloudflare R2 storage",
      "5 internal members",
      "Unlimited active projects",
      "Advanced video review & frame comparison",
      "Version history & instant rollback",
      "Custom-branded client delivery portals",
      "Team collaboration & role management",
      "Audit trail activity logs",
      "Priority processing & streaming CDN",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    tagline: "Enterprise-grade scale, analytics, and custom branding",
    bestFor: "For growing creative agencies",
    storageGB: 1024,
    storageBytes: 1024 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 49,
    priceAnnualMonthlyEquivalentUSD: 40.83,
    priceAnnualTotalUSD: 490,
    priceMonthlyBDT: 5400,
    membersIncluded: 10,
    activeProjectsLimit: -1, // Unlimited
    features: [
      "1 TB (1,024 GB) Cloudflare R2 storage",
      "10 internal members",
      "Multiple workspaces support",
      "Advanced role-based permissions",
      "Client-specific branded portals",
      "Advanced production analytics & reports",
      "Custom agency branding & domains",
      "Real-time team activity monitoring",
      "Advanced multi-tier project management",
    ],
  },
};

export const STORAGE_ADDONS: StorageAddonConfig[] = [
  {
    id: "addon_250gb",
    name: "+250 GB",
    gb: 250,
    bytes: 250 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 6,
    priceMonthlyBDT: 650,
  },
  {
    id: "addon_500gb",
    name: "+500 GB",
    gb: 500,
    bytes: 500 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 12,
    priceMonthlyBDT: 1300,
  },
  {
    id: "addon_1tb",
    name: "+1 TB",
    gb: 1024,
    bytes: 1024 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 25,
    priceMonthlyBDT: 2700,
  },
  {
    id: "addon_2tb",
    name: "+2 TB",
    gb: 2048,
    bytes: 2048 * 1024 * 1024 * 1024,
    priceMonthlyUSD: 45,
    priceMonthlyBDT: 4900,
  },
];

