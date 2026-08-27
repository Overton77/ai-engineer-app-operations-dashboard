import type {
  AppliedResearchOutputs,
  PipelineProgress,
  ResearchTablePage,
  ShareReport,
  StarterVideoAnchor,
  StarterVideoCatalogFilters,
  StarterVideoCatalogPage,
  TaxonomyDivisions,
} from "../types";

type Envelope<T> = { ok: true; data: T } | { ok: false; error: string };

async function readEnvelope<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const body = (await response.json()) as Envelope<T>;
  if (!response.ok || !body.ok) {
    throw new Error(!body.ok ? body.error : `REQUEST_FAILED:${path}`);
  }
  return body.data;
}

function catalogQuery(filters: StarterVideoCatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.pipelineStatus) params.set("pipelineStatus", filters.pipelineStatus);
  if (filters.finished !== undefined) params.set("finished", String(filters.finished));
  if (filters.categoryCode) params.set("categoryCode", filters.categoryCode);
  if (filters.domainCode) params.set("domainCode", filters.domainCode);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.contentForm) params.set("contentForm", filters.contentForm);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export const researchCapabilityFetchers = {
  pipelineProgress: () =>
    readEnvelope<PipelineProgress>("/api/research-capability/pipeline-progress"),
  taxonomyDivisions: () =>
    readEnvelope<TaxonomyDivisions>("/api/research-capability/taxonomy-divisions"),
  starterVideoCatalog: (filters: StarterVideoCatalogFilters) =>
    readEnvelope<StarterVideoCatalogPage>(
      `/api/research-capability/starter-videos?${catalogQuery(filters)}`,
    ),
  starterVideoAnchor: (videoId: string) =>
    readEnvelope<StarterVideoAnchor>(
      `/api/research-capability/starter-videos/${encodeURIComponent(videoId)}`,
    ),
  appliedOutputs: (videoId: string, runId?: string) =>
    readEnvelope<AppliedResearchOutputs>(
      `/api/research-capability/applied-outputs/${encodeURIComponent(videoId)}${
        runId ? `?runId=${encodeURIComponent(runId)}` : ""
      }`,
    ),
  shareReport: (videoId: string) =>
    readEnvelope<ShareReport>(
      `/api/research-capability/share-reports/${encodeURIComponent(videoId)}`,
    ),
  tableRows: (tableKey: string, q?: string, videoId?: string, page = 1) => {
    const params = new URLSearchParams({ page: String(page), pageSize: "40" });
    if (q) params.set("q", q);
    if (videoId) params.set("videoId", videoId);
    return readEnvelope<ResearchTablePage>(
      `/api/research-capability/table-rows/${encodeURIComponent(tableKey)}?${params}`,
    );
  },
};
