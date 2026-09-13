"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { Calendar, Clock, Eye, Heart } from "lucide-react";
import { formatCompactCount, formatDate, formatDuration } from "../lib/format";
import { videoShowcasePath } from "../lib/library-paths";
import type { StarterVideoCatalogRow } from "../types";
import { iconForCategory, OrgMark } from "./org-tech-icons";
import { WatchOnYouTube } from "./watch-on-youtube";

export function VideoResultCard({ row }: { row: StarterVideoCatalogRow }) {
  const reportHref = videoShowcasePath(row.videoId);
  const CategoryIcon = iconForCategory(row.primaryCategoryCode ?? row.primaryCategoryLabel);

  return (
    <article className="group relative rounded-lg p-2 transition-colors hover:bg-accent/60">
      <VideoThumbnail src={row.thumbnailUrl} alt={row.title} />
      <h2 className="mt-3 line-clamp-2 text-sm font-medium leading-snug tracking-tight">
        <Link href={reportHref} className="after:absolute after:inset-0">
          {row.title}
        </Link>
      </h2>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        {row.primaryOrganizationName ? (
          <span className="inline-flex items-center gap-1.5">
            <OrgMark name={row.primaryOrganizationName} />
            <span className="truncate">{row.primaryOrganizationName}</span>
          </span>
        ) : null}
        {row.primaryCategoryLabel ? (
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{row.primaryCategoryLabel}</span>
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Meta icon={Eye} label={formatCompactCount(row.viewCount)} />
        <Meta icon={Heart} label={formatCompactCount(row.likeCount)} />
        <Meta icon={Calendar} label={formatDate(row.publishedAt)} />
        <Meta icon={Clock} label={formatDuration(row.durationSeconds)} />
      </div>
      <div className="relative z-10 mt-2 text-xs text-muted-foreground group-hover:text-foreground">
        <WatchOnYouTube
          videoId={row.videoId}
          storedUrl={row.url}
          className="hover:underline"
        />
      </div>
    </article>
  );
}

function VideoThumbnail({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="aspect-video w-full rounded-md bg-muted" aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="aspect-video w-full rounded-md object-cover"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function Meta({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}
