"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { Calendar, Clock, Eye, Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactCount, formatDate, formatDuration } from "../lib/format";
import { featuredOrganization, primaryCategoryLabel } from "../lib/showcase-report";
import type { ShareReport, ShareReportOrganization } from "../types";
import { iconForCategory, OrgMark } from "./org-tech-icons";
import { WatchOnYouTube } from "./watch-on-youtube";

export function ShowcaseHeader({ report }: { report: ShareReport }) {
  const featured = featuredOrganization(report.organizations);
  const { label: categoryLabel, Icon: CategoryIcon } = categoryPresentation(report);

  return (
    <header className="flex max-w-3xl flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Talks
        </Link>
        {" / "}
        <span className="text-foreground">{report.video.title}</span>
      </p>
      <TalkThumbnail src={report.video.thumbnailUrl} title={report.video.title} />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{report.video.title}</h1>
      <div>
        <WatchOnYouTube
          videoId={report.video.videoId}
          storedUrl={report.video.url}
          className={cn(buttonVariants({ size: "lg" }))}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Meta icon={Calendar} label={formatDate(report.video.publishedAt)} />
        <Meta icon={Clock} label={formatDuration(report.video.durationSeconds)} />
        <Meta icon={Eye} label={formatCompactCount(report.video.viewCount)} />
        <Meta icon={Heart} label={formatCompactCount(report.video.likeCount)} />
        {featured ? <FeaturedOrgMeta org={featured} /> : null}
        <span className="inline-flex items-center gap-1.5">
          <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
          <span>{categoryLabel}</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Research as of {formatDate(report.pipeline.researchAsOf)}
      </p>
    </header>
  );
}

function TalkThumbnail({ src, title }: { src: string | null; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <img
      src={src}
      alt=""
      title={title}
      className="aspect-video w-full max-w-sm rounded-md object-cover"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function categoryPresentation(report: ShareReport) {
  return {
    label: primaryCategoryLabel(report),
    Icon: iconForCategory(
      report.taxonomy.primary?.categoryCode ?? report.taxonomy.primary?.label,
    ),
  };
}

function FeaturedOrgMeta({ org }: { org: ShareReportOrganization }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <OrgMark name={org.canonicalName} />
      <span>{org.canonicalName}</span>
    </span>
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
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
