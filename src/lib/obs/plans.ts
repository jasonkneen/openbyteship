export type PlanId = "free" | "lite" | "plus" | "pro" | "ultra";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  storageBytes: number;
  bandwidthBytes: number;
  maxUploadBytes: number;
  privateUploads: boolean;
  seats: number;
  recommended?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "For testing OpenByteShip in a real project.",
    storageBytes: 1 * 1024 ** 3,
    bandwidthBytes: 5 * 1024 ** 3,
    maxUploadBytes: 100 * 1024 ** 2,
    privateUploads: false,
    seats: 1,
  },
  {
    id: "lite",
    name: "Lite",
    price: 5,
    blurb: "For solo apps and launch projects.",
    storageBytes: 25 * 1024 ** 3,
    bandwidthBytes: 100 * 1024 ** 3,
    maxUploadBytes: 500 * 1024 ** 2,
    privateUploads: true,
    seats: 1,
  },
  {
    id: "plus",
    name: "Plus",
    price: 15,
    blurb: "For growing products with regular file traffic.",
    storageBytes: 100 * 1024 ** 3,
    bandwidthBytes: 500 * 1024 ** 3,
    maxUploadBytes: 2 * 1024 ** 3,
    privateUploads: true,
    seats: 5,
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 120,
    blurb: "For production apps serving heavier media.",
    storageBytes: 1 * 1024 ** 4,
    bandwidthBytes: 5 * 1024 ** 4,
    maxUploadBytes: 10 * 1024 ** 3,
    privateUploads: true,
    seats: 20,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: 400,
    blurb: "For high-volume products and agencies.",
    storageBytes: 5 * 1024 ** 4,
    bandwidthBytes: 25 * 1024 ** 4,
    maxUploadBytes: 50 * 1024 ** 3,
    privateUploads: true,
    seats: 100,
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}

/** Practical per-request cap so preview/demo storage stays healthy. */
export const DEMO_HARD_CAP_BYTES = 16 * 1024 * 1024;
