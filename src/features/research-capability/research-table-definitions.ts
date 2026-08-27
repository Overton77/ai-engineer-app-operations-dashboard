export type ResearchTableDefinition = {
  tableKey: string;
  label: string;
  postgresTable: string;
  searchColumns: string[];
  videoIdColumn?: string;
  defaultOrder: string;
};

export const RESEARCH_TABLE_DEFINITIONS: ResearchTableDefinition[] = [
  {
    tableKey: "starter-videos",
    label: "Starter videos",
    postgresTable: "public.research_starter_videos",
    searchColumns: ["video_id", "title", "channel_title"],
    videoIdColumn: "video_id",
    defaultOrder: "published_at desc nulls last, video_id",
  },
  {
    tableKey: "video-states",
    label: "Video pipeline states",
    postgresTable: "public.research_pre_research_video_state",
    searchColumns: ["video_id", "pipeline_status", "eligibility_status"],
    videoIdColumn: "video_id",
    defaultOrder: "updated_at desc",
  },
  {
    tableKey: "pipeline-runs",
    label: "Pipeline runs",
    postgresTable: "public.research_pre_research_run",
    searchColumns: ["video_id", "status", "error_code"],
    videoIdColumn: "video_id",
    defaultOrder: "created_at desc",
  },
  {
    tableKey: "ingestion-intents",
    label: "Ingestion intents",
    postgresTable: "public.research_ingestion_intent",
    searchColumns: ["video_id", "status"],
    videoIdColumn: "video_id",
    defaultOrder: "created_at desc",
  },
  {
    tableKey: "video-analyses",
    label: "Video analyses",
    postgresTable: "public.research_video_analysis",
    searchColumns: ["video_id", "difficulty", "content_form"],
    videoIdColumn: "video_id",
    defaultOrder: "generated_at desc",
  },
  {
    tableKey: "initial-summaries",
    label: "Contextualized summaries",
    postgresTable: "public.research_video_initial_summary",
    searchColumns: ["video_id", "transcript_summary"],
    videoIdColumn: "video_id",
    defaultOrder: "generated_at desc",
  },
  {
    tableKey: "technology-families",
    label: "Technology families",
    postgresTable: "public.research_video_technology_summary",
    searchColumns: ["video_id", "family_label", "primary_technology"],
    videoIdColumn: "video_id",
    defaultOrder: "video_id, family_rank",
  },
  {
    tableKey: "category-assignments",
    label: "Category assignments",
    postgresTable: "public.research_video_category",
    searchColumns: ["category_code", "assignment_role"],
    defaultOrder: "category_code, assignment_role",
  },
  {
    tableKey: "domain-assignments",
    label: "Domain assignments",
    postgresTable: "public.research_video_domain",
    searchColumns: ["domain_code"],
    defaultOrder: "domain_code",
  },
  {
    tableKey: "lifecycle-assignments",
    label: "Lifecycle assignments",
    postgresTable: "public.research_video_lifecycle",
    searchColumns: ["lifecycle_stage"],
    defaultOrder: "lifecycle_stage",
  },
  {
    tableKey: "organization-candidates",
    label: "Organizations",
    postgresTable: "public.research_organization_candidate",
    searchColumns: ["video_id", "canonical_name", "primary_domain_code"],
    videoIdColumn: "video_id",
    defaultOrder: "featured_rank, canonical_name",
  },
  {
    tableKey: "organization-sources",
    label: "Organization sources",
    postgresTable: "public.research_organization_source",
    searchColumns: ["title", "publisher", "url"],
    defaultOrder: "source_rank",
  },
  {
    tableKey: "evidence-anchors",
    label: "Evidence anchors",
    postgresTable: "public.research_evidence_anchor",
    searchColumns: ["short_excerpt", "source_kind", "supports"],
    defaultOrder: "start_seconds nulls last",
  },
  {
    tableKey: "entity-candidates",
    label: "Entities",
    postgresTable: "public.research_entity_candidate",
    searchColumns: ["name", "entity_kind", "organization_name"],
    defaultOrder: "entity_kind, name",
  },
  {
    tableKey: "resource-candidates",
    label: "Resources",
    postgresTable: "public.research_resource_candidate",
    searchColumns: ["title", "resource_type", "url"],
    defaultOrder: "resource_type, title",
  },
  {
    tableKey: "packet-artifacts",
    label: "Packet artifacts",
    postgresTable: "public.research_pre_research_artifact",
    searchColumns: ["artifact_kind", "storage_path"],
    defaultOrder: "created_at desc",
  },
  {
    tableKey: "web-search-events",
    label: "Web search events",
    postgresTable: "public.research_web_search_event",
    searchColumns: ["query", "subagent", "search_purpose"],
    defaultOrder: "searched_at desc",
  },
  {
    tableKey: "stage-executions",
    label: "Stage executions",
    postgresTable: "public.research_pre_research_stage_execution",
    searchColumns: ["stage", "status"],
    defaultOrder: "updated_at desc",
  },
];
