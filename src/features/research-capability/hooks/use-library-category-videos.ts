"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";
import { LIBRARY_PAGE_SIZE } from "../lib/library-paths";
import type { StarterVideoCatalogFilters } from "../types";

export function useLibraryCategoryVideos(options: {
  categoryCode: string;
  q?: string;
  page: number;
}) {
  const filters: StarterVideoCatalogFilters = {
    finished: true,
    categoryCode: options.categoryCode,
    q: options.q,
    page: options.page,
    pageSize: LIBRARY_PAGE_SIZE,
    sort: "library",
  };

  return useQuery({
    queryKey: researchCapabilityKeys.starterVideoCatalog(filters),
    queryFn: () => researchCapabilityFetchers.starterVideoCatalog(filters),
    enabled: options.categoryCode.length > 0,
  });
}

export function useLibraryFinishedSearch(q: string) {
  const filters: StarterVideoCatalogFilters = {
    finished: true,
    q,
    page: 1,
    pageSize: 8,
    sort: "library",
  };

  return useQuery({
    queryKey: researchCapabilityKeys.starterVideoCatalog(filters),
    queryFn: () => researchCapabilityFetchers.starterVideoCatalog(filters),
    enabled: q.trim().length > 1,
  });
}
