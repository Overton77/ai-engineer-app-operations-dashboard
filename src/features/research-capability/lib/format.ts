const DISPLAY_LOCALE = "en-US";
const COMPACT_THOUSAND = 1_000;
const COMPACT_MILLION = 1_000_000;

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export function formatStatus(status: string | null): string {
  if (!status) return "unknown";
  return status.replaceAll("_", " ");
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(DISPLAY_LOCALE).format(value);
}

export function formatCompactCount(value: number | null): string {
  if (value == null) return "—";
  if (Math.abs(value) < COMPACT_THOUSAND) return formatCount(value);
  if (Math.abs(value) < COMPACT_MILLION) {
    return `${compactScaled(value, COMPACT_THOUSAND)}K`;
  }
  return `${compactScaled(value, COMPACT_MILLION)}M`;
}

function compactScaled(value: number, divisor: number): string {
  return (value / divisor).toFixed(1);
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatConfidence(value: number | null): string {
  if (value == null) return "—";
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return String(value);
}
