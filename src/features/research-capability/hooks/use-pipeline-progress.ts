"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function usePipelineProgress() {
  return useQuery({
    queryKey: researchCapabilityKeys.pipelineProgress(),
    queryFn: researchCapabilityFetchers.pipelineProgress,
  });
}
