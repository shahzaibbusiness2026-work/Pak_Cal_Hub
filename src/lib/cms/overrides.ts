/**
 * Tool overrides — admin-managed adjustments to the static tool catalogue.
 *
 * Stored as one JSON string in the `tool_overrides` site setting (edited from
 * /admin/tools). Lets the owner disable a tool or override its public title /
 * description WITHOUT a code release. Calculator maths is never affected.
 * Shape: { disabled: string[] (tool ids), titles: { [toolId]: { title?, description? } } }
 * Always degrades to "no overrides" when settings are unavailable.
 */
export interface ToolOverrideEntry {
  title?: string;
  description?: string;
  /** SEO overrides applied to the tool page <title> and meta description. */
  metaTitle?: string;
  metaDescription?: string;
}

export interface ToolOverrides {
  disabled: string[];
  titles: Record<string, ToolOverrideEntry>;
}

export const EMPTY_TOOL_OVERRIDES: ToolOverrides = { disabled: [], titles: {} };

export function parseToolOverrides(settings: Record<string, any> | null | undefined): ToolOverrides {
  try {
    const raw = settings?.tool_overrides ?? settings?.toolOverrides;
    if (!raw) return EMPTY_TOOL_OVERRIDES;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const disabled = Array.isArray(parsed?.disabled) ? parsed.disabled.filter((x: any) => typeof x === 'string') : [];
    const titles: Record<string, ToolOverrideEntry> = {};
    if (parsed?.titles && typeof parsed.titles === 'object') {
      for (const [id, entry] of Object.entries(parsed.titles as Record<string, any>)) {
        titles[id] = {
          title: typeof entry?.title === 'string' ? entry.title : undefined,
          description: typeof entry?.description === 'string' ? entry.description : undefined,
          metaTitle: typeof entry?.metaTitle === 'string' ? entry.metaTitle : undefined,
          metaDescription: typeof entry?.metaDescription === 'string' ? entry.metaDescription : undefined,
        };
      }
    }
    return { disabled, titles };
  } catch {
    return EMPTY_TOOL_OVERRIDES;
  }
}

export function applyToolOverride<T extends { id: string; title: string; description: string }>(
  tool: T,
  overrides: ToolOverrides
): T {
  const entry = overrides.titles[tool.id];
  if (!entry) return tool;
  return {
    ...tool,
    title: entry.title?.trim() ? entry.title : tool.title,
    description: entry.description?.trim() ? entry.description : tool.description,
  };
}

export function isToolDisabled(toolId: string, overrides: ToolOverrides): boolean {
  return overrides.disabled.includes(toolId);
}

/* ------------------------------------------------------------------ */
/* Category + rate overrides (v2 — full CMS content control)           */
/* ------------------------------------------------------------------ */

export interface CategoryOverrideEntry {
  name?: string;
  description?: string;
  icon?: string;
}

export interface CategoryOverrides {
  categories: Record<string, CategoryOverrideEntry>;
}

const EMPTY_CATEGORY_OVERRIDES: CategoryOverrides = { categories: {} };

/** Parse category_overrides JSON from a raw site-settings record. */
export function parseCategoryOverrides(settingsRaw: Record<string, any> | null | undefined): CategoryOverrides {
  const raw = settingsRaw?.category_overrides ?? settingsRaw?.categoryOverrides;
  if (raw == null) return EMPTY_CATEGORY_OVERRIDES;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object' && parsed.categories && typeof parsed.categories === 'object') {
      const categories: Record<string, CategoryOverrideEntry> = {};
      for (const [id, entry] of Object.entries<any>(parsed.categories)) {
        if (entry && typeof entry === 'object') {
          categories[id] = {
            name: typeof entry.name === 'string' ? entry.name : undefined,
            description: typeof entry.description === 'string' ? entry.description : undefined,
            icon: typeof entry.icon === 'string' ? entry.icon : undefined,
          };
        }
      }
      return { categories };
    }
  } catch {
    /* degrade silently */
  }
  return EMPTY_CATEGORY_OVERRIDES;
}

export interface RateOverrides {
  petrol?: number;
  diesel?: number;
  gold24kTola?: number;
  silverTola?: number;
  usdPkr?: number;
}

/** Parse rate_overrides JSON from a raw site-settings record. */
export function parseRateOverrides(settingsRaw: Record<string, any> | null | undefined): RateOverrides {
  const raw = settingsRaw?.rate_overrides ?? settingsRaw?.rateOverrides;
  if (raw == null) return {};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') return {};
    const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);
    return {
      petrol: num(parsed.petrol),
      diesel: num(parsed.diesel),
      gold24kTola: num(parsed.gold24kTola),
      silverTola: num(parsed.silverTola),
      usdPkr: num(parsed.usdPkr),
    };
  } catch {
    return {};
  }
}
