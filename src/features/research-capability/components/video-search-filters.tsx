"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCatalogFilters } from "../context/catalog-filters-context";
import { useTaxonomyDivisions } from "../hooks/use-taxonomy-divisions";
import { parseCatalogSort, type CatalogSort, type TaxonomyDivisionOption } from "../types";

const SEARCH_DEBOUNCE_MS = 300;
const UNSET_SELECT_VALUE = "all";

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: "published_desc", label: "Published newest" },
  { value: "published_asc", label: "Published oldest" },
  { value: "views_desc", label: "Most views" },
  { value: "likes_desc", label: "Most likes" },
];

export function VideoSearchFilters() {
  const { filters, patchFilters, clearFilters } = useCatalogFilters();
  const { data: divisions } = useTaxonomyDivisions();
  const [searchDraft, setSearchDraft] = useDebouncedSearchDraft(filters.q, patchFilters);
  const sort = filters.sort;

  const categories = divisions?.engineeringCategories ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="title, organization, or technology"
            className="pl-8"
            aria-label="Search talks"
          />
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0 justify-between sm:min-w-44">
              <SlidersHorizontal data-icon="inline-start" />
              {sortOptionLabel(sort)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => {
                const next = parseCatalogSort(value);
                if (next) patchFilters({ sort: next });
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Category
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:flex-wrap">
          <FilterChip
            label="All"
            selected={!filters.categoryCode}
            onSelect={() => patchFilters({ categoryCode: undefined })}
          />
          {categories.map((option) => (
            <FilterChip
              key={option.code}
              label={option.label}
              selected={filters.categoryCode === option.code}
              onSelect={() =>
                patchFilters({
                  categoryCode: toggledCode(filters.categoryCode, option.code),
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TaxonomySelect
          value={filters.domainCode}
          placeholder="All domains"
          options={divisions?.applicationDomains ?? []}
          onChange={(domainCode) => patchFilters({ domainCode })}
        />
        <TaxonomySelect
          value={filters.difficulty}
          placeholder="All levels"
          options={divisions?.difficulties ?? []}
          onChange={(difficulty) => patchFilters({ difficulty })}
        />
        <TaxonomySelect
          value={filters.contentForm}
          placeholder="All forms"
          options={divisions?.contentForms ?? []}
          onChange={(contentForm) => patchFilters({ contentForm })}
        />
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function useDebouncedSearchDraft(
  query: string | undefined,
  commitQuery: (patch: { q: string | undefined }) => void,
) {
  const [draft, setDraft] = useState(query ?? "");
  const commitRef = useRef(commitQuery);
  commitRef.current = commitQuery;

  useEffect(() => {
    setDraft(query ?? "");
  }, [query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = draft.trim() || undefined;
      if (next !== query) commitRef.current({ q: next });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [draft, query]);

  return [draft, setDraft] as const;
}

function sortOptionLabel(sort: CatalogSort): string {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? SORT_OPTIONS[0].label;
}

function toggledCode(current: string | undefined, code: string): string | undefined {
  return current === code ? undefined : code;
}

function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full border px-2.5 text-[13px] transition-colors",
        selected
          ? "border-foreground/35 bg-accent text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function TaxonomySelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string | undefined;
  placeholder: string;
  options: TaxonomyDivisionOption[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? UNSET_SELECT_VALUE}
      onValueChange={(next) => onChange(next === UNSET_SELECT_VALUE ? undefined : next)}
    >
      <SelectTrigger size="sm" className="min-w-36">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET_SELECT_VALUE}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
