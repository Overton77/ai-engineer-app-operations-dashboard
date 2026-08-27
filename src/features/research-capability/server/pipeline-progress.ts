import type { PreResearchVideoState } from "@aiengineer/database-contract/pre-research";
import type { PipelineProgress } from "../types";
import { queryResearchCapability } from "./postgres";
import { asNumber } from "./serialize";

const QUALIFIED_TRANSCRIPT_PREDICATE = `
  v.transcript_status = 'stored'
  and v.transcript_bucket = 'ai-engineer-transcripts'
  and v.transcript_path is not null
  and v.transcript_text is not null
  and length(btrim(v.transcript_text)) > 0
  and v.duration_seconds is not null
  and v.duration_seconds > 0
  and v.duration_seconds < 5400
`;

export async function readPipelineProgress(): Promise<PipelineProgress> {
  const [totals] = await queryResearchCapability<{
    catalog_video_count: string | number;
    qualified_video_count: string | number;
    finished_video_count: string | number;
  }>(
    `select
       (select count(*) from public.research_starter_videos) as catalog_video_count,
       (
         select count(*)
         from public.research_starter_videos v
         where ${QUALIFIED_TRANSCRIPT_PREDICATE}
       ) as qualified_video_count,
       (
         select count(*)
         from public.research_pre_research_video_state
         where pre_research_pipeline_finished
       ) as finished_video_count`,
  );

  const statusCounts = await queryResearchCapability<{
    pipeline_status: PreResearchVideoState["pipeline_status"];
    video_count: string | number;
  }>(
    `select coalesce(pipeline_status, 'unknown') as pipeline_status, count(*) as video_count
     from public.research_pre_research_video_state
     group by pipeline_status
     order by video_count desc`,
  );

  const catalogVideoCount = asNumber(totals?.catalog_video_count) ?? 0;
  const qualifiedVideoCount = asNumber(totals?.qualified_video_count) ?? 0;
  const finishedVideoCount = asNumber(totals?.finished_video_count) ?? 0;

  return {
    catalogVideoCount,
    qualifiedVideoCount,
    finishedVideoCount,
    remainingQualifiedCount: Math.max(0, qualifiedVideoCount - finishedVideoCount),
    statusCounts: statusCounts.map((row) => ({
      pipelineStatus: row.pipeline_status ?? "unknown",
      videoCount: asNumber(row.video_count) ?? 0,
    })),
  };
}
