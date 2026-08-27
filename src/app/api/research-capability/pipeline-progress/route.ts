import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readPipelineProgress } from "@/features/research-capability/server/pipeline-progress";

export async function GET() {
  try {
    return jsonData(await readPipelineProgress());
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "PIPELINE_PROGRESS_FAILED", 500);
  }
}
