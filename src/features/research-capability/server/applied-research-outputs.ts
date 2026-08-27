import type { AppliedResearchOutputs } from "../types";
import { queryResearchCapability } from "./postgres";
import { serializeRow } from "./serialize";

export async function readAppliedResearchOutputs(options: {
  videoId: string;
  runId?: string;
}): Promise<AppliedResearchOutputs> {
  const [state] = await queryResearchCapability<{ latest_run_id: string | null }>(
    `select latest_run_id
     from public.research_pre_research_video_state
     where video_id = $1`,
    [options.videoId],
  );

  const [fallbackRun] = await queryResearchCapability<{ run_id: string }>(
    `select run_id
     from public.research_pre_research_run
     where video_id = $1
     order by created_at desc
     limit 1`,
    [options.videoId],
  );

  const selectedRunId = options.runId ?? state?.latest_run_id ?? fallbackRun?.run_id ?? null;
  if (!selectedRunId) {
    return emptyOutputs(null);
  }

  const [analysis] = await queryResearchCapability<Record<string, unknown>>(
    `select
       analysis_id, run_id, video_id, initial_summary, structured_summary,
       contextualized_abstract, why_it_matters, key_takeaways, concepts, prerequisites,
       learning_outcomes, limitations, difficulty, content_form, evidence_level,
       overall_confidence, generated_at
     from public.research_video_analysis
     where run_id = $1`,
    [selectedRunId],
  );

  const analysisId = analysis ? String(analysis.analysis_id) : null;

  const [
    initialSummary,
    technologyFamilies,
    categoryAssignments,
    domainAssignments,
    lifecycleAssignments,
    organizations,
    entities,
    resources,
    evidenceAnchors,
    intent,
    artifacts,
    webSearches,
  ] = await Promise.all([
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             analysis_id, video_id, transcript_summary, software_engineering_concepts,
             ai_concepts, external_context_notes, temporal_context, research_as_of,
             evidence_ids, generated_at
           from public.research_video_initial_summary
           where analysis_id = $1`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             technology_summary_id, analysis_id, video_id, family_rank, family_label,
             primary_technology, primary_technology_kind, related_technologies, implementations,
             summary, relationship_rationale, role_in_video, current_status, temporal_status,
             official_urls, confidence, generated_at
           from public.research_video_technology_summary
           where analysis_id = $1
           order by family_rank`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select analysis_id, category_code, assignment_role, confidence, rationale
           from public.research_video_category
           where analysis_id = $1
           order by assignment_role, category_code`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select analysis_id, domain_code, confidence, rationale
           from public.research_video_domain
           where analysis_id = $1
           order by confidence desc`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select analysis_id, lifecycle_stage
           from public.research_video_lifecycle
           where analysis_id = $1
           order by lifecycle_stage`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             organization_candidate_id, analysis_id, video_id, canonical_name, normalized_name,
             organization_scope, relationship_roles, is_primary_featured, featured_rank,
             primary_domain_code, secondary_domain_codes, parent_name, official_url,
             authoritative_summary, current_status, confidence
           from public.research_organization_candidate
           where analysis_id = $1
           order by featured_rank`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             candidate_id, analysis_id, entity_kind, name, canonical_url,
             organization_name, relationship_to_video, confidence, verification_status
           from public.research_entity_candidate
           where analysis_id = $1
           order by entity_kind, name`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             resource_candidate_id, analysis_id, resource_type, title, url, publisher,
             relationship_to_video, why_valuable, verification_status, is_first_party
           from public.research_resource_candidate
           where analysis_id = $1
           order by resource_type, title`,
          [analysisId],
        )
      : Promise.resolve([]),
    analysisId
      ? queryResearchCapability<Record<string, unknown>>(
          `select
             evidence_id, analysis_id, source_kind, source_url, start_seconds, end_seconds,
             short_excerpt, supports
           from public.research_evidence_anchor
           where analysis_id = $1
           order by start_seconds nulls last, evidence_id`,
          [analysisId],
        )
      : Promise.resolve([]),
    queryResearchCapability<Record<string, unknown>>(
      `select
         intent_id, run_id, video_id, schema_version, storage_bucket, storage_path,
         content_sha256, status, validated_at, applied_at, rejected_at, created_at
       from public.research_ingestion_intent
       where run_id = $1`,
      [selectedRunId],
    ),
    queryResearchCapability<Record<string, unknown>>(
      `select
         artifact_id, run_id, artifact_kind, schema_version, storage_bucket,
         storage_path, content_sha256, byte_count, created_at
       from public.research_pre_research_artifact
       where run_id = $1
       order by artifact_kind`,
      [selectedRunId],
    ),
    queryResearchCapability<Record<string, unknown>>(
      `select
         search_event_id, run_id, subagent, query, provider, searched_at,
         result_urls, selected_urls, search_purpose
       from public.research_web_search_event
       where run_id = $1
       order by searched_at`,
      [selectedRunId],
    ),
  ]);

  const organizationIds = organizations.map((org) => String(org.organization_candidate_id));
  const organizationSources =
    organizationIds.length > 0
      ? await queryResearchCapability<Record<string, unknown>>(
          `select
             organization_source_id, organization_candidate_id, source_rank, source_role,
             authority_tier, title, publisher, url, verification_status, is_required_core_source
           from public.research_organization_source
           where organization_candidate_id = any($1::uuid[])
           order by source_rank`,
          [organizationIds],
        )
      : [];

  const selectedIntent = intent[0] ?? null;
  const intentEvents = selectedIntent
    ? await queryResearchCapability<Record<string, unknown>>(
        `select
           event_id, intent_id, operation_index, operation_kind, status,
           affected_table, affected_key, error_detail, created_at
         from public.research_ingestion_intent_event
         where intent_id = $1
         order by operation_index`,
        [selectedIntent.intent_id],
      )
    : [];

  return {
    selectedRunId,
    analysis: analysis ? serializeRow(analysis) : null,
    initialSummary: initialSummary[0] ? serializeRow(initialSummary[0]) : null,
    technologyFamilies: technologyFamilies.map(serializeRow),
    categoryAssignments: categoryAssignments.map(serializeRow),
    domainAssignments: domainAssignments.map(serializeRow),
    lifecycleAssignments: lifecycleAssignments.map(serializeRow),
    organizations: organizations.map(serializeRow),
    organizationSources: organizationSources.map(serializeRow),
    evidenceAnchors: evidenceAnchors.map(serializeRow),
    entities: entities.map(serializeRow),
    resources: resources.map(serializeRow),
    intent: selectedIntent ? serializeRow(selectedIntent) : null,
    intentEvents: intentEvents.map(serializeRow),
    artifacts: artifacts.map(serializeRow),
    webSearches: webSearches.map(serializeRow),
  };
}

function emptyOutputs(selectedRunId: string | null): AppliedResearchOutputs {
  return {
    selectedRunId,
    analysis: null,
    initialSummary: null,
    technologyFamilies: [],
    categoryAssignments: [],
    domainAssignments: [],
    lifecycleAssignments: [],
    organizations: [],
    organizationSources: [],
    evidenceAnchors: [],
    entities: [],
    resources: [],
    intent: null,
    intentEvents: [],
    artifacts: [],
    webSearches: [],
  };
}
