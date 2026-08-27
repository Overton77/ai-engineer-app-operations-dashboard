"use client";

import { Badge } from "@/components/ui/badge";
import { useCatalogFilters } from "../context/catalog-filters-context";
import { useTaxonomyDivisions } from "../hooks/use-taxonomy-divisions";

export function TaxonomyDivisionRail() {
  const { data } = useTaxonomyDivisions();
  const { filters, patchFilters } = useCatalogFilters();

  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Taxonomy divisions
      </p>
      <div className="flex flex-wrap gap-2">
        {data.engineeringCategories
          .filter((option) => option.appliedVideoCount > 0)
          .map((option) => {
            const selected = filters.categoryCode === option.code;
            return (
              <Badge
                key={option.code}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  patchFilters({
                    categoryCode: selected ? undefined : option.code,
                  })
                }
              >
                {option.label} {option.appliedVideoCount}
              </Badge>
            );
          })}
      </div>
    </div>
  );
}
