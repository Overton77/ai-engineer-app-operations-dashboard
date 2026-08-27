"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useShareReport } from "../hooks/use-share-report";
import { formatConfidence, formatDate, formatDuration, formatStatus } from "../lib/format";
import {
  canonicalLibraryCategoryCode,
  libraryCategoryPath,
  libraryReportPath,
  pipelineWorkspacePath,
} from "../lib/library-paths";
import type { ShareReport } from "../types";
import { LibraryNotFound } from "./library-not-found";
import { WatchOnYouTube } from "./watch-on-youtube";

const REPORT_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "summary", label: "Summary" },
  { id: "taxonomy", label: "Taxonomy" },
  { id: "organizations", label: "Organizations" },
  { id: "technologies", label: "Technologies" },
  { id: "curriculum", label: "Curriculum" },
  { id: "sources", label: "Sources" },
] as const;

const EVIDENCE_PREVIEW_LIMIT = 20;

export function LibraryShareReport({
  categoryCode,
  videoId,
}: {
  categoryCode: string;
  videoId: string;
}) {
  const router = useRouter();
  const { data, isLoading, error } = useShareReport(videoId);

  const canonicalCategory = data
    ? canonicalLibraryCategoryCode(data.taxonomy.primary?.categoryCode)
    : null;

  useEffect(() => {
    if (!canonicalCategory || canonicalCategory === categoryCode) return;
    router.replace(libraryReportPath(canonicalCategory, videoId));
  }, [canonicalCategory, categoryCode, router, videoId]);

  if (isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (error || !data) {
    return (
      <LibraryNotFound
        title="Report not in the library"
        body="This talk is missing, still in the pipeline, or has not been applied. The library only shows finished reports."
      />
    );
  }

  if (canonicalCategory !== categoryCode) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  return <ShareReportBrief report={data} />;
}

function ShareReportBrief({ report }: { report: ShareReport }) {
  const featuredOrganization =
    report.organizations.find((org) => org.isPrimaryFeatured) ?? report.organizations[0] ?? null;
  const primaryLabel = report.taxonomy.primary?.label ?? "Uncategorized";
  const primaryCode = canonicalLibraryCategoryCode(report.taxonomy.primary?.categoryCode);
  const transcriptDiffers =
    Boolean(report.summaries.transcriptOnly) &&
    report.summaries.transcriptOnly !== report.summaries.contextualized;

  return (
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,48rem)] lg:items-start lg:gap-12">
      <nav className="lg:sticky lg:top-8 lg:flex lg:flex-col lg:gap-2">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          In this brief
        </p>
        <div className="flex gap-3 overflow-x-auto text-sm text-muted-foreground lg:flex-col lg:overflow-visible">
          {REPORT_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="whitespace-nowrap hover:text-foreground">
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <article className="flex min-w-0 flex-col gap-12">
        <header className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/research-capability/library" className="hover:text-foreground">
              Library
            </Link>
            {" / "}
            <Link href={libraryCategoryPath(primaryCode)} className="hover:text-foreground">
              {primaryLabel}
            </Link>
            {" / "}
            <span className="text-foreground">{report.video.title}</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight">{report.video.title}</h1>
            <WatchOnYouTube
              videoId={report.video.videoId}
              storedUrl={report.video.url}
              className="shrink-0 font-medium hover:underline"
            />
          </div>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-mono">{report.video.videoId}</span>
            <span>Published {formatDate(report.video.publishedAt)}</span>
            <span>{formatDuration(report.video.durationSeconds)}</span>
            {report.video.channelTitle ? <span>{report.video.channelTitle}</span> : null}
            {featuredOrganization ? <span>{featuredOrganization.canonicalName}</span> : null}
          </p>
          <Link
            href={pipelineWorkspacePath(report.video.videoId)}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Pipeline workspace
          </Link>
        </header>

        <ReportSection id="overview" title="Overview / at a glance">
          <GlanceList
            items={[
              ["Category", primaryLabel],
              ["Form", formatStatus(report.taxonomy.contentForm)],
              ["Difficulty", formatStatus(report.taxonomy.difficulty)],
              ["Evidence level", formatStatus(report.taxonomy.evidenceLevel)],
              [
                "Domains",
                report.taxonomy.domains.map((domain) => domain.label).join(", ") || "None recorded.",
              ],
              [
                "Lifecycle",
                report.taxonomy.lifecycleStages.map((stage) => formatStatus(stage)).join(", ") ||
                  "None recorded.",
              ],
              ["Featured organization", featuredOrganization?.canonicalName ?? "None recorded."],
              ["Research as of", formatDate(report.pipeline.researchAsOf)],
            ]}
          />
        </ReportSection>

        <ReportSection id="summary" title="01 Summary">
          <ProseBlock label="Why it matters" value={report.summaries.whyItMatters} />
          <ProseBlock label="Contextualized summary" value={report.summaries.contextualized} />
          {transcriptDiffers ? (
            <ProseBlock label="Transcript-only summary" value={report.summaries.transcriptOnly} />
          ) : null}
          <ProseBlock label="Temporal note" value={report.summaries.temporalContext} />
          <StringList label="Key takeaways" items={report.keyTakeaways} />
        </ReportSection>

        <ReportSection id="taxonomy" title="02 Taxonomy">
          <AssignmentBlock title="Primary" assignment={report.taxonomy.primary} />
          {report.taxonomy.secondary.length > 0 ? (
            report.taxonomy.secondary.map((assignment) => (
              <AssignmentBlock
                key={assignment.categoryCode}
                title="Secondary"
                assignment={assignment}
              />
            ))
          ) : (
            <EmptyRecord heading="Secondary" />
          )}
          {report.taxonomy.domains.length > 0 ? (
            report.taxonomy.domains.map((domain) => (
              <AssignmentBlock
                key={domain.domainCode}
                title="Domain"
                assignment={{
                  categoryCode: domain.domainCode,
                  label: domain.label,
                  confidence: domain.confidence,
                  rationale: domain.rationale,
                }}
              />
            ))
          ) : (
            <EmptyRecord heading="Domains" />
          )}
          <GlanceList
            items={[
              ["Form", formatStatus(report.taxonomy.contentForm)],
              ["Difficulty", formatStatus(report.taxonomy.difficulty)],
              [
                "Lifecycle",
                report.taxonomy.lifecycleStages.map((stage) => formatStatus(stage)).join(", ") ||
                  "None recorded.",
              ],
            ]}
          />
        </ReportSection>

        <ReportSection id="organizations" title="03 Organizations">
          {report.organizations.length === 0 ? (
            <EmptyRecord />
          ) : (
            report.organizations.map((org) => (
              <div key={org.canonicalName} className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-medium">{org.canonicalName}</h3>
                  {org.isPrimaryFeatured ? (
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      featured
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {[org.organizationScope, org.primaryDomainLabel, org.currentStatus]
                    .filter(Boolean)
                    .join(" · ") || "None recorded."}
                </p>
                {org.relationshipRoles.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Roles: {org.relationshipRoles.join(", ")}
                  </p>
                ) : null}
                <ProseBlock value={org.authoritativeSummary} />
                {org.officialUrl ? (
                  <OutboundLink href={org.officialUrl} label="Official site" />
                ) : null}
                {org.sources.length > 0 ? (
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {org.sources.map((source, index) => (
                      <li key={`${org.canonicalName}-${source.url ?? source.title ?? index}`}>
                        {source.url ? (
                          <OutboundLink href={source.url} label={source.title ?? source.url} />
                        ) : (
                          <span>{source.title ?? "Untitled source"}</span>
                        )}
                        <span className="block text-xs">
                          {[source.sourceRole, source.authorityTier, source.verificationStatus]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </ReportSection>

        <ReportSection id="technologies" title="04 Technologies">
          {report.technologies.length === 0 ? (
            <EmptyRecord />
          ) : (
            report.technologies.map((family) => (
              <div key={`${family.familyRank}-${family.familyLabel}`} className="space-y-2">
                <h3 className="text-base font-medium">
                  {family.familyRank != null ? `${family.familyRank}. ` : null}
                  {family.familyLabel}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {[family.primaryTechnology, family.primaryTechnologyKind, family.roleInVideo]
                    .filter(Boolean)
                    .join(" · ") || "None recorded."}
                </p>
                <ProseBlock value={family.summary} />
                {family.temporalStatus ? (
                  <p className="text-sm text-muted-foreground">{family.temporalStatus}</p>
                ) : null}
                {family.officialUrls.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {family.officialUrls.map((url) => (
                      <li key={url}>
                        <OutboundLink href={url} label={url} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </ReportSection>

        <ReportSection id="curriculum" title="05 Curriculum">
          <GlanceList
            items={[["Recommended level", formatStatus(report.curriculum.recommendedLearnerLevel)]]}
          />
          <StringList label="Learning outcomes" items={report.curriculum.learningOutcomes} />
          <StringList label="Prerequisites" items={report.curriculum.prerequisites} />
          <StringList label="Challenge seeds" items={report.curriculum.challengeSeeds} />
          <StringList label="Curriculum roles" items={report.curriculum.curriculumRoles} />
        </ReportSection>

        <ReportSection id="sources" title="06 Sources and evidence">
          <h3 className="text-base font-medium">Entities</h3>
          {report.entities.length === 0 ? (
            <EmptyRecord />
          ) : (
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {report.entities.map((entity) => (
                <li key={`${entity.entityKind}-${entity.name}`}>
                  {entity.canonicalUrl ? (
                    <OutboundLink href={entity.canonicalUrl} label={entity.name} />
                  ) : (
                    <span className="text-foreground">{entity.name}</span>
                  )}
                  <span className="block text-xs">
                    {[
                      formatStatus(entity.entityKind),
                      entity.relationshipToVideo,
                      entity.verificationStatus,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-base font-medium">Resources</h3>
          {report.resources.length === 0 ? (
            <EmptyRecord />
          ) : (
            <ul className="space-y-3">
              {report.resources.map((resource) => (
                <li key={`${resource.resourceType}-${resource.title}`} className="space-y-1">
                  {resource.url ? (
                    <OutboundLink href={resource.url} label={resource.title} />
                  ) : (
                    <p className="text-sm font-medium">{resource.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[
                      formatStatus(resource.resourceType),
                      resource.verificationStatus,
                      resource.isFirstParty ? "first party" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <ProseBlock value={resource.whyValuable} />
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-base font-medium">Evidence</h3>
          {report.evidence.length === 0 ? (
            <EmptyRecord />
          ) : (
            <ul className="space-y-3">
              {report.evidence.slice(0, EVIDENCE_PREVIEW_LIMIT).map((item) => (
                <li key={item.evidenceId} className="space-y-1">
                  <p className="leading-7 text-muted-foreground">
                    {item.shortExcerpt ?? "None recorded."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[formatStatus(item.sourceKind), item.supports].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-base font-medium">Web-search queries</h3>
          {report.webSearches.length === 0 ? (
            <EmptyRecord />
          ) : (
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {report.webSearches.map((search, index) => (
                <li key={`${search.query ?? "query"}-${index}`}>
                  <span>{search.query ?? "None recorded."}</span>
                  <span className="block text-xs">
                    {[search.subagent, search.searchPurpose].filter(Boolean).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ReportSection>
      </article>
    </div>
  );
}

function ReportSection({
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

function GlanceList({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([term, value]) => (
        <div key={term}>
          <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{term}</dt>
          <dd className="mt-1 text-sm leading-6">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProseBlock({ label, value }: { label?: string; value: string | null }) {
  return (
    <div className="space-y-2">
      {label ? <h3 className="text-base font-medium">{label}</h3> : null}
      <p className="leading-7 text-muted-foreground">{value ?? "None recorded."}</p>
    </div>
  );
}

function StringList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">{label}</h3>
      {items.length === 0 ? (
        <EmptyRecord />
      ) : (
        <ul className="list-disc space-y-1 pl-5 leading-7 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssignmentBlock({
  title,
  assignment,
}: {
  title: string;
  assignment: {
    categoryCode: string;
    label: string;
    confidence: number | null;
    rationale: string | null;
  } | null;
}) {
  if (!assignment) {
    return <EmptyRecord heading={title} />;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">
        {title}: {assignment.label}
      </h3>
      <p className="text-xs text-muted-foreground">
        {assignment.categoryCode} · {formatConfidence(assignment.confidence)}
      </p>
      <p className="leading-7 text-muted-foreground">{assignment.rationale ?? "None recorded."}</p>
    </div>
  );
}

function EmptyRecord({ heading }: { heading?: string }) {
  return (
    <div className="space-y-2">
      {heading ? <h3 className="text-base font-medium">{heading}</h3> : null}
      <p className="text-sm text-muted-foreground">None recorded.</p>
    </div>
  );
}

function OutboundLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-sm hover:underline">
      {label}
    </a>
  );
}
