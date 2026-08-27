export const UNCATEGORIZED_CATEGORY_CODE = "uncategorized";
export const UNCATEGORIZED_SORT_ORDER = 999;
export const LIBRARY_PAGE_SIZE = 40;

export function categoryFolderName(sortOrder: number, categoryCode: string) {
  const order = String(Math.floor(sortOrder / 10) || sortOrder).padStart(2, "0");
  return `${order}-${categoryCode}`;
}

export function canonicalLibraryCategoryCode(primaryCategoryCode: string | null | undefined) {
  return primaryCategoryCode?.trim() || UNCATEGORIZED_CATEGORY_CODE;
}

export function libraryCategoryPath(categoryCode: string) {
  return `/research-capability/library/${encodeURIComponent(categoryCode)}`;
}

export function libraryReportPath(categoryCode: string, videoId: string) {
  return `${libraryCategoryPath(categoryCode)}/${encodeURIComponent(videoId)}`;
}

export function pipelineWorkspacePath(videoId: string) {
  return `/research-capability/videos/${encodeURIComponent(videoId)}`;
}
