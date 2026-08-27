"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function useAppliedResearchOutputs(videoId: string, runId?: string) {
  return useQuery({
    queryKey: researchCapabilityKeys.appliedOutputs(videoId, runId),
    queryFn: () => researchCapabilityFetchers.appliedOutputs(videoId, runId),
    enabled: videoId.length > 0,
  });
}
