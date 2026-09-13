import { jsonData, jsonError, readPage, readSearchParam } from "@/features/research-capability/server/http";
import { readStarterVideoCatalog } from "@/features/research-capability/server/starter-video-catalog";
import { parseCatalogSort } from "@/features/research-capability/types";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const finishedParam = readSearchParam(searchParams, "finished");
    return jsonData(
      await readStarterVideoCatalog({
        q: readSearchParam(searchParams, "q"),
        pipelineStatus: readSearchParam(searchParams, "pipelineStatus"),
        finished:
          finishedParam === "true" ? true : finishedParam === "false" ? false : undefined,
        categoryCode: readSearchParam(searchParams, "categoryCode"),
        domainCode: readSearchParam(searchParams, "domainCode"),
        difficulty: readSearchParam(searchParams, "difficulty"),
        contentForm: readSearchParam(searchParams, "contentForm"),
        sort: parseCatalogSort(readSearchParam(searchParams, "sort")),
        ...readPage(searchParams),
      }),
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "STARTER_VIDEO_CATALOG_FAILED", 500);
  }
}
