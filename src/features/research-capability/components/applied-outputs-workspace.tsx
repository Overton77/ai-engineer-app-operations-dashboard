"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppliedResearchOutputs } from "../hooks/use-applied-research-outputs";
import { useStarterVideoAnchor } from "../hooks/use-starter-video-anchor";
import { formatDate, formatStatus } from "../lib/format";
import { canonicalLibraryCategoryCode, libraryReportPath } from "../lib/library-paths";
import { WatchOnYouTube } from "./watch-on-youtube";

export function AppliedOutputsWorkspace({ videoId }: { videoId: string }) {
  const anchor = useStarterVideoAnchor(videoId);
  const outputs = useAppliedResearchOutputs(videoId);

  if (anchor.isLoading || outputs.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  if (anchor.error || !anchor.data) {
    return <p className="text-sm text-destructive">Starter video was not found.</p>;
  }

  const video = anchor.data.video;
  const state = anchor.data.videoState;
  const applied = outputs.data;
  const primaryCategoryAssignment = (applied?.categoryAssignments ?? []).find(
    (row) => row.assignment_role === "primary",
  );
  const libraryCategoryCode = canonicalLibraryCategoryCode(
    typeof primaryCategoryAssignment?.category_code === "string"
      ? primaryCategoryAssignment.category_code
      : null,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Starter video anchor
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{video.videoId}</span>
          <Badge variant={video.preResearchComplete ? "default" : "outline"}>
            {video.preResearchComplete ? "completed" : formatStatus(String(state?.pipeline_status ?? "unknown"))}
          </Badge>
          <WatchOnYouTube videoId={video.videoId} storedUrl={video.url} />
          {video.preResearchComplete ? (
            <Link
              href={libraryReportPath(libraryCategoryCode, video.videoId)}
              className="hover:underline"
            >
              Open library report
            </Link>
          ) : null}
          <span>Published {formatDate(video.publishedAt)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pipeline status" value={formatStatus(String(state?.pipeline_status ?? "—"))} />
        <Metric
          label="Finished at"
          value={formatDate(typeof state?.pre_research_pipeline_finished_at === "string" ? state.pre_research_pipeline_finished_at : null)}
        />
        <Metric label="Latest run" value={applied?.selectedRunId ?? "—"} mono />
        <Metric
          label="Packet artifacts"
          value={`${applied?.artifacts.length ?? 0} / 12`}
        />
      </div>

      <Tabs defaultValue="taxonomy">
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="technologies">Technologies</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="packet">Packet</TabsTrigger>
        </TabsList>
        <TabsContent value="taxonomy" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard
              title="Engineering categories"
              items={(applied?.categoryAssignments ?? []).map((row) =>
                `${row.assignment_role}: ${row.category_code}`,
              )}
            />
            <ListCard
              title="Application domains"
              items={(applied?.domainAssignments ?? []).map((row) => String(row.domain_code))}
            />
            <ListCard
              title="Lifecycle"
              items={(applied?.lifecycleAssignments ?? []).map((row) =>
                String(row.lifecycle_stage),
              )}
            />
            <ListCard
              title="Form and difficulty"
              items={[
                applied?.analysis?.content_form ? `form: ${applied.analysis.content_form}` : null,
                applied?.analysis?.difficulty ? `difficulty: ${applied.analysis.difficulty}` : null,
                applied?.analysis?.evidence_level
                  ? `evidence: ${applied.analysis.evidence_level}`
                  : null,
              ].filter((item): item is string => Boolean(item))}
            />
          </div>
        </TabsContent>
        <TabsContent value="organizations" className="pt-4">
          <div className="grid gap-4">
            {(applied?.organizations ?? []).map((org) => (
              <Card key={String(org.organization_candidate_id)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {String(org.canonical_name)}
                    {org.is_primary_featured ? <Badge>primary featured</Badge> : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{String(org.authoritative_summary ?? "No summary")}</p>
                  <p>
                    {String(org.primary_domain_code ?? "unclassified")}
                    {org.official_url ? (
                      <>
                        {" · "}
                        <a href={String(org.official_url)} className="hover:underline" target="_blank" rel="noreferrer">
                          official site
                        </a>
                      </>
                    ) : null}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="technologies" className="pt-4">
          <div className="grid gap-4">
            {(applied?.technologyFamilies ?? []).map((family) => (
              <Card key={String(family.technology_summary_id)}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {String(family.family_rank)}. {String(family.family_label)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{String(family.primary_technology)}</p>
                  <p>{String(family.summary ?? "")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="summaries" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contextualized summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>{String(applied?.initialSummary?.transcript_summary ?? applied?.analysis?.contextualized_abstract ?? "No summary yet.")}</p>
              {applied?.analysis?.why_it_matters ? (
                <p>{String(applied.analysis.why_it_matters)}</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="evidence" className="pt-4">
          <div className="grid gap-3">
            {(applied?.evidenceAnchors ?? []).slice(0, 24).map((anchorRow) => (
              <Card key={String(anchorRow.evidence_id)}>
                <CardContent className="py-4 text-sm">
                  <p className="text-muted-foreground">{String(anchorRow.short_excerpt ?? "")}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {String(anchorRow.source_kind)} · {String(anchorRow.supports ?? "")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="packet" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registered packet artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(applied?.artifacts ?? []).map((artifact) => (
                <div key={String(artifact.artifact_id)} className="flex justify-between gap-4">
                  <span className="font-mono">{String(artifact.artifact_kind)}</span>
                  <span className="truncate text-muted-foreground">
                    {String(artifact.storage_path)}
                  </span>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Intent status: {formatStatus(String(applied?.intent?.status ?? "none"))}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Browse the raw applied tables for this video in{" "}
        <Link href={`/research-capability/tables/technology-families?videoId=${encodeURIComponent(videoId)}`} className="underline">
          technology families
        </Link>{" "}
        or{" "}
        <Link href={`/research-capability/tables/organization-candidates?videoId=${encodeURIComponent(videoId)}`} className="underline">
          organizations
        </Link>
        .
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className={`mt-2 text-sm ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {items.length === 0 ? <p>None applied yet.</p> : items.map((item) => <p key={item}>{item}</p>)}
      </CardContent>
    </Card>
  );
}
