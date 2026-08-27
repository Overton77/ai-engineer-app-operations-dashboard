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
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
