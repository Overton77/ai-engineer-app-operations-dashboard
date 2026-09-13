import type { ShareReport, ShareReportOrganization } from "../types";

const UNCATEGORIZED_LABEL = "Uncategorized";

export function featuredOrganization(
  organizations: ShareReportOrganization[],
): ShareReportOrganization | null {
  return organizations.find((org) => org.isPrimaryFeatured) ?? organizations[0] ?? null;
}

export function organizationsInReadingOrder(
  organizations: ShareReportOrganization[],
): ShareReportOrganization[] {
  return [...organizations].sort((left, right) => {
    if (left.isPrimaryFeatured === right.isPrimaryFeatured) return 0;
    return left.isPrimaryFeatured ? -1 : 1;
  });
}

export function primaryCategoryLabel(report: ShareReport): string {
  return report.taxonomy.primary?.label ?? UNCATEGORIZED_LABEL;
}
