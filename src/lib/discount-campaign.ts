export const DISCOUNT_CAMPAIGN = {
  CODE: "Orbit100",
  DISCOUNT_BDT: 100,
  TOTAL_KEYS: 500,
  // Start: Friday, November 6, 2026 00:00:00 GMT+6 (Bangladesh Time)
  START_DATE: "2026-11-06T00:00:00+06:00",
  // End: Sunday, December 6, 2026 23:59:59 GMT+6 (30 days campaign duration)
  END_DATE: "2026-12-06T23:59:59+06:00",
  TAG_PREFIX: "COUPON:Orbit100",
} as const;

export type CampaignStatus = "upcoming" | "active" | "ended" | "sold_out";

export interface CampaignInfo {
  code: string;
  discountBdt: number;
  totalKeys: number;
  approvedKeys: number;
  remainingKeys: number;
  pendingKeys: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetTimestamp: number;
  isUpcoming: boolean;
  isActive: boolean;
  isEnded: boolean;
  isSoldOut: boolean;
}

export function getCampaignInfo(approvedCount: number = 0, pendingCount: number = 0): CampaignInfo {
  const now = Date.now();
  const startTs = new Date(DISCOUNT_CAMPAIGN.START_DATE).getTime();
  const endTs = new Date(DISCOUNT_CAMPAIGN.END_DATE).getTime();

  const totalKeys = DISCOUNT_CAMPAIGN.TOTAL_KEYS;
  const remainingKeys = Math.max(0, totalKeys - approvedCount);
  const isSoldOut = remainingKeys <= 0;

  let status: CampaignStatus;
  let targetTimestamp = endTs;

  if (isSoldOut) {
    status = "sold_out";
  } else if (now < startTs) {
    status = "upcoming";
    targetTimestamp = startTs;
  } else if (now <= endTs) {
    status = "active";
    targetTimestamp = endTs;
  } else {
    status = "ended";
  }

  return {
    code: DISCOUNT_CAMPAIGN.CODE,
    discountBdt: DISCOUNT_CAMPAIGN.DISCOUNT_BDT,
    totalKeys,
    approvedKeys: approvedCount,
    remainingKeys,
    pendingKeys: pendingCount,
    status,
    startDate: DISCOUNT_CAMPAIGN.START_DATE,
    endDate: DISCOUNT_CAMPAIGN.END_DATE,
    targetTimestamp,
    isUpcoming: status === "upcoming",
    isActive: status === "active",
    isEnded: status === "ended",
    isSoldOut,
  };
}

export function isCouponCodeValid(code: string | null | undefined): boolean {
  if (!code) return false;
  return code.trim().toUpperCase() === DISCOUNT_CAMPAIGN.CODE.toUpperCase();
}

