"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibraryFinishedSearch } from "../hooks/use-library-category-videos";
import { useTaxonomyDivisions } from "../hooks/use-taxonomy-divisions";
import { formatCount } from "../lib/format";
import {
  canonicalLibraryCategoryCode,
  categoryFolderName,
  libraryCategoryPath,
  libraryReportPath,
  UNCATEGORIZED_SORT_ORDER,
} from "../lib/library-paths";

export function LibraryCategoryIndex() {
  const { data, isLoading, error } = useTaxonomyDivisions();
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const finishedSearch = useLibraryFinishedSearch(searchQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchQuery(searchDraft.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  if (isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Could not load the pre-research library.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Pre-research library
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pre-research library</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Finished talks grouped by primary engineering category. Click a category, then a talk.
          Watch the official video from any report.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search finished talks by title, video id, organization, or technology"
        />
        {searchQuery.length > 1 ? (
          <div className="rounded-xl border border-border p-4">
            {finishedSearch.isLoading ? (
              <p className="text-sm text-muted-foreground">Searching finished talks…</p>
            ) : finishedSearch.data && finishedSearch.data.rows.length > 0 ? (
              <ul className="space-y-2">
                {finishedSearch.data.rows.map((row) => (
                  <li key={row.videoId}>
                    <Link
                      href={libraryReportPath(
                        canonicalLibraryCategoryCode(row.primaryCategoryCode),
                        row.videoId,
                      )}
                      className="text-sm font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {row.primaryCategoryLabel ?? "Uncategorized"}
                      {row.primaryOrganizationName ? ` · ${row.primaryOrganizationName}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No finished talks match that search.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.engineeringCategories.map((category) => {
          const folder = categoryFolderName(
            category.sortOrder ?? UNCATEGORIZED_SORT_ORDER,
            category.code,
          );
          return (
            <Link
              key={category.code}
              href={libraryCategoryPath(category.code)}
              className="rounded-xl border border-border p-5 hover:bg-muted/40"
            >
              <p className="font-mono text-xs text-muted-foreground">{folder}</p>
              <h2 className="mt-2 text-lg font-medium">{category.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCount(category.appliedVideoCount)} finished
              </p>
              {category.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
