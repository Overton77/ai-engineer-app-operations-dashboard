import type { TaxonomyDivisionOption, TaxonomyDivisions } from "../types";
import {
  UNCATEGORIZED_CATEGORY_CODE,
  UNCATEGORIZED_SORT_ORDER,
} from "../lib/library-paths";
import { queryResearchCapability } from "./postgres";
import { asNumber, asStringArray, asText } from "./serialize";

type DivisionCountRow = {
  code: string;
  label: string;
  applied_video_count: string | number;
};

type EngineeringCategoryRow = DivisionCountRow & {
  description: string | null;
  inclusion_criteria: unknown;
  exclusion_criteria: unknown;
  example_topics: unknown;
  sort_order: string | number;
};

function toOptions(rows: DivisionCountRow[]): TaxonomyDivisionOption[] {
  return rows.map((row) => ({
    code: row.code,
    label: row.label,
    appliedVideoCount: asNumber(row.applied_video_count) ?? 0,
  }));
}

function toEngineeringCategory(row: EngineeringCategoryRow): TaxonomyDivisionOption {
  return {
    code: row.code,
    label: row.label,
    appliedVideoCount: asNumber(row.applied_video_count) ?? 0,
    description: asText(row.description) ?? undefined,
    inclusionCriteria: asStringArray(row.inclusion_criteria),
    exclusionCriteria: asStringArray(row.exclusion_criteria),
    exampleTopics: asStringArray(row.example_topics),
    sortOrder: asNumber(row.sort_order) ?? undefined,
  };
}

function uncategorizedFolder(appliedVideoCount: number): TaxonomyDivisionOption {
  return {
    code: UNCATEGORIZED_CATEGORY_CODE,
    label: "Uncategorized",
    appliedVideoCount,
    description: "Finished talks that do not yet have a primary engineering-category assignment.",
    inclusionCriteria: [],
    exclusionCriteria: [],
    exampleTopics: [],
    sortOrder: UNCATEGORIZED_SORT_ORDER,
  };
}

export async function readTaxonomyDivisions(): Promise<TaxonomyDivisions> {
  const [
    engineeringCategories,
    applicationDomains,
    organizationDomains,
    contentForms,
    difficulties,
    lifecycleStages,
    uncategorizedRows,
  ] = await Promise.all([
    queryResearchCapability<EngineeringCategoryRow>(
      `select
         d.category_code::text as code,
         d.label,
         d.description,
         d.inclusion_criteria,
         d.exclusion_criteria,
         d.example_topics,
         d.sort_order,
         count(distinct case when r.status = 'applied' then a.video_id end) as applied_video_count
       from public.research_category_definition d
       left join public.research_video_category c
         on c.category_code = d.category_code
        and c.assignment_role = 'primary'
       left join public.research_video_analysis a on a.analysis_id = c.analysis_id
       left join public.research_pre_research_run r on r.run_id = a.run_id
       group by
         d.category_code,
         d.label,
         d.description,
         d.inclusion_criteria,
         d.exclusion_criteria,
         d.example_topics,
         d.sort_order
       order by d.sort_order`,
    ),
    queryResearchCapability<DivisionCountRow>(
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
    queryResearchCapability<DivisionCountRow>(
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
    queryResearchCapability<DivisionCountRow>(
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
    queryResearchCapability<DivisionCountRow>(
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
    queryResearchCapability<DivisionCountRow>(
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
    queryResearchCapability<{ total: string | number }>(
      `select count(*) as total
       from public.research_pre_research_video_state s
       join public.research_pre_research_run r on r.run_id = s.latest_run_id
       left join public.research_video_analysis a on a.run_id = r.run_id
       left join public.research_video_category primary_cat
         on primary_cat.analysis_id = a.analysis_id
        and primary_cat.assignment_role = 'primary'
       where s.pre_research_pipeline_finished
         and s.pipeline_status = 'finished'
         and r.status = 'applied'
         and primary_cat.category_code is null`,
    ),
  ]);

  const uncategorizedCount = asNumber(uncategorizedRows[0]?.total) ?? 0;
  const categories = engineeringCategories.map(toEngineeringCategory);
  if (uncategorizedCount > 0) {
    categories.push(uncategorizedFolder(uncategorizedCount));
  }

  return {
    engineeringCategories: categories,
    applicationDomains: toOptions(applicationDomains),
    organizationDomains: toOptions(organizationDomains),
    contentForms: toOptions(contentForms),
    difficulties: toOptions(difficulties),
    lifecycleStages: toOptions(lifecycleStages),
  };
}
