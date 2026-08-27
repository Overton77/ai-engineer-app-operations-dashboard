import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readTranscriptObject } from "@/features/research-capability/server/transcripts";

export async function GET(
  request: Request,
  context: RouteContext<"/api/research-capability/transcripts/[videoId]">,
) {
  try {
    const { videoId } = await context.params;
    const includeFullText = new URL(request.url).searchParams.get("full") === "1";
    const transcript = await readTranscriptObject({ videoId, includeFullText });
    if (!transcript) return jsonError("TRANSCRIPT_NOT_FOUND", 404);
    return jsonData(transcript);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "TRANSCRIPT_FAILED", 500);
  }
}
