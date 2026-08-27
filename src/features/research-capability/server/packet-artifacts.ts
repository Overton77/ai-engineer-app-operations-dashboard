import type { PreResearchArtifact } from "@aiengineer/database-contract/pre-research";
import type { PacketArtifactBody } from "../types";
import { queryResearchCapability } from "./postgres";
import { downloadResearchObject } from "./supabase-storage";

const ARTIFACT_KIND_FILES: Record<string, string> = {
  run_manifest: "00-run-manifest.json",
  transcript_analysis: "10-transcript-analysis.json",
  taxonomy_classification: "20-taxonomy-classification.json",
  web_context: "30-web-context.json",
  organization_research: "35-organization-research.json",
  source_verification: "40-source-verification.json",
  curriculum_signals: "50-curriculum-signals.json",
  initial_summary: "initial-summary/60-initial-summary.json",
  technology_library_summary: "technology-library-summary/70-technology-library-summary.json",
  organization_profile: "organization-profile/80-organization-profile.json",
  ingestion_intent: "90-ingestion-intent.json",
  execution_receipt: "99-execution-receipt.json",
};

export async function readPacketArtifact(options: {
  videoId: string;
  runId: string;
  artifactKind: string;
}): Promise<PacketArtifactBody | null> {
  const [registered] = await queryResearchCapability<
    Pick<PreResearchArtifact, "storage_bucket" | "storage_path" | "artifact_kind">
  >(
    `select storage_bucket, storage_path, artifact_kind
     from public.research_pre_research_artifact
     where run_id = $1 and artifact_kind = $2`,
    [options.runId, options.artifactKind],
  );

  const fallbackFile = ARTIFACT_KIND_FILES[options.artifactKind];
  const storageBucket = registered?.storage_bucket ?? "research-ingestion-intents";
  const storagePath =
    registered?.storage_path ??
    (fallbackFile
      ? `pre-research/v2/${options.videoId}/${options.runId}/${fallbackFile}`
      : null);

  if (!storagePath) return null;

  const body = await downloadResearchObject({
    bucket: storageBucket,
    path: storagePath,
  });

  return {
    artifactKind: options.artifactKind,
    storageBucket,
    storagePath,
    json: JSON.parse(body) as unknown,
  };
}
