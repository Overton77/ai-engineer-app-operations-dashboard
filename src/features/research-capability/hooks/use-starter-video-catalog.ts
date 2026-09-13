"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";
import { useCatalogFilters } from "../context/catalog-filters-context";
import type { StarterVideoCatalogFilters } from "../types";

export function useStarterVideoCatalog() {
  const { filters } = useCatalogFilters();
  const queryFilters = finishedTalksQuery(filters);
  return useQuery({
    queryKey: researchCapabilityKeys.starterVideoCatalog(queryFilters),
    queryFn: () => researchCapabilityFetchers.starterVideoCatalog(queryFilters),
  });
}

function finishedTalksQuery(filters: StarterVideoCatalogFilters): StarterVideoCatalogFilters {
  return {
    ...filters,
    finished: true,
    pipelineStatus: undefined,
  };
}
