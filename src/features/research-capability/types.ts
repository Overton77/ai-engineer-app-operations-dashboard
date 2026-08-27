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
  description?: string;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  exampleTopics?: string[];
  sortOrder?: number;
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
  sort?: "library";
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

export type ShareReportAssignment = {
  categoryCode: string;
  label: string;
  confidence: number | null;
  rationale: string | null;
};

export type ShareReportDomain = {
  domainCode: string;
  label: string;
  confidence: number | null;
  rationale: string | null;
};

export type ShareReportOrganizationSource = {
  title: string | null;
  url: string | null;
  sourceRole: string | null;
  authorityTier: string | null;
  verificationStatus: string | null;
};

export type ShareReportOrganization = {
  canonicalName: string;
  isPrimaryFeatured: boolean;
  officialUrl: string | null;
  authoritativeSummary: string | null;
  organizationScope: string | null;
  relationshipRoles: string[];
  primaryDomainLabel: string | null;
  currentStatus: string | null;
  sources: ShareReportOrganizationSource[];
};

export type ShareReportTechnology = {
  familyRank: number | null;
  familyLabel: string;
  primaryTechnology: string | null;
  primaryTechnologyKind: string | null;
  summary: string | null;
  roleInVideo: string | null;
  temporalStatus: string | null;
  officialUrls: string[];
  confidence: number | null;
};

export type ShareReport = {
  schema: "pre-research-share-report/1.0.0";
  video: {
    videoId: string;
    title: string;
    description: string | null;
    url: string;
    publishedAt: string | null;
    channelTitle: string | null;
    durationSeconds: number | null;
  };
  pipeline: {
    runId: string;
    analysisId: string | null;
    finishedAt: string | null;
    researchAsOf: string | null;
    modelId: string | null;
    promptBundleVersion: string | null;
  };
  taxonomy: {
    primary: ShareReportAssignment | null;
    secondary: ShareReportAssignment[];
    contentForm: string | null;
    difficulty: string | null;
    evidenceLevel: string | null;
    overallConfidence: number | null;
    domains: ShareReportDomain[];
    lifecycleStages: string[];
  };
  summaries: {
    transcriptOnly: string | null;
    contextualized: string | null;
    whyItMatters: string | null;
    temporalContext: string | null;
  };
  keyTakeaways: string[];
  organizations: ShareReportOrganization[];
  technologies: ShareReportTechnology[];
  curriculum: {
    recommendedLearnerLevel: string | null;
    prerequisites: string[];
    learningOutcomes: string[];
    curriculumRoles: string[];
    challengeSeeds: string[];
  };
  entities: Array<{
    entityKind: string;
    name: string;
    canonicalUrl: string | null;
    verificationStatus: string | null;
    relationshipToVideo: string | null;
  }>;
  resources: Array<{
    resourceType: string;
    title: string;
    url: string | null;
    whyValuable: string | null;
    verificationStatus: string | null;
    isFirstParty: boolean | null;
  }>;
  evidence: Array<{
    evidenceId: string;
    sourceKind: string;
    shortExcerpt: string | null;
    supports: string | null;
  }>;
  webSearches: Array<{
    subagent: string | null;
    query: string | null;
    searchPurpose: string | null;
  }>;
};
