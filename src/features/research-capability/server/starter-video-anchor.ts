import type {
  PreResearchRun,
  PreResearchVideoState,
  ResearchStarterVideo,
} from "@aiengineer/database-contract/pre-research";
import type { StarterVideoAnchor } from "../types";
import { queryResearchCapability } from "./postgres";
import { asBoolean, asIso, asNumber, asText, serializeRow } from "./serialize";

export async function readStarterVideoAnchor(
  videoId: string,
): Promise<StarterVideoAnchor | null> {
  const [video] = await queryResearchCapability<
    Pick<
      ResearchStarterVideo,
      | "video_id"
      | "title"
      | "description"
      | "published_at"
      | "channel_title"
      | "duration_seconds"
      | "url"
      | "thumbnail_url"
      | "transcript_status"
      | "transcript_bucket"
      | "transcript_path"
      | "transcript_language"
      | "transcript_char_count"
      | "pre_research_complete"
    >
  >(
    `select
       video_id, title, description, published_at, channel_title, duration_seconds,
       url, thumbnail_url, transcript_status, transcript_bucket, transcript_path,
       transcript_language, transcript_char_count, pre_research_complete
     from public.research_starter_videos
     where video_id = $1`,
    [videoId],
  );

  if (!video) return null;

  const [videoState, runs] = await Promise.all([
    queryResearchCapability<PreResearchVideoState>(
      `select
         video_id, transcript_sha256, eligibility_status, ineligibility_reasons,
         duration_seconds, transcript_object_exists, evaluated_at, latest_run_id,
         pipeline_status, pre_research_pipeline_finished, pre_research_pipeline_finished_at,
         finished_transcript_sha256, finished_intent_id, created_at, updated_at
       from public.research_pre_research_video_state
       where video_id = $1`,
      [videoId],
    ),
    queryResearchCapability<PreResearchRun>(
      `select
         run_id, video_id, status, attempt, transcript_sha256, prompt_bundle_version,
         model_id, research_as_of, packet_schema_version, packet_storage_prefix,
         packet_sha256, started_at, completed_at, error_code, error_detail,
         created_at, updated_at
       from public.research_pre_research_run
       where video_id = $1
       order by created_at desc`,
      [videoId],
    ),
  ]);

  return {
    video: {
      videoId: video.video_id,
      title: video.title,
      description: asText(video.description),
      publishedAt: asIso(video.published_at),
      channelTitle: asText(video.channel_title),
      durationSeconds: asNumber(video.duration_seconds),
      url: asText(video.url),
      thumbnailUrl: asText(video.thumbnail_url),
      transcriptStatus: video.transcript_status,
      transcriptBucket: asText(video.transcript_bucket),
      transcriptPath: asText(video.transcript_path),
      transcriptLanguage: asText(video.transcript_language),
      transcriptCharCount: asNumber(video.transcript_char_count),
      preResearchComplete: asBoolean(video.pre_research_complete),
    },
    videoState: videoState[0] ? serializeRow(videoState[0]) : null,
    runs: runs.map(serializeRow),
  };
}
