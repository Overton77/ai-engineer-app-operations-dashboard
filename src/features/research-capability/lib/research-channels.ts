const AI_ENGINEER_CHANNEL_ID = "UCLKPca3kwwd-B59HNr-_lvA";
const AI_ENGINEER_HANDLE = "@aiDotEngineer";
const AI_ENGINEER_TRANSCRIPT_BUCKET = "ai-engineer-transcripts";

const BERMAN_CHANNEL_ID = "UCawZsQWqfGSbCI5yjkdVkTA";
const BERMAN_HANDLE = "@matthew_berman";
const BERMAN_TRANSCRIPT_BUCKET = "matthew-berman-transcripts";

const AI_ENGINEER_HANDLE_MATCHES = handleMatchLiterals(AI_ENGINEER_HANDLE);
const BERMAN_HANDLE_MATCHES = handleMatchLiterals(BERMAN_HANDLE);

export function catalogChannelScopeSql(): string {
  return `(
    v.channel_id = ${quoted(AI_ENGINEER_CHANNEL_ID)}
    or lower(v.channel_handle) in (${AI_ENGINEER_HANDLE_MATCHES})
    or v.transcript_bucket = ${quoted(AI_ENGINEER_TRANSCRIPT_BUCKET)}
    or c.is_primary_research_source = true
  )
  and not (
    v.channel_id = ${quoted(BERMAN_CHANNEL_ID)}
    or lower(v.channel_handle) in (${BERMAN_HANDLE_MATCHES})
    or v.transcript_bucket = ${quoted(BERMAN_TRANSCRIPT_BUCKET)}
  )`;
}

function handleMatchLiterals(handle: string): string {
  const normalized = handle.toLowerCase();
  const withoutAt = normalized.startsWith("@") ? normalized.slice(1) : normalized;
  return `${quoted(normalized)}, ${quoted(withoutAt)}`;
}

function quoted(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
