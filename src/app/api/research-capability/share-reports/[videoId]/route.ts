import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readShareReport } from "@/features/research-capability/server/share-report";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/research-capability/share-reports/[videoId]">,
) {
  try {
    const { videoId } = await context.params;
    const report = await readShareReport(videoId);
    if (!report) {
      return jsonError("SHARE_REPORT_NOT_FOUND", 404);
    }
    return jsonData(report);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "SHARE_REPORT_FAILED", 500);
  }
}
