"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { parseCatalogSort, type CatalogSort, type StarterVideoCatalogFilters } from "../types";

const DEFAULT_PAGE_SIZE = 40;
const DEFAULT_SORT: CatalogSort = "published_desc";

const QUERY_KEYS = [
  "q",
  "categoryCode",
  "domainCode",
  "difficulty",
  "contentForm",
  "sort",
] as const;

type CatalogFilterPatch = Partial<Omit<StarterVideoCatalogFilters, "pageSize">>;

type CatalogFilters = StarterVideoCatalogFilters & { sort: CatalogSort };

type CatalogFiltersContextValue = {
  filters: CatalogFilters;
  patchFilters: (patch: CatalogFilterPatch) => void;
  clearFilters: () => void;
};

const CatalogFiltersContext = createContext<CatalogFiltersContextValue | null>(null);

export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const patchFilters = useCallback(
    (patch: CatalogFilterPatch) => {
      const merged: StarterVideoCatalogFilters = {
        ...filters,
        ...patch,
        page: patch.page ?? 1,
        pageSize: DEFAULT_PAGE_SIZE,
      };
      const query = queryFromFilters(merged);
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

function filtersFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
): CatalogFilters {
  return {
    q: searchParams.get("q") ?? undefined,
    categoryCode: searchParams.get("categoryCode") ?? undefined,
    domainCode: searchParams.get("domainCode") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    contentForm: searchParams.get("contentForm") ?? undefined,
    sort: parseCatalogSort(searchParams.get("sort")) ?? DEFAULT_SORT,
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

function queryFromFilters(filters: StarterVideoCatalogFilters): string {
  const params = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = filters[key];
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
