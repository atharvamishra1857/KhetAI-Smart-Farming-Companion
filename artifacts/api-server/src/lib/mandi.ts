import { logger } from "./logger";

export type MandiPrice = {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  updatedAt: string;
};

type MandiFilters = {
  commodity?: string;
  district?: string;
  state?: string;
  limit: number;
};

const RESOURCE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const PUBLIC_API_KEY = "579b464db66ec23bdd000001";

const referencePrices: MandiPrice[] = [
  {
    id: "ref-wheat-kota",
    commodity: "Wheat",
    variety: "Lokwan",
    market: "Kota",
    district: "Kota",
    state: "Rajasthan",
    minPrice: 2280,
    maxPrice: 2460,
    modalPrice: 2380,
    unit: "₹ / quintal",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ref-soybean-indore",
    commodity: "Soyabean",
    variety: "Yellow",
    market: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    minPrice: 4200,
    maxPrice: 4780,
    modalPrice: 4550,
    unit: "₹ / quintal",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ref-onion-lasalgaon",
    commodity: "Onion",
    variety: "Local",
    market: "Lasalgaon",
    district: "Nashik",
    state: "Maharashtra",
    minPrice: 1900,
    maxPrice: 2580,
    modalPrice: 2240,
    unit: "₹ / quintal",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ref-cotton-akola",
    commodity: "Cotton",
    variety: "Desi",
    market: "Akola",
    district: "Akola",
    state: "Maharashtra",
    minPrice: 6800,
    maxPrice: 7420,
    modalPrice: 7160,
    unit: "₹ / quintal",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ref-rice-karnal",
    commodity: "Rice",
    variety: "Paddy",
    market: "Karnal",
    district: "Karnal",
    state: "Haryana",
    minPrice: 2050,
    maxPrice: 2320,
    modalPrice: 2180,
    unit: "₹ / quintal",
    updatedAt: new Date().toISOString(),
  },
];

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value.replace(/,/g, "")) || 0;
  return 0;
}

function recordValue(record: Record<string, unknown>, names: string[]): string {
  const key = Object.keys(record).find((candidate) =>
    names.some((name) => candidate.toLowerCase() === name.toLowerCase()),
  );
  return key ? String(record[key] ?? "") : "";
}

function matchesFilters(price: MandiPrice, filters: MandiFilters): boolean {
  const includes = (value: string, filter?: string) =>
    !filter || value.toLowerCase().includes(filter.toLowerCase());
  return (
    includes(price.commodity, filters.commodity) &&
    includes(price.district, filters.district) &&
    includes(price.state, filters.state)
  );
}

export async function fetchMandiPrices(filters: MandiFilters): Promise<{
  prices: MandiPrice[];
  source: string;
  lastUpdated: string;
  isLive: boolean;
}> {
  const params = new URLSearchParams({
    "api-key": process.env.DATA_GOV_API_KEY ?? PUBLIC_API_KEY,
    format: "json",
    limit: String(Math.min(filters.limit, 50)),
  });

  if (filters.commodity) params.set("filters[commodity]", filters.commodity);
  if (filters.district) params.set("filters[district]", filters.district);
  if (filters.state) params.set("filters[state]", filters.state);

  try {
    const response = await fetch(`${RESOURCE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      throw new Error(`AGMARKNET returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      records?: Record<string, unknown>[];
      updated_date?: string;
    };
    const prices = (payload.records ?? []).map((record, index) => ({
      id: `${recordValue(record, ["state"]) || "state"}-${index}`,
      commodity: recordValue(record, ["commodity"]) || "Unknown",
      variety: recordValue(record, ["variety"]) || "General",
      market: recordValue(record, ["market", "market_name"]) || "Unknown market",
      district: recordValue(record, ["district"]) || "Unknown district",
      state: recordValue(record, ["state"]) || "Unknown state",
      minPrice: numberValue(recordValue(record, ["min_price", "minprice"])),
      maxPrice: numberValue(recordValue(record, ["max_price", "maxprice"])),
      modalPrice: numberValue(recordValue(record, ["modal_price", "modalprice"])),
      unit: "₹ / quintal",
      updatedAt: payload.updated_date ?? new Date().toISOString(),
    }));

    if (prices.length > 0) {
      return {
        prices,
        source: "AGMARKNET · data.gov.in",
        lastUpdated: payload.updated_date ?? new Date().toISOString(),
        isLive: true,
      };
    }
  } catch (error) {
    logger.warn({ err: error }, "Live mandi feed unavailable; using reference data");
  }

  const prices = referencePrices.filter((price) => matchesFilters(price, filters)).slice(0, filters.limit);
  return {
    prices,
    source: "KhetAI reference rates · live feed unavailable",
    lastUpdated: new Date().toISOString(),
    isLive: false,
  };
}