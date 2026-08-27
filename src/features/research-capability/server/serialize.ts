export function asIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function asText(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}

export function asNumber(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asDateOnly(value: unknown): string | null {
  const iso = asIso(value);
  return iso ? iso.slice(0, 10) : null;
}

export function asStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((part) => part.replace(/^"|"$/g, "").trim())
        .filter(Boolean);
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return asStringArray(JSON.parse(trimmed) as unknown);
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const name = record.name ?? record.title ?? record.note ?? record.label;
        return typeof name === "string" ? name.trim() : "";
      }
      return String(item).trim();
    })
    .filter(Boolean);
}

export function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    next[key] = value instanceof Date ? value.toISOString() : value;
  }
  return next;
}

export function previewText(value: string | null | undefined, max = 280): string | null {
  if (!value) return null;
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}
