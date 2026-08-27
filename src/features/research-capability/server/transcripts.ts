import type { ResearchStarterVideo } from "@aiengineer/database-contract/pre-research";
import type { TranscriptObject } from "../types";
import { queryResearchCapability } from "./postgres";
import { previewText } from "./serialize";
import { downloadResearchObject, transcriptObjectPath } from "./supabase-storage";

export async function readTranscriptObject(options: {
  videoId: string;
  includeFullText: boolean;
}): Promise<TranscriptObject | null> {
  const [video] = await queryResearchCapability<
    Pick<
      ResearchStarterVideo,
      "transcript_bucket" | "transcript_path" | "transcript_char_count"
    >
  >(
    `select transcript_bucket, transcript_path, transcript_char_count
     from public.research_starter_videos
     where video_id = $1`,
    [options.videoId],
  );

  if (!video) return null;

  const locator = transcriptObjectPath(options.videoId, video.transcript_path);
  const text = await downloadResearchObject(locator);

  return {
    videoId: options.videoId,
    bucket: locator.bucket,
    path: locator.path,
    preview: previewText(text, 480),
    text: options.includeFullText ? text : null,
    charCount: video.transcript_char_count ?? text.length,
  };
}
