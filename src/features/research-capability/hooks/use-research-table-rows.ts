"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function useResearchTableRows(options: {
  tableKey: string;
  q?: string;
  videoId?: string;
  page: number;
}) {
  return useQuery({
    queryKey: researchCapabilityKeys.tableRows(
      options.tableKey,
      options.q,
      options.videoId,
      options.page,
    ),
    queryFn: () =>
      researchCapabilityFetchers.tableRows(
        options.tableKey,
        options.q,
        options.videoId,
        options.page,
      ),
    enabled: options.tableKey.length > 0,
  });
}
