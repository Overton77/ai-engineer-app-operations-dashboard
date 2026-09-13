import type { ReactNode } from "react";

const NONE_RECORDED = "None recorded.";

export function recordedText(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : NONE_RECORDED;
}

export function joinedFacts(parts: Array<string | null | undefined>): string {
  const present = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  return present.length > 0 ? present.join(" · ") : NONE_RECORDED;
}

export function outboundLabel(title: string | null | undefined, url: string): string {
  const trimmed = title?.trim();
  return trimmed ? trimmed : hostFromUrl(url);
}

export function OutboundLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
      {label}
    </a>
  );
}

export function EmptyRecord({ heading }: { heading?: string }) {
  return (
    <div className="space-y-2">
      {heading ? <h3 className="text-base font-medium">{heading}</h3> : null}
      <p className="text-sm text-muted-foreground">{NONE_RECORDED}</p>
    </div>
  );
}

export function ReportSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="max-w-3xl scroll-mt-8 space-y-5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

export function RecordedList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium">{heading}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{NONE_RECORDED}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="leading-7 text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
