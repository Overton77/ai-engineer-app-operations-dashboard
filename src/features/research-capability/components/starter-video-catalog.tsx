"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalogFilters } from "../context/catalog-filters-context";
import { useStarterVideoCatalog } from "../hooks/use-starter-video-catalog";
import { formatDate, formatDuration, formatStatus } from "../lib/format";

export function StarterVideoCatalog() {
  const { data, isLoading, error } = useStarterVideoCatalog();
  const { filters, patchFilters } = useCatalogFilters();

  if (isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Could not load the starter-video catalog.</p>;
  }

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {data.total} videos match the current filters
        </p>
        <p>
          Page {data.page} of {pageCount}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video</TableHead>
            <TableHead>Pipeline</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead className="text-right">Published</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row) => (
            <TableRow key={row.videoId}>
              <TableCell>
                <Link
                  href={`/research-capability/videos/${encodeURIComponent(row.videoId)}`}
                  className="font-medium hover:underline"
                >
                  {row.title}
                </Link>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{row.videoId}</span>
                  <span>{formatDuration(row.durationSeconds)}</span>
                  {row.contentForm ? <span>{row.contentForm}</span> : null}
                  {row.difficulty ? <span>{row.difficulty}</span> : null}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={row.pipelineFinished ? "default" : "outline"}>
                  {row.pipelineFinished ? "completed" : formatStatus(row.pipelineStatus)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {row.primaryCategoryLabel ?? "—"}
              </TableCell>
              <TableCell className="text-sm">{row.primaryDomainLabel ?? "—"}</TableCell>
              <TableCell className="text-sm">
                {row.primaryOrganizationName ?? "—"}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatDate(row.publishedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={filters.page <= 1}
          onClick={() => patchFilters({ page: filters.page - 1 })}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={filters.page >= pageCount}
          onClick={() => patchFilters({ page: filters.page + 1 })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
