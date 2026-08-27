import { jsonData, jsonError, readPage, readSearchParam } from "@/features/research-capability/server/http";
import { readResearchTableRows } from "@/features/research-capability/server/research-table-catalog";

export async function GET(
  request: Request,
  context: RouteContext<"/api/research-capability/table-rows/[tableKey]">,
) {
  try {
    const { tableKey } = await context.params;
    const searchParams = new URL(request.url).searchParams;
    const page = await readResearchTableRows({
      tableKey,
      q: readSearchParam(searchParams, "q"),
      videoId: readSearchParam(searchParams, "videoId"),
      ...readPage(searchParams),
    });
    if (!page) return jsonError("UNKNOWN_RESEARCH_TABLE", 404);
    return jsonData(page);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "RESEARCH_TABLE_FAILED", 500);
  }
}
