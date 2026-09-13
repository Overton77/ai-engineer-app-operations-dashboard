import { Badge } from "@/components/ui/badge";
import { formatStatus } from "../lib/format";
import type { ShareReportOrganization } from "../types";
import { OrgMark } from "./org-tech-icons";
import {
  joinedFacts,
  OutboundLink,
  outboundLabel,
  recordedText,
} from "./showcase-primitives";

export function ShowcaseOrganizationCard({ org }: { org: ShareReportOrganization }) {
  return (
    <article className="space-y-4 rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-center gap-2">
        <OrgMark name={org.canonicalName} />
        <h3 className="text-base font-medium">{org.canonicalName}</h3>
        {org.isPrimaryFeatured ? <Badge variant="outline">Featured</Badge> : null}
      </div>
      <p className="text-sm text-muted-foreground">{organizationFacts(org)}</p>
      <p className="leading-7 text-muted-foreground">{recordedText(org.authoritativeSummary)}</p>
      {org.officialUrl ? <OutboundLink href={org.officialUrl} label="Official site" /> : null}
      {org.sources.length > 0 ? <OrganizationSources org={org} /> : null}
    </article>
  );
}

function organizationFacts(org: ShareReportOrganization): string {
  return joinedFacts([
    org.organizationScope ? formatStatus(org.organizationScope) : null,
    org.currentStatus,
    org.relationshipRoles.map((role) => formatStatus(role)).join(", ") || null,
  ]);
}

function OrganizationSources({ org }: { org: ShareReportOrganization }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {org.sources.map((source, index) => (
        <li key={`${org.canonicalName}-${source.url ?? source.title ?? index}`}>
          {source.url ? (
            <OutboundLink href={source.url} label={outboundLabel(source.title, source.url)} />
          ) : (
            <span>{source.title ?? "Untitled source"}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
