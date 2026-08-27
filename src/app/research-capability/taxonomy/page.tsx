"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaxonomyDivisions } from "@/features/research-capability/hooks/use-taxonomy-divisions";
import type { TaxonomyDivisionOption } from "@/features/research-capability/types";

export default function TaxonomyDivisionsPage() {
  const { data, isLoading, error } = useTaxonomyDivisions();

  if (isLoading) return <Skeleton className="h-[640px] w-full" />;
  if (error || !data) {
    return <p className="text-sm text-destructive">Could not load taxonomy divisions.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Research capability
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Taxonomy divisions</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Counts are applied videos, not the raw catalog. Click a category or domain to open
          the starter-video catalog filtered to that division.
        </p>
      </div>
      <DivisionBoard
        title="Engineering categories"
        items={data.engineeringCategories}
        hrefFor={(code) => `/research-capability?categoryCode=${encodeURIComponent(code)}`}
        libraryHrefFor={(code) => `/research-capability/library/${encodeURIComponent(code)}`}
      />
      <DivisionBoard
        title="Application domains"
        items={data.applicationDomains}
        hrefFor={(code) => `/research-capability?domainCode=${encodeURIComponent(code)}`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <DivisionBoard title="Content form" items={data.contentForms} />
        <DivisionBoard title="Difficulty" items={data.difficulties} />
        <DivisionBoard title="Lifecycle" items={data.lifecycleStages} />
      </div>
      <DivisionBoard title="Organization domains" items={data.organizationDomains} />
    </div>
  );
}

function DivisionBoard({
  title,
  items,
  hrefFor,
  libraryHrefFor,
}: {
  title: string;
  items: TaxonomyDivisionOption[];
  hrefFor?: (code: string) => string;
  libraryHrefFor?: (code: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const content = (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span>{item.label}</span>
              <span className="font-mono text-muted-foreground">{item.appliedVideoCount}</span>
            </div>
          );
          return (
            <div key={item.code} className="flex items-center justify-between gap-4">
              {hrefFor ? (
                <Link href={hrefFor(item.code)} className="min-w-0 flex-1 hover:text-foreground">
                  {content}
                </Link>
              ) : (
                <div className="min-w-0 flex-1">{content}</div>
              )}
              {libraryHrefFor ? (
                <Link
                  href={libraryHrefFor(item.code)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Library
                </Link>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
