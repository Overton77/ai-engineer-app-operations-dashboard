"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLibraryCategoryVideos } from "../hooks/use-library-category-videos";
import { useTaxonomyDivisions } from "../hooks/use-taxonomy-divisions";
import { formatCount, formatDate } from "../lib/format";
import {
  categoryFolderName,
  libraryReportPath,
  UNCATEGORIZED_CATEGORY_CODE,
  UNCATEGORIZED_SORT_ORDER,
} from "../lib/library-paths";
import type { TaxonomyDivisionOption } from "../types";
import { LibraryNotFound } from "./library-not-found";
import { WatchOnYouTube } from "./watch-on-youtube";

function uncategorizedDefinition(): TaxonomyDivisionOption {
  return {
    code: UNCATEGORIZED_CATEGORY_CODE,
    label: "Uncategorized",
    appliedVideoCount: 0,
    description: "Finished talks that do not yet have a primary engineering-category assignment.",
    inclusionCriteria: [],
    exclusionCriteria: [],
    exampleTopics: [],
    sortOrder: UNCATEGORIZED_SORT_ORDER,
  };
}

export function LibraryCategoryVideos({ categoryCode }: { categoryCode: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [searchDraft, setSearchDraft] = useState(q ?? "");

  const taxonomy = useTaxonomyDivisions();
  const catalog = useLibraryCategoryVideos({ categoryCode, q, page });

  useEffect(() => {
    setSearchDraft(q ?? "");
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim() || undefined;
      if (next === q) return;
      const params = new URLSearchParams();
      if (next) params.set("q", next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [pathname, q, router, searchDraft]);

  const category = useMemo(() => {
    const official = taxonomy.data?.engineeringCategories.find((item) => item.code === categoryCode);
    if (official) return official;
    if (categoryCode === UNCATEGORIZED_CATEGORY_CODE) return uncategorizedDefinition();
    return null;
  }, [categoryCode, taxonomy.data]);

  if (taxonomy.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  if (taxonomy.error || !taxonomy.data) {
    return <p className="text-sm text-destructive">Could not load this library category.</p>;
  }

  if (!category) {
    return (
      <LibraryNotFound
        title="Category not found"
        body="That folder is not an official engineering category, and it is not the uncategorized shelf."
      />
    );
  }

  const pageCount = catalog.data
    ? Math.max(1, Math.ceil(catalog.data.total / catalog.data.pageSize))
    : 1;
  const folder = categoryFolderName(category.sortOrder ?? UNCATEGORIZED_SORT_ORDER, category.code);

  const writePage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          <Link href="/research-capability/library" className="hover:text-foreground">
            Library
          </Link>
          <span> / {category.label}</span>
        </p>
        <p className="font-mono text-xs text-muted-foreground">{folder}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{category.label}</h1>
        {category.description ? (
          <p className="max-w-3xl leading-7 text-muted-foreground">{category.description}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {formatCount(catalog.data?.total ?? category.appliedVideoCount)} finished videos
        </p>
      </div>

      <CategoryDefinitionLists category={category} />

      <Input
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        placeholder="Search within this category"
      />

      {catalog.isLoading ? (
        <Skeleton className="h-[420px] w-full" />
      ) : catalog.error || !catalog.data ? (
        <p className="text-sm text-destructive">Could not load finished videos for this category.</p>
      ) : catalog.data.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {q ? "No finished videos match that search." : "No finished videos yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Featured organization</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Watch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.data.rows.map((row) => (
                <TableRow key={row.videoId}>
                  <TableCell>
                    <Link
                      href={libraryReportPath(categoryCode, row.videoId)}
                      className="font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{row.videoId}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.primaryOrganizationName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{row.contentForm ?? "—"}</TableCell>
                  <TableCell className="text-sm">{row.difficulty ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(row.publishedAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <WatchOnYouTube videoId={row.videoId} storedUrl={row.url} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => writePage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= pageCount}
              onClick={() => writePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryDefinitionLists({ category }: { category: TaxonomyDivisionOption }) {
  const lists = [
    { title: "Include", items: category.inclusionCriteria ?? [] },
    { title: "Exclude", items: category.exclusionCriteria ?? [] },
    { title: "Example topics", items: category.exampleTopics ?? [] },
  ].filter((list) => list.items.length > 0);

  if (lists.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {lists.map((list) => (
        <div key={list.title}>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{list.title}</p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
            {list.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
