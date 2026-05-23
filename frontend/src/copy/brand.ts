/**
 * Mogara brand — “fragrant beauty” and what the mark represents.
 */
export const MOGARA_BRAND = {
  name: "Mogara",
  tagline: "Fragrant beauty",
  taglineLines: ["Fragrant", "beauty"] as const,
  whisper: "life in bloom",
  /** Shown in the logo hover card — what Mogara is for. */
  about:
    "A gentle life tracker — core tasks, weekly rhythm, and a living bloom that grows with your momentum.",
} as const;

export const MOGARA_BRAND_TITLE = `${MOGARA_BRAND.tagline} — ${MOGARA_BRAND.whisper}`;
