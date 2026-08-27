"use client";

import { useQuery } from "@tanstack/react-query";
import { researchCapabilityFetchers } from "../api/fetchers";
import { researchCapabilityKeys } from "../api/query-keys";

export function useTaxonomyDivisions() {
  return useQuery({
    queryKey: researchCapabilityKeys.taxonomyDivisions(),
    queryFn: researchCapabilityFetchers.taxonomyDivisions,
  });
}
