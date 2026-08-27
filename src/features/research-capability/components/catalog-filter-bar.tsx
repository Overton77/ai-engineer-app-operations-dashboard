"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalogFilters } from "../context/catalog-filters-context";
import { useTaxonomyDivisions } from "../hooks/use-taxonomy-divisions";

const PIPELINE_STATUSES = [
  "finished",
  "eligible",
  "claimed",
  "review_required",
  "not_started",
  "superseded",
];

export function CatalogFilterBar() {
  const { filters, patchFilters, clearFilters } = useCatalogFilters();
  const { data: divisions } = useTaxonomyDivisions();
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  useEffect(() => {
    setSearchDraft(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim() || undefined;
      if (next !== filters.q) patchFilters({ q: next });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [filters.q, patchFilters, searchDraft]);

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto]">
      <Input
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        placeholder="Search title, video id, organization, or technology"
      />
      <Select
        value={filters.pipelineStatus ?? "all"}
        onValueChange={(value) =>
          patchFilters({ pipelineStatus: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Pipeline status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {PIPELINE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.finished === undefined ? "all" : String(filters.finished)}
        onValueChange={(value) =>
          patchFilters({
            finished: value === "all" ? undefined : value === "true",
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Completion" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Completed and remaining</SelectItem>
          <SelectItem value="true">Completed only</SelectItem>
          <SelectItem value="false">Not completed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.categoryCode ?? "all"}
        onValueChange={(value) =>
          patchFilters({ categoryCode: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Engineering category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {divisions?.engineeringCategories.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.domainCode ?? "all"}
        onValueChange={(value) =>
          patchFilters({ domainCode: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Application domain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All domains</SelectItem>
          {divisions?.applicationDomains.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" onClick={clearFilters}>
        Clear
      </Button>
    </div>
  );
}
