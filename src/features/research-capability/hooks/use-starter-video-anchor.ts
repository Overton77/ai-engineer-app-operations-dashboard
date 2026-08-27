"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function useStarterVideoAnchor(videoId: string) {
  return useQuery({
    queryKey: researchCapabilityKeys.starterVideoAnchor(videoId),
    queryFn: () => researchCapabilityFetchers.starterVideoAnchor(videoId),
    enabled: videoId.length > 0,
  });
}
