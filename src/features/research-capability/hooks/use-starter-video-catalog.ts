"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";
import { useCatalogFilters } from "../context/catalog-filters-context";

export function useStarterVideoCatalog() {
  const { filters } = useCatalogFilters();
  return useQuery({
    queryKey: researchCapabilityKeys.starterVideoCatalog(filters),
    queryFn: () => researchCapabilityFetchers.starterVideoCatalog(filters),
  });
}
