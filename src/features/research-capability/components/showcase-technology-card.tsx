import { formatStatus } from "../lib/format";
import type { ShareReportTechnology } from "../types";
import { iconForTechnology } from "./org-tech-icons";
import { joinedFacts, OutboundLink, outboundLabel, recordedText } from "./showcase-primitives";

export function ShowcaseTechnologyCard({ family }: { family: ShareReportTechnology }) {
  const Icon = iconForTechnology(family.familyLabel || family.primaryTechnology);
  const heading =
    family.familyRank != null ? `${family.familyRank}. ${family.familyLabel}` : family.familyLabel;

  return (
    <article className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <h3 className="text-base font-medium">{heading}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {joinedFacts([
          family.primaryTechnologyKind ? formatStatus(family.primaryTechnologyKind) : null,
          family.roleInVideo,
        ])}
      </p>
      <p className="leading-7 text-muted-foreground">{recordedText(family.summary)}</p>
      {family.temporalStatus ? (
        <p className="text-sm text-muted-foreground">{family.temporalStatus}</p>
      ) : null}
      {family.officialUrls.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {family.officialUrls.map((url) => (
            <li key={url}>
              <OutboundLink href={url} label={outboundLabel(null, url)} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
