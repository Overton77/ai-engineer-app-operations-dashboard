"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { StarterVideoCatalogFilters } from "../types";

type CatalogFilterPatch = Partial<Omit<StarterVideoCatalogFilters, "pageSize">> & {
  page?: number;
};

type CatalogFiltersContextValue = {
  filters: StarterVideoCatalogFilters;
  patchFilters: (patch: CatalogFilterPatch) => void;
  clearFilters: () => void;
};

const CatalogFiltersContext = createContext<CatalogFiltersContextValue | null>(null);

function readBoolean(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<StarterVideoCatalogFilters>(
    () => ({
      q: searchParams.get("q") ?? undefined,
      pipelineStatus: searchParams.get("pipelineStatus") ?? undefined,
      finished: readBoolean(searchParams.get("finished")),
      categoryCode: searchParams.get("categoryCode") ?? undefined,
      domainCode: searchParams.get("domainCode") ?? undefined,
      difficulty: searchParams.get("difficulty") ?? undefined,
      contentForm: searchParams.get("contentForm") ?? undefined,
      page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
      pageSize: 40,
    }),
    [searchParams],
  );

  const patchFilters = useCallback(
    (patch: CatalogFilterPatch) => {
      const merged: StarterVideoCatalogFilters = {
        ...filters,
        ...patch,
        page: patch.page ?? 1,
        pageSize: 40,
      };
      const next = new URLSearchParams();
      const write = (key: string, value: string | boolean | number | undefined) => {
        if (value === undefined || value === "") return;
        next.set(key, String(value));
      };

      write("q", merged.q);
      write("pipelineStatus", merged.pipelineStatus);
      write("finished", merged.finished);
      write("categoryCode", merged.categoryCode);
      write("domainCode", merged.domainCode);
      write("difficulty", merged.difficulty);
      write("contentForm", merged.contentForm);
      if (merged.page > 1) write("page", merged.page);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [filters, pathname, router],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  return (
    <CatalogFiltersContext.Provider value={{ filters, patchFilters, clearFilters }}>
      {children}
    </CatalogFiltersContext.Provider>
  );
}

export function useCatalogFilters() {
  const value = useContext(CatalogFiltersContext);
  if (!value) {
    throw new Error("useCatalogFilters must be used inside CatalogFiltersProvider");
  }
  return value;
}
