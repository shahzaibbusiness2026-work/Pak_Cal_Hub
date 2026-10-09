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
