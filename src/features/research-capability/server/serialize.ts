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
