export type PipelineStatus =
  | "eligible"
  | "not_started"
  | "queued"
  | "claimed"
  | "analyzing"
  | "research_complete"
  | "synthesizing"
  | "intent_ready"
  | "applying"
  | "finished"
  | "review_required"
  | "failed"
  | "superseded";

export type PipelineProgress = {
  catalogVideoCount: number;
  qualifiedVideoCount: number;
  finishedVideoCount: number;
  remainingQualifiedCount: number;
  statusCounts: Array<{ pipelineStatus: string; videoCount: number }>;
};

export type TaxonomyDivisionOption = {
  code: string;
  label: string;
  appliedVideoCount: number;
};

export type TaxonomyDivisions = {
  engineeringCategories: TaxonomyDivisionOption[];
  applicationDomains: TaxonomyDivisionOption[];
  organizationDomains: TaxonomyDivisionOption[];
  contentForms: TaxonomyDivisionOption[];
  difficulties: TaxonomyDivisionOption[];
  lifecycleStages: TaxonomyDivisionOption[];
};

export type StarterVideoCatalogFilters = {
  q?: string;
  pipelineStatus?: string;
  finished?: boolean;
  categoryCode?: string;
  domainCode?: string;
  difficulty?: string;
  contentForm?: string;
  page: number;
  pageSize: number;
};

export type StarterVideoCatalogRow = {
  videoId: string;
  title: string;
  publishedAt: string | null;
  durationSeconds: number | null;
  url: string | null;
  thumbnailUrl: string | null;
  channelTitle: string | null;
  transcriptStatus: string;
  transcriptPath: string | null;
  preResearchComplete: boolean;
  pipelineStatus: string | null;
  pipelineFinished: boolean;
  pipelineFinishedAt: string | null;
  latestRunId: string | null;
  eligibilityStatus: string | null;
  primaryCategoryCode: string | null;
  primaryCategoryLabel: string | null;
  primaryDomainCode: string | null;
  primaryDomainLabel: string | null;
  difficulty: string | null;
  contentForm: string | null;
  primaryOrganizationName: string | null;
};

export type StarterVideoCatalogPage = {
  rows: StarterVideoCatalogRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type StarterVideoAnchor = {
  video: {
    videoId: string;
    title: string;
    description: string | null;
    publishedAt: string | null;
    channelTitle: string | null;
    durationSeconds: number | null;
    url: string | null;
    thumbnailUrl: string | null;
    transcriptStatus: string;
    transcriptBucket: string | null;
    transcriptPath: string | null;
    transcriptLanguage: string | null;
    transcriptCharCount: number | null;
    preResearchComplete: boolean;
  };
  videoState: Record<string, unknown> | null;
  runs: Array<Record<string, unknown>>;
};

export type AppliedResearchOutputs = {
  selectedRunId: string | null;
  analysis: Record<string, unknown> | null;
  initialSummary: Record<string, unknown> | null;
  technologyFamilies: Array<Record<string, unknown>>;
  categoryAssignments: Array<Record<string, unknown>>;
  domainAssignments: Array<Record<string, unknown>>;
  lifecycleAssignments: Array<Record<string, unknown>>;
  organizations: Array<Record<string, unknown>>;
  organizationSources: Array<Record<string, unknown>>;
  evidenceAnchors: Array<Record<string, unknown>>;
  entities: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  intent: Record<string, unknown> | null;
  intentEvents: Array<Record<string, unknown>>;
  artifacts: Array<Record<string, unknown>>;
  webSearches: Array<Record<string, unknown>>;
};

export type ResearchTablePage = {
  tableKey: string;
  label: string;
  rows: Array<Record<string, unknown>>;
  total: number;
  page: number;
  pageSize: number;
};

export type PacketArtifactBody = {
  artifactKind: string;
  storageBucket: string;
  storagePath: string;
  json: unknown;
};

export type TranscriptObject = {
  videoId: string;
  bucket: string;
  path: string;
  preview: string | null;
  text: string | null;
  charCount: number | null;
};
