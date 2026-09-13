import type { ShareReport } from "../types";
import { catalogChannelScopeSql } from "../lib/research-channels";
import { youtubeWatchUrl } from "../lib/youtube";
import { queryResearchCapability } from "./postgres";
import { asBoolean, asDateOnly, asIso, asNumber, asStringArray, asText } from "./serialize";

type EligibleVideoRow = {
  video_id: string;
  title: string;
  description: string | null;
  url: string | null;
  published_at: Date | string | null;
  channel_title: string | null;
  duration_seconds: number | null;
  view_count: number | null;
  like_count: number | null;
  thumbnail_url: string | null;
  run_id: string;
  analysis_id: string | null;
  finished_at: Date | string | null;
  research_as_of: Date | string | null;
  model_id: string | null;
  prompt_bundle_version: string | null;
  initial_summary: unknown;
  contextualized_abstract: string | null;
  why_it_matters: string | null;
  key_takeaways: unknown;
  prerequisites: unknown;
  learning_outcomes: unknown;
  curriculum_roles: unknown;
  challenge_seeds: unknown;
  difficulty: string | null;
  content_form: string | null;
  evidence_level: string | null;
  overall_confidence: string | number | null;
};

type CategoryRow = {
  category_code: string;
  assignment_role: string;
  confidence: string | number | null;
  rationale: string | null;
  label: string;
};

type DomainRow = {
  domain_code: string;
  confidence: string | number | null;
  rationale: string | null;
  label: string;
};

type LifecycleRow = {
  lifecycle_stage: string;
};

type OrganizationRow = {
  organization_candidate_id: string;
  canonical_name: string;
  is_primary_featured: boolean;
  official_url: string | null;
  authoritative_summary: string | null;
  organization_scope: string | null;
  relationship_roles: unknown;
  primary_domain_label: string | null;
  current_status: string | null;
};

type OrganizationSourceRow = {
  organization_candidate_id: string;
  title: string | null;
  url: string | null;
  source_role: string | null;
  authority_tier: string | null;
  verification_status: string | null;
};

type TechnologyRow = {
  family_rank: number | null;
  family_label: string;
  primary_technology: string | null;
  primary_technology_kind: string | null;
  summary: string | null;
  role_in_video: string | null;
  temporal_status: string | null;
  official_urls: unknown;
  confidence: string | number | null;
};

type EntityRow = {
  entity_kind: string;
  name: string;
  canonical_url: string | null;
  verification_status: string | null;
  relationship_to_video: string | null;
};

type ResourceRow = {
  resource_type: string;
  title: string;
  url: string | null;
  why_valuable: string | null;
  verification_status: string | null;
  is_first_party: boolean | null;
};

type EvidenceRow = {
  evidence_id: string;
  source_kind: string;
  short_excerpt: string | null;
  supports: string | null;
};

type WebSearchRow = {
  subagent: string | null;
  query: string | null;
  search_purpose: string | null;
};

type InitialSummaryRow = {
  transcript_summary: string | null;
  temporal_context: string | null;
};

type ShareReportSlices = {
  categories: CategoryRow[];
  domains: DomainRow[];
  lifecycle: LifecycleRow[];
  organizations: OrganizationRow[];
  organizationSources: OrganizationSourceRow[];
  technologies: TechnologyRow[];
  entities: EntityRow[];
  resources: ResourceRow[];
  evidence: EvidenceRow[];
  webSearches: WebSearchRow[];
  initialSummary: InitialSummaryRow | null;
};

const EMPTY_SLICES: ShareReportSlices = {
  categories: [],
  domains: [],
  lifecycle: [],
  organizations: [],
  organizationSources: [],
  technologies: [],
  entities: [],
  resources: [],
  evidence: [],
  webSearches: [],
  initialSummary: null,
};

async function loadLibraryEligibleVideo(videoId: string): Promise<EligibleVideoRow | null> {
  const [video] = await queryResearchCapability<EligibleVideoRow>(
    `select
       v.video_id,
       v.title,
       v.description,
       v.url,
       v.published_at,
       v.channel_title,
       v.duration_seconds,
       v.view_count,
       v.like_count,
       v.thumbnail_url,
       r.run_id,
       a.analysis_id,
       s.pre_research_pipeline_finished_at as finished_at,
       r.research_as_of,
       r.model_id,
       r.prompt_bundle_version,
       a.initial_summary,
       a.contextualized_abstract,
       a.why_it_matters,
       a.key_takeaways,
       a.prerequisites,
       a.learning_outcomes,
       a.curriculum_roles,
       a.challenge_seeds,
       a.difficulty::text as difficulty,
       a.content_form::text as content_form,
       a.evidence_level::text as evidence_level,
       a.overall_confidence
     from public.research_pre_research_video_state s
     join public.research_starter_videos v on v.video_id = s.video_id
     left join public.research_starter_channels c on c.channel_id = v.channel_id
     join public.research_pre_research_run r on r.run_id = s.latest_run_id
     left join public.research_video_analysis a on a.run_id = r.run_id
     where v.video_id = $1
       and s.pre_research_pipeline_finished
       and s.pipeline_status = 'finished'
       and r.status = 'applied'
       and ${catalogChannelScopeSql()}`,
    [videoId],
  );
  return video ?? null;
}

async function loadShareReportSlices(
  analysisId: string | null,
  runId: string,
): Promise<ShareReportSlices> {
  if (!analysisId) {
    const webSearches = await queryResearchCapability<WebSearchRow>(
      `select subagent, query, search_purpose
       from public.research_web_search_event
       where run_id = $1
       order by searched_at`,
      [runId],
    );
    return { ...EMPTY_SLICES, webSearches };
  }

  const [
    categories,
    domains,
    lifecycle,
    organizations,
    technologies,
    entities,
    resources,
    evidence,
    webSearches,
    initialSummaries,
  ] = await Promise.all([
    queryResearchCapability<CategoryRow>(
      `select
         c.category_code::text as category_code,
         c.assignment_role::text as assignment_role,
         c.confidence,
         c.rationale,
         coalesce(d.label, initcap(replace(c.category_code::text, '_', ' '))) as label
       from public.research_video_category c
       left join public.research_category_definition d on d.category_code = c.category_code
       where c.analysis_id = $1
       order by c.assignment_role, c.alternative_rank nulls last, c.category_code`,
      [analysisId],
    ),
    queryResearchCapability<DomainRow>(
      `select
         vd.domain_code,
         vd.confidence,
         vd.rationale,
         coalesce(d.label, initcap(replace(vd.domain_code, '_', ' '))) as label
       from public.research_video_domain vd
       left join public.research_application_domain d on d.domain_code = vd.domain_code
       where vd.analysis_id = $1
       order by vd.confidence desc, vd.domain_code`,
      [analysisId],
    ),
    queryResearchCapability<LifecycleRow>(
      `select lifecycle_stage::text as lifecycle_stage
       from public.research_video_lifecycle
       where analysis_id = $1
       order by lifecycle_stage`,
      [analysisId],
    ),
    queryResearchCapability<OrganizationRow>(
      `select
         oc.organization_candidate_id,
         oc.canonical_name,
         oc.is_primary_featured,
         oc.official_url,
         oc.authoritative_summary,
         oc.organization_scope::text as organization_scope,
         oc.relationship_roles,
         coalesce(od.label, initcap(replace(oc.primary_domain_code::text, '_', ' '))) as primary_domain_label,
         oc.current_status
       from public.research_organization_candidate oc
       left join public.research_organization_domain_definition od
         on od.domain_code = oc.primary_domain_code
       where oc.analysis_id = $1
       order by oc.is_primary_featured desc, oc.featured_rank`,
      [analysisId],
    ),
    queryResearchCapability<TechnologyRow>(
      `select
         family_rank,
         family_label,
         primary_technology,
         primary_technology_kind::text as primary_technology_kind,
         summary,
         role_in_video,
         temporal_status,
         official_urls,
         confidence
       from public.research_video_technology_summary
       where analysis_id = $1
       order by family_rank`,
      [analysisId],
    ),
    queryResearchCapability<EntityRow>(
      `select
         entity_kind::text as entity_kind,
         name,
         canonical_url,
         verification_status::text as verification_status,
         relationship_to_video
       from public.research_entity_candidate
       where analysis_id = $1
       order by entity_kind, name`,
      [analysisId],
    ),
    queryResearchCapability<ResourceRow>(
      `select
         resource_type::text as resource_type,
         title,
         url,
         why_valuable,
         verification_status::text as verification_status,
         is_first_party
       from public.research_resource_candidate
       where analysis_id = $1
       order by resource_type, title`,
      [analysisId],
    ),
    queryResearchCapability<EvidenceRow>(
      `select
         evidence_id,
         source_kind::text as source_kind,
         short_excerpt,
         supports
       from public.research_evidence_anchor
       where analysis_id = $1
       order by start_character nulls last, evidence_id`,
      [analysisId],
    ),
    queryResearchCapability<WebSearchRow>(
      `select subagent, query, search_purpose
       from public.research_web_search_event
       where run_id = $1
       order by searched_at`,
      [runId],
    ),
    queryResearchCapability<InitialSummaryRow>(
      `select transcript_summary, temporal_context
       from public.research_video_initial_summary
       where analysis_id = $1`,
      [analysisId],
    ),
  ]);

  const organizationIds = organizations.map((org) => org.organization_candidate_id);
  const organizationSources =
    organizationIds.length > 0
      ? await queryResearchCapability<OrganizationSourceRow>(
          `select
             organization_candidate_id,
             title,
             url,
             source_role::text as source_role,
             authority_tier::text as authority_tier,
             verification_status::text as verification_status
           from public.research_organization_source
           where organization_candidate_id = any($1::uuid[])
           order by source_rank`,
          [organizationIds],
        )
      : [];

  return {
    categories,
    domains,
    lifecycle,
    organizations,
    organizationSources,
    technologies,
    entities,
    resources,
    evidence,
    webSearches,
    initialSummary: initialSummaries[0] ?? null,
  };
}

function composeAssignment(row: CategoryRow) {
  return {
    categoryCode: row.category_code,
    label: row.label,
    confidence: asNumber(row.confidence),
    rationale: asText(row.rationale),
  };
}

function composeShareReport(video: EligibleVideoRow, slices: ShareReportSlices): ShareReport {
  const primary = slices.categories.find((row) => row.assignment_role === "primary") ?? null;
  const secondary = slices.categories.filter((row) => row.assignment_role === "secondary");
  const sourcesByOrganization = new Map<string, OrganizationSourceRow[]>();
  for (const source of slices.organizationSources) {
    const list = sourcesByOrganization.get(source.organization_candidate_id) ?? [];
    list.push(source);
    sourcesByOrganization.set(source.organization_candidate_id, list);
  }

  return {
    schema: "pre-research-share-report/1.0.0",
    video: {
      videoId: video.video_id,
      title: video.title,
      description: asText(video.description),
      url: youtubeWatchUrl(video.video_id, video.url),
      publishedAt: asIso(video.published_at),
      channelTitle: asText(video.channel_title),
      durationSeconds: asNumber(video.duration_seconds),
      viewCount: asNumber(video.view_count),
      likeCount: asNumber(video.like_count),
      thumbnailUrl: asText(video.thumbnail_url),
    },
    pipeline: {
      runId: video.run_id,
      analysisId: asText(video.analysis_id),
      finishedAt: asIso(video.finished_at),
      researchAsOf: asDateOnly(video.research_as_of),
      modelId: asText(video.model_id),
      promptBundleVersion: asText(video.prompt_bundle_version),
    },
    taxonomy: {
      primary: primary ? composeAssignment(primary) : null,
      secondary: secondary.map(composeAssignment),
      contentForm: asText(video.content_form),
      difficulty: asText(video.difficulty),
      evidenceLevel: asText(video.evidence_level),
      overallConfidence: asNumber(video.overall_confidence),
      domains: slices.domains.map((row) => ({
        domainCode: row.domain_code,
        label: row.label,
        confidence: asNumber(row.confidence),
        rationale: asText(row.rationale),
      })),
      lifecycleStages: slices.lifecycle.map((row) => row.lifecycle_stage),
    },
    summaries: {
      transcriptOnly: asText(video.initial_summary),
      contextualized:
        asText(slices.initialSummary?.transcript_summary) ?? asText(video.contextualized_abstract),
      whyItMatters: asText(video.why_it_matters),
      temporalContext: asText(slices.initialSummary?.temporal_context),
    },
    keyTakeaways: asStringArray(video.key_takeaways),
    organizations: slices.organizations.map((org) => ({
      canonicalName: org.canonical_name,
      isPrimaryFeatured: asBoolean(org.is_primary_featured),
      officialUrl: asText(org.official_url),
      authoritativeSummary: asText(org.authoritative_summary),
      organizationScope: asText(org.organization_scope),
      relationshipRoles: asStringArray(org.relationship_roles),
      primaryDomainLabel: asText(org.primary_domain_label),
      currentStatus: asText(org.current_status),
      sources: (sourcesByOrganization.get(org.organization_candidate_id) ?? []).map((source) => ({
        title: asText(source.title),
        url: asText(source.url),
        sourceRole: asText(source.source_role),
        authorityTier: asText(source.authority_tier),
        verificationStatus: asText(source.verification_status),
      })),
    })),
    technologies: slices.technologies.map((family) => ({
      familyRank: asNumber(family.family_rank),
      familyLabel: family.family_label,
      primaryTechnology: asText(family.primary_technology),
      primaryTechnologyKind: asText(family.primary_technology_kind),
      summary: asText(family.summary),
      roleInVideo: asText(family.role_in_video),
      temporalStatus: asText(family.temporal_status),
      officialUrls: asStringArray(family.official_urls),
      confidence: asNumber(family.confidence),
    })),
    curriculum: {
      recommendedLearnerLevel: asText(video.difficulty),
      prerequisites: asStringArray(video.prerequisites),
      learningOutcomes: asStringArray(video.learning_outcomes),
      curriculumRoles: asStringArray(video.curriculum_roles),
      challengeSeeds: asStringArray(video.challenge_seeds),
    },
    entities: slices.entities.map((row) => ({
      entityKind: row.entity_kind,
      name: row.name,
      canonicalUrl: asText(row.canonical_url),
      verificationStatus: asText(row.verification_status),
      relationshipToVideo: asText(row.relationship_to_video),
    })),
    resources: slices.resources.map((row) => ({
      resourceType: row.resource_type,
      title: row.title,
      url: asText(row.url),
      whyValuable: asText(row.why_valuable),
      verificationStatus: asText(row.verification_status),
      isFirstParty: row.is_first_party == null ? null : asBoolean(row.is_first_party),
    })),
    evidence: slices.evidence.map((row) => ({
      evidenceId: row.evidence_id,
      sourceKind: row.source_kind,
      shortExcerpt: asText(row.short_excerpt),
      supports: asText(row.supports),
    })),
    webSearches: slices.webSearches.map((row) => ({
      subagent: asText(row.subagent),
      query: asText(row.query),
      searchPurpose: asText(row.search_purpose),
    })),
  };
}

export async function readShareReport(videoId: string): Promise<ShareReport | null> {
  const video = await loadLibraryEligibleVideo(videoId);
  if (!video) return null;
  const slices = await loadShareReportSlices(video.analysis_id, video.run_id);
  return composeShareReport(video, slices);
}
