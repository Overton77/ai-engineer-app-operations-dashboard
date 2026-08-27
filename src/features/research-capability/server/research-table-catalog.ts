import {
  RESEARCH_TABLE_DEFINITIONS,
  type ResearchTableDefinition,
} from "../research-table-definitions";
import type { ResearchTablePage } from "../types";
import { queryResearchCapability } from "./postgres";
import { asNumber, serializeRow } from "./serialize";

export { RESEARCH_TABLE_DEFINITIONS, type ResearchTableDefinition };

const STARTER_VIDEO_LIST_COLUMNS = `
  video_id, title, published_at, channel_title, duration_seconds, url, thumbnail_url,
  transcript_status, transcript_bucket, transcript_path, transcript_language,
  transcript_char_count, pre_research_complete, created_at, updated_at
`;

export function getResearchTableDefinition(tableKey: string) {
  return RESEARCH_TABLE_DEFINITIONS.find((definition) => definition.tableKey === tableKey);
}

export async function readResearchTableRows(options: {
  tableKey: string;
  q?: string;
  videoId?: string;
  page: number;
  pageSize: number;
}): Promise<ResearchTablePage | null> {
  const definition = getResearchTableDefinition(options.tableKey);
  if (!definition) return null;

  const values: unknown[] = [];
  const where: string[] = [];

  if (options.videoId && definition.videoIdColumn) {
    values.push(options.videoId);
    where.push(`${definition.videoIdColumn} = $${values.length}`);
  }

  if (options.q && definition.searchColumns.length > 0) {
    values.push(`%${options.q}%`);
    const idx = `$${values.length}`;
    where.push(
      `(${definition.searchColumns
        .map((column) => `${column}::text ilike ${idx}`)
        .join(" or ")})`,
    );
  }

  const whereSql = where.length > 0 ? `where ${where.join(" and ")}` : "";
  const selectList =
    definition.tableKey === "starter-videos" ? STARTER_VIDEO_LIST_COLUMNS : "*";

  const [countRow] = await queryResearchCapability<{ total: string | number }>(
    `select count(*) as total from ${definition.postgresTable} ${whereSql}`,
    values,
  );

  values.push(options.pageSize, (options.page - 1) * options.pageSize);
  const rows = await queryResearchCapability<Record<string, unknown>>(
    `select ${selectList}
     from ${definition.postgresTable}
     ${whereSql}
     order by ${definition.defaultOrder}
     limit $${values.length - 1} offset $${values.length}`,
    values,
  );

  return {
    tableKey: definition.tableKey,
    label: definition.label,
    rows: rows.map(serializeRow),
    total: asNumber(countRow?.total) ?? 0,
    page: options.page,
    pageSize: options.pageSize,
  };
}
