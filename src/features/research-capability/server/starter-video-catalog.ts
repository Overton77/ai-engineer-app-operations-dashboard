import type {
  PreResearchVideoState,
  ResearchStarterVideo,
  ResearchVideoAnalysis,
} from "@aiengineer/database-contract/pre-research";
import type { StarterVideoCatalogFilters, StarterVideoCatalogPage } from "../types";
import { UNCATEGORIZED_CATEGORY_CODE } from "../lib/library-paths";
import { queryResearchCapability } from "./postgres";
import { asBoolean, asIso, asNumber, asText } from "./serialize";

export async function readStarterVideoCatalog(
  filters: StarterVideoCatalogFilters,
): Promise<StarterVideoCatalogPage> {
  const values: unknown[] = [];
  const where: string[] = [];

  const push = (sql: string, value: unknown) => {
    values.push(value);
    where.push(sql.replace("?", `$${values.length}`));
  };

  if (filters.q) {
    values.push(`%${filters.q}%`);
    const idx = `$${values.length}`;
    where.push(`(
      v.title ilike ${idx}
      or v.video_id ilike ${idx}
      or exists (
        select 1
        from public.research_organization_candidate oc
        where oc.video_id = v.video_id
          and oc.canonical_name ilike ${idx}
      )
      or exists (
        select 1
        from public.research_video_technology_summary ts
        where ts.video_id = v.video_id
          and (
            ts.family_label ilike ${idx}
            or ts.primary_technology ilike ${idx}
          )
      )
    )`);
  }

  if (filters.pipelineStatus) {
    push("s.pipeline_status = ?", filters.pipelineStatus);
  }
  if (filters.finished === true) {
    where.push("coalesce(s.pre_research_pipeline_finished, false)");
  }
  if (filters.finished === false) {
    where.push("not coalesce(s.pre_research_pipeline_finished, false)");
  }
  if (filters.categoryCode === UNCATEGORIZED_CATEGORY_CODE) {
    where.push("primary_cat.category_code is null");
    where.push("coalesce(s.pre_research_pipeline_finished, false)");
    where.push("s.pipeline_status = 'finished'");
    where.push("latest_run.status = 'applied'");
  } else if (filters.categoryCode) {
    push("primary_cat.category_code::text = ?", filters.categoryCode);
  }
  if (filters.domainCode) {
    push("primary_domain.domain_code = ?", filters.domainCode);
  }
  if (filters.difficulty) {
    push("analysis.difficulty::text = ?", filters.difficulty);
  }
  if (filters.contentForm) {
    push("analysis.content_form::text = ?", filters.contentForm);
  }

  const whereSql = where.length > 0 ? `where ${where.join(" and ")}` : "";
  const offset = (filters.page - 1) * filters.pageSize;
  values.push(filters.pageSize, offset);
  const limitSql = `limit $${values.length - 1} offset $${values.length}`;

  const fromSql = `
    from public.research_starter_videos v
    left join public.research_pre_research_video_state s on s.video_id = v.video_id
    left join public.research_pre_research_run latest_run on latest_run.run_id = s.latest_run_id
    left join public.research_video_analysis analysis on analysis.run_id = latest_run.run_id
    left join public.research_video_category primary_cat
      on primary_cat.analysis_id = analysis.analysis_id
     and primary_cat.assignment_role = 'primary'
    left join public.research_category_definition primary_cat_def
      on primary_cat_def.category_code = primary_cat.category_code
    left join lateral (
      select vd.domain_code
      from public.research_video_domain vd
      where vd.analysis_id = analysis.analysis_id
      order by vd.confidence desc, vd.domain_code
      limit 1
    ) primary_domain on true
    left join public.research_application_domain primary_domain_def
      on primary_domain_def.domain_code = primary_domain.domain_code
    left join public.research_organization_candidate primary_org
      on primary_org.analysis_id = analysis.analysis_id
     and primary_org.is_primary_featured
  `;

  const [countRow] = await queryResearchCapability<{ total: string | number }>(
    `select count(*) as total ${fromSql} ${whereSql}`,
    values.slice(0, values.length - 2),
  );

  const rows = await queryResearchCapability<
    Pick<
      ResearchStarterVideo,
      | "video_id"
      | "title"
      | "published_at"
      | "duration_seconds"
      | "url"
      | "thumbnail_url"
      | "channel_title"
      | "transcript_status"
      | "transcript_path"
      | "pre_research_complete"
    > & {
      pipeline_status: PreResearchVideoState["pipeline_status"];
      pipeline_finished: boolean;
      pipeline_finished_at: PreResearchVideoState["pre_research_pipeline_finished_at"];
      latest_run_id: PreResearchVideoState["latest_run_id"];
      eligibility_status: PreResearchVideoState["eligibility_status"];
      primary_category_code: string | null;
      primary_category_label: string | null;
      primary_domain_code: string | null;
      primary_domain_label: string | null;
      difficulty: ResearchVideoAnalysis["difficulty"] | null;
      content_form: ResearchVideoAnalysis["content_form"] | null;
      primary_organization_name: string | null;
    }
  >(
    `select
       v.video_id,
       v.title,
       v.published_at,
       v.duration_seconds,
       v.url,
       v.thumbnail_url,
       v.channel_title,
       v.transcript_status,
       v.transcript_path,
       v.pre_research_complete,
       s.pipeline_status,
       coalesce(s.pre_research_pipeline_finished, false) as pipeline_finished,
       s.pre_research_pipeline_finished_at as pipeline_finished_at,
       s.latest_run_id,
       s.eligibility_status,
       primary_cat.category_code::text as primary_category_code,
       primary_cat_def.label as primary_category_label,
       primary_domain.domain_code as primary_domain_code,
       primary_domain_def.label as primary_domain_label,
       analysis.difficulty::text as difficulty,
       analysis.content_form::text as content_form,
       primary_org.canonical_name as primary_organization_name
     ${fromSql}
     ${whereSql}
     ${
       filters.sort === "library"
         ? "order by v.published_at asc nulls last, v.video_id"
         : `order by
       coalesce(s.pre_research_pipeline_finished, false) desc,
       s.pre_research_pipeline_finished_at desc nulls last,
       v.published_at desc nulls last,
       v.video_id`
     }
     ${limitSql}`,
    values,
  );

  return {
    rows: rows.map((row) => ({
      videoId: row.video_id,
      title: row.title,
      publishedAt: asIso(row.published_at),
      durationSeconds: asNumber(row.duration_seconds),
      url: asText(row.url),
      thumbnailUrl: asText(row.thumbnail_url),
      channelTitle: asText(row.channel_title),
      transcriptStatus: row.transcript_status,
      transcriptPath: asText(row.transcript_path),
      preResearchComplete: asBoolean(row.pre_research_complete),
      pipelineStatus: asText(row.pipeline_status),
      pipelineFinished: asBoolean(row.pipeline_finished),
      pipelineFinishedAt: asIso(row.pipeline_finished_at),
      latestRunId: asText(row.latest_run_id),
      eligibilityStatus: asText(row.eligibility_status),
      primaryCategoryCode: asText(row.primary_category_code),
      primaryCategoryLabel: asText(row.primary_category_label),
      primaryDomainCode: asText(row.primary_domain_code),
      primaryDomainLabel: asText(row.primary_domain_label),
      difficulty: asText(row.difficulty),
      contentForm: asText(row.content_form),
      primaryOrganizationName: asText(row.primary_organization_name),
    })),
    total: asNumber(countRow?.total) ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}
