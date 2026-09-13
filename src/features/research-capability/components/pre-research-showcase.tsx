"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useShareReport } from "../hooks/use-share-report";
import { formatConfidence, formatDate, formatStatus } from "../lib/format";
import {
  featuredOrganization,
  organizationsInReadingOrder,
  primaryCategoryLabel,
} from "../lib/showcase-report";
import type { ShareReport, ShareReportAssignment } from "../types";
import { LibraryNotFound } from "./library-not-found";
import { ShowcaseHeader } from "./showcase-header";
import { ShowcaseOrganizationCard } from "./showcase-organization-card";
import {
  EmptyRecord,
  joinedFacts,
  MonoLabel,
  OutboundLink,
  outboundLabel,
  RecordedList,
  recordedText,
  ReportSection,
} from "./showcase-primitives";
import {
  SHOWCASE_SECTION_COUNT,
  ShowcaseBarNav,
  ShowcaseRailNav,
} from "./showcase-section-nav";
import { ShowcaseTechnologyCard } from "./showcase-technology-card";

const EVIDENCE_PREVIEW_LIMIT = 20;

type AssignmentRecord = Pick<ShareReportAssignment, "label" | "confidence" | "rationale">;

export function PreResearchShowcase({ videoId }: { videoId: string }) {
  const { data, isLoading, error } = useShareReport(videoId);

  if (isLoading) {
    return <ShowcaseSkeleton />;
  }

  if (error || !data) {
    return <LibraryNotFound />;
  }

  return <ShowcaseArticle report={data} />;
}

function ShowcaseArticle({ report }: { report: ShareReport }) {
  return (
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,48rem)] lg:items-start lg:gap-12">
      <ShowcaseRailNav />
      <div className="flex min-w-0 flex-col gap-12">
        <ShowcaseHeader report={report} />
        <ShowcaseBarNav />
        <Separator />
        <article className="flex max-w-3xl flex-col gap-12 leading-7">
          <OverviewSection report={report} />
          <SummarySection report={report} />
          <TaxonomySection report={report} />
          <OrganizationsSection report={report} />
          <TechnologiesSection report={report} />
          <CurriculumSection report={report} />
          <SourcesSection report={report} />
        </article>
      </div>
    </div>
  );
}

function OverviewSection({ report }: { report: ShareReport }) {
  const featured = featuredOrganization(report.organizations);

  return (
    <ReportSection id="overview" title="Overview">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Fact label="Category" values={[primaryCategoryLabel(report)]} />
        <Fact label="Form" values={[recordedStatus(report.taxonomy.contentForm)]} />
        <Fact label="Difficulty" values={[recordedStatus(report.taxonomy.difficulty)]} />
        <Fact label="Evidence level" values={[recordedStatus(report.taxonomy.evidenceLevel)]} />
        <Fact label="Domains" values={report.taxonomy.domains.map((domain) => domain.label)} />
        <Fact label="Lifecycle" values={lifecycleLabels(report.taxonomy.lifecycleStages)} />
        <Fact label="Featured org" values={[recordedText(featured?.canonicalName)]} />
        <Fact label="Research as of" values={[formatDate(report.pipeline.researchAsOf)]} />
        {report.taxonomy.overallConfidence != null ? (
          <Fact label="Confidence" values={[formatConfidence(report.taxonomy.overallConfidence)]} />
        ) : null}
      </dl>
    </ReportSection>
  );
}

function SummarySection({ report }: { report: ShareReport }) {
  const transcriptDiffers =
    Boolean(report.summaries.transcriptOnly) &&
    report.summaries.transcriptOnly !== report.summaries.contextualized;

  return (
    <ReportSection id="summary" title="01 Summary">
      <div className="space-y-3">
        <MonoLabel>Why it matters</MonoLabel>
        <p className="text-lg leading-8">{recordedText(report.summaries.whyItMatters)}</p>
      </div>
      <NarrativeBlock heading="Contextualized summary">
        {recordedText(report.summaries.contextualized)}
      </NarrativeBlock>
      {transcriptDiffers ? (
        <NarrativeBlock heading="Transcript-only summary">
          {report.summaries.transcriptOnly}
        </NarrativeBlock>
      ) : null}
      {report.summaries.temporalContext ? (
        <NarrativeBlock heading="Temporal note">{report.summaries.temporalContext}</NarrativeBlock>
      ) : null}
      <RecordedList heading="Key takeaways" items={report.keyTakeaways} />
    </ReportSection>
  );
}

function TaxonomySection({ report }: { report: ShareReport }) {
  return (
    <ReportSection id="taxonomy" title="02 Taxonomy">
      <TaxonomyAssignment heading="Primary" assignment={report.taxonomy.primary} />
      <AssignmentGroup
        heading="Secondary"
        emptyHeading="Secondary"
        records={report.taxonomy.secondary.map((assignment) => ({
          key: assignment.categoryCode,
          assignment,
        }))}
      />
      <AssignmentGroup
        heading="Domain"
        emptyHeading="Domains"
        records={report.taxonomy.domains.map((domain) => ({
          key: domain.domainCode,
          assignment: domain,
        }))}
      />
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <QuietFact label="Form" value={recordedStatus(report.taxonomy.contentForm)} />
        <QuietFact label="Difficulty" value={recordedStatus(report.taxonomy.difficulty)} />
        <QuietFact
          label="Lifecycle"
          value={recordedText(lifecycleLabels(report.taxonomy.lifecycleStages).join(", "))}
        />
      </div>
    </ReportSection>
  );
}

function OrganizationsSection({ report }: { report: ShareReport }) {
  const organizations = organizationsInReadingOrder(report.organizations);

  return (
    <ReportSection id="organizations" title="03 Organizations">
      {organizations.length === 0 ? (
        <EmptyRecord />
      ) : (
        organizations.map((org) => (
          <ShowcaseOrganizationCard key={org.canonicalName} org={org} />
        ))
      )}
    </ReportSection>
  );
}

function TechnologiesSection({ report }: { report: ShareReport }) {
  return (
    <ReportSection id="technologies" title="04 Technologies">
      {report.technologies.length === 0 ? (
        <EmptyRecord />
      ) : (
        report.technologies.map((family) => (
          <ShowcaseTechnologyCard
            key={`${family.familyRank}-${family.familyLabel}`}
            family={family}
          />
        ))
      )}
    </ReportSection>
  );
}

function CurriculumSection({ report }: { report: ShareReport }) {
  return (
    <ReportSection id="curriculum" title="05 Curriculum">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Level</h3>
        <p className="text-sm text-muted-foreground">
          {recordedStatus(report.curriculum.recommendedLearnerLevel)}
        </p>
      </div>
      <RecordedList heading="Learning outcomes" items={report.curriculum.learningOutcomes} />
      <RecordedList heading="Prerequisites" items={report.curriculum.prerequisites} />
      <RecordedList heading="Challenge seeds" items={report.curriculum.challengeSeeds} />
      <RecordedList heading="Roles" items={report.curriculum.curriculumRoles.map(formatStatus)} />
    </ReportSection>
  );
}

function SourcesSection({ report }: { report: ShareReport }) {
  return (
    <ReportSection id="sources" title="06 Sources">
      <ResourcesBlock report={report} />
      <EvidenceBlock report={report} />
      <EntitiesBlock report={report} />
    </ReportSection>
  );
}

function ResourcesBlock({ report }: { report: ShareReport }) {
  return (
    <>
      <h3 className="text-base font-medium">Resources</h3>
      {report.resources.length === 0 ? (
        <EmptyRecord />
      ) : (
        <ul className="space-y-5">
          {report.resources.map((resource, index) => (
            <li key={`${resource.resourceType}-${resource.title}-${index}`} className="space-y-2">
              {resource.url ? (
                <OutboundLink
                  href={resource.url}
                  label={outboundLabel(resource.title, resource.url)}
                />
              ) : (
                <p className="font-medium">{resource.title}</p>
              )}
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {formatStatus(resource.resourceType)}
              </p>
              <p className="leading-7 text-muted-foreground">{recordedText(resource.whyValuable)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EvidenceBlock({ report }: { report: ShareReport }) {
  return (
    <>
      <h3 className="text-base font-medium">Evidence</h3>
      {report.evidence.length === 0 ? (
        <EmptyRecord />
      ) : (
        <div className="space-y-6">
          {report.evidence.slice(0, EVIDENCE_PREVIEW_LIMIT).map((item) => (
            <figure key={item.evidenceId} className="space-y-2">
              <blockquote className="border-l-2 border-border pl-4 leading-7 text-muted-foreground">
                {recordedText(item.shortExcerpt)}
              </blockquote>
              <figcaption className="pl-4 text-xs text-muted-foreground">
                {joinedFacts([formatStatus(item.sourceKind), item.supports])}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

function EntitiesBlock({ report }: { report: ShareReport }) {
  return (
    <>
      <h3 className="text-base font-medium">Entities</h3>
      {report.entities.length === 0 ? (
        <EmptyRecord />
      ) : (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {report.entities.map((entity) => (
            <li key={`${entity.entityKind}-${entity.name}`}>
              {entity.canonicalUrl ? (
                <OutboundLink href={entity.canonicalUrl} label={entity.name} />
              ) : (
                <span className="text-foreground">{entity.name}</span>
              )}
              {entity.entityKind ? (
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                  {formatStatus(entity.entityKind)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function AssignmentGroup({
  heading,
  emptyHeading,
  records,
}: {
  heading: string;
  emptyHeading: string;
  records: Array<{ key: string; assignment: AssignmentRecord }>;
}) {
  if (records.length === 0) {
    return <EmptyRecord heading={emptyHeading} />;
  }

  return records.map((record) => (
    <TaxonomyAssignment key={record.key} heading={heading} assignment={record.assignment} />
  ));
}

function TaxonomyAssignment({
  heading,
  assignment,
}: {
  heading: string;
  assignment: AssignmentRecord | null;
}) {
  if (!assignment) {
    return <EmptyRecord heading={heading} />;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">{assignment.label}</h3>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {heading}
        {assignment.confidence != null ? ` · ${formatConfidence(assignment.confidence)}` : ""}
      </p>
      <p className="leading-7 text-muted-foreground">{recordedText(assignment.rationale)}</p>
    </div>
  );
}

function NarrativeBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium">{heading}</h3>
      <p className="leading-7 text-muted-foreground">{children}</p>
    </div>
  );
}

function Fact({ label, values }: { label: string; values: string[] }) {
  const display = values.length > 0 ? values : [recordedText(null)];

  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 flex flex-wrap gap-1.5">
        {display.map((value) => (
          <Badge key={`${label}-${value}`} variant="outline">
            {value}
          </Badge>
        ))}
      </dd>
    </div>
  );
}

function QuietFact({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em]">{label}</span>
      {value}
    </span>
  );
}

function lifecycleLabels(stages: string[]): string[] {
  return stages.map((stage) => formatStatus(stage));
}

function recordedStatus(value: string | null): string {
  return recordedText(value ? formatStatus(value) : null);
}

function ShowcaseSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,48rem)] lg:items-start lg:gap-12">
      <div className="hidden lg:flex lg:flex-col lg:gap-2">
        {Array.from({ length: SHOWCASE_SECTION_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-4 w-28" />
        ))}
      </div>
      <div className="flex max-w-3xl flex-col gap-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="aspect-video max-w-sm rounded-md" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-3 pt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
