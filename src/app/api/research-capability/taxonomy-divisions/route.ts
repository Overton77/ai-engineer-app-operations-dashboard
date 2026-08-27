import { jsonData, jsonError } from "@/features/research-capability/server/http";
import { readTaxonomyDivisions } from "@/features/research-capability/server/taxonomy-divisions";

export async function GET() {
  try {
    return jsonData(await readTaxonomyDivisions());
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "TAXONOMY_DIVISIONS_FAILED", 500);
  }
}
