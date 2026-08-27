"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelineProgress } from "../hooks/use-pipeline-progress";
import { formatCount } from "../lib/format";

export function PipelineProgressBanner() {
  const { data, isLoading, error } = usePipelineProgress();

  if (isLoading) {
    return <Skeleton className="h-28 w-full" />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-destructive">
          Could not load pipeline progress.
        </CardContent>
      </Card>
    );
  }

  const percent =
    data.qualifiedVideoCount === 0
      ? 0
      : Math.round((data.finishedVideoCount / data.qualifiedVideoCount) * 100);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Pre-research pipeline
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatCount(data.finishedVideoCount)}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                of {formatCount(data.qualifiedVideoCount)} qualified videos completed
              </span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCount(data.catalogVideoCount)} videos in the starter catalog
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {data.statusCounts.map((row) => (
            <span key={row.pipelineStatus}>
              {row.pipelineStatus.replaceAll("_", " ")} {formatCount(row.videoCount)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
