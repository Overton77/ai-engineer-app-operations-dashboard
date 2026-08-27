import { jsonData, jsonError, readSearchParam } from "@/features/research-capability/server/http";
import { readAppliedResearchOutputs } from "@/features/research-capability/server/applied-research-outputs";

export async function GET(
  request: Request,
  context: RouteContext<"/api/research-capability/applied-outputs/[videoId]">,
) {
  try {
    const { videoId } = await context.params;
    const runId = readSearchParam(new URL(request.url).searchParams, "runId");
    return jsonData(await readAppliedResearchOutputs({ videoId, runId }));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "APPLIED_OUTPUTS_FAILED", 500);
  }
}
