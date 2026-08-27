import type { TaxonomyDivisionOption, TaxonomyDivisions } from "../types";
import { queryResearchCapability } from "./postgres";
import { asNumber } from "./serialize";

function toOptions(
  rows: Array<{ code: string; label: string; applied_video_count: string | number }>,
): TaxonomyDivisionOption[] {
  return rows.map((row) => ({
    code: row.code,
    label: row.label,
    appliedVideoCount: asNumber(row.applied_video_count) ?? 0,
  }));
}

export async function readTaxonomyDivisions(): Promise<TaxonomyDivisions> {
  const [
    engineeringCategories,
    applicationDomains,
    organizationDomains,
    contentForms,
    difficulties,
    lifecycleStages,
  ] = await Promise.all([
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         d.category_code::text as code,
         d.label,
         count(distinct case when r.status = 'applied' then a.video_id end) as applied_video_count
       from public.research_category_definition d
       left join public.research_video_category c
         on c.category_code = d.category_code
        and c.assignment_role = 'primary'
       left join public.research_video_analysis a on a.analysis_id = c.analysis_id
       left join public.research_pre_research_run r on r.run_id = a.run_id
       group by d.category_code, d.label, d.sort_order
       order by d.sort_order`,
    ),
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         d.domain_code as code,
         d.label,
         count(distinct case when r.status = 'applied' then a.video_id end) as applied_video_count
       from public.research_application_domain d
       left join public.research_video_domain vd on vd.domain_code = d.domain_code
       left join public.research_video_analysis a on a.analysis_id = vd.analysis_id
       left join public.research_pre_research_run r on r.run_id = a.run_id
       where d.active
       group by d.domain_code, d.label, d.sort_order
       order by d.sort_order`,
    ),
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         d.domain_code::text as code,
         d.label,
         count(distinct case when r.status = 'applied' then oc.video_id end) as applied_video_count
       from public.research_organization_domain_definition d
       left join public.research_organization_candidate oc
         on oc.primary_domain_code = d.domain_code
        and oc.is_primary_featured
       left join public.research_video_analysis a on a.analysis_id = oc.analysis_id
       left join public.research_pre_research_run r on r.run_id = a.run_id
       group by d.domain_code, d.label, d.sort_order
       order by d.sort_order`,
    ),
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         a.content_form::text as code,
         a.content_form::text as label,
         count(*) as applied_video_count
       from public.research_video_analysis a
       join public.research_pre_research_run r on r.run_id = a.run_id
       where r.status = 'applied' and a.content_form is not null
       group by a.content_form
       order by applied_video_count desc`,
    ),
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         a.difficulty::text as code,
         a.difficulty::text as label,
         count(*) as applied_video_count
       from public.research_video_analysis a
       join public.research_pre_research_run r on r.run_id = a.run_id
       where r.status = 'applied' and a.difficulty is not null
       group by a.difficulty
       order by applied_video_count desc`,
    ),
    queryResearchCapability<{ code: string; label: string; applied_video_count: string | number }>(
      `select
         l.lifecycle_stage::text as code,
         l.lifecycle_stage::text as label,
         count(distinct l.analysis_id) as applied_video_count
       from public.research_video_lifecycle l
       join public.research_video_analysis a on a.analysis_id = l.analysis_id
       join public.research_pre_research_run r on r.run_id = a.run_id
       where r.status = 'applied'
       group by l.lifecycle_stage
       order by applied_video_count desc`,
    ),
  ]);

  return {
    engineeringCategories: toOptions(engineeringCategories),
    applicationDomains: toOptions(applicationDomains),
    organizationDomains: toOptions(organizationDomains),
    contentForms: toOptions(contentForms),
    difficulties: toOptions(difficulties),
    lifecycleStages: toOptions(lifecycleStages),
  };
}
