"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function useShareReport(videoId: string) {
  return useQuery({
    queryKey: researchCapabilityKeys.shareReport(videoId),
    queryFn: () => researchCapabilityFetchers.shareReport(videoId),
    enabled: videoId.length > 0,
    retry: false,
  });
}
