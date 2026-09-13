"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogFiltersProvider, useCatalogFilters } from "../context/catalog-filters-context";
import { useStarterVideoCatalog } from "../hooks/use-starter-video-catalog";
import { formatCount } from "../lib/format";
import { VideoResultCard } from "./video-result-card";
import { VideoSearchFilters } from "./video-search-filters";

const SKELETON_CARD_COUNT = 6;

export function VideoSearchPage() {
  return (
    <CatalogFiltersProvider>
      <div className="flex flex-col gap-8">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Pre-research
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">AI Engineer talks</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Finished pre-research briefs for AI Engineer conference videos. Search a talk, then
            read the report.
          </p>
        </header>
        <VideoSearchFilters />
        <VideoSearchResults />
      </div>
    </CatalogFiltersProvider>
  );
}

function VideoSearchResults() {
  const { data, isLoading, error } = useStarterVideoCatalog();
  const { filters, patchFilters } = useCatalogFilters();

  if (isLoading) {
    return <CatalogSkeletonGrid />;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Could not load talks.</p>;
  }

  if (data.rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No talks match these filters.</p>;
  }

  const pageCount = catalogPageCount(data.total, data.pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>{formatCount(data.total)} talks</p>
        <p>
          Page {data.page} of {pageCount}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.rows.map((row) => (
          <VideoResultCard key={row.videoId} row={row} />
        ))}
      </div>
      <CatalogPagination
        page={filters.page}
        pageCount={pageCount}
        onPageChange={(page) => patchFilters({ page })}
      />
    </div>
  );
}

function CatalogPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <Button
        variant="outline"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

function CatalogSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <CatalogCardSkeleton key={index} />
      ))}
    </div>
  );
}

function CatalogCardSkeleton() {
  return (
    <div className="p-2">
      <Skeleton className="aspect-video w-full rounded-md" />
      <Skeleton className="mt-3 h-4 w-5/6" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

function catalogPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
