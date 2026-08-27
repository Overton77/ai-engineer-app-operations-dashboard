import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readPacketArtifact } from "@/features/research-capability/server/packet-artifacts";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/research-capability/packet-artifacts/[videoId]/[runId]/[artifactKind]">,
) {
  try {
    const { videoId, runId, artifactKind } = await context.params;
    const artifact = await readPacketArtifact({ videoId, runId, artifactKind });
    if (!artifact) return jsonError("PACKET_ARTIFACT_NOT_FOUND", 404);
    return jsonData(artifact);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "PACKET_ARTIFACT_FAILED", 500);
  }
}
