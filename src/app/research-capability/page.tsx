import { CatalogFiltersProvider } from "@/features/research-capability/context/catalog-filters-context";
import { CatalogFilterBar } from "@/features/research-capability/components/catalog-filter-bar";
import { PipelineProgressBanner } from "@/features/research-capability/components/pipeline-progress-banner";
import { StarterVideoCatalog } from "@/features/research-capability/components/starter-video-catalog";
import { TaxonomyDivisionRail } from "@/features/research-capability/components/taxonomy-division-rail";

export default function ResearchCapabilityPage() {
  return (
    <CatalogFiltersProvider>
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Research capability
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Starter videos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each row is a YouTube talk the pre-research agent can claim. Completed means the
            executor applied the intent and projected pipeline finish.
          </p>
        </div>
        <PipelineProgressBanner />
        <TaxonomyDivisionRail />
        <CatalogFilterBar />
        <StarterVideoCatalog />
      </div>
    </CatalogFiltersProvider>
  );
}
