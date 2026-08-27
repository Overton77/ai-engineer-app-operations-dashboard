import type { StarterVideoCatalogFilters } from "../types";

export const researchCapabilityKeys = {
  all: ["research-capability"] as const,
  pipelineProgress: () => [...researchCapabilityKeys.all, "pipeline-progress"] as const,
  taxonomyDivisions: () => [...researchCapabilityKeys.all, "taxonomy-divisions"] as const,
  starterVideoCatalog: (filters: StarterVideoCatalogFilters) =>
    [...researchCapabilityKeys.all, "starter-videos", filters] as const,
  starterVideoAnchor: (videoId: string) =>
    [...researchCapabilityKeys.all, "starter-video", videoId] as const,
  appliedOutputs: (videoId: string, runId?: string) =>
    [...researchCapabilityKeys.all, "applied-outputs", videoId, runId ?? "latest"] as const,
  tableRows: (tableKey: string, q?: string, videoId?: string, page?: number) =>
    [...researchCapabilityKeys.all, "table-rows", tableKey, q ?? "", videoId ?? "", page ?? 1] as const,
};
