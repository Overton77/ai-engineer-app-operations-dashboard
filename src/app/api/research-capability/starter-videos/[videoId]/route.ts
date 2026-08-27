import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readStarterVideoAnchor } from "@/features/research-capability/server/starter-video-anchor";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/research-capability/starter-videos/[videoId]">,
) {
  try {
    const { videoId } = await context.params;
    const anchor = await readStarterVideoAnchor(videoId);
    if (!anchor) return jsonError("STARTER_VIDEO_NOT_FOUND", 404);
    return jsonData(anchor);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "STARTER_VIDEO_ANCHOR_FAILED", 500);
  }
}
