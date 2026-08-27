const INTENT_BUCKET = "research-ingestion-intents";
const TRANSCRIPT_BUCKET = "ai-engineer-transcripts";

function storageConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return { url, key };
}

function objectUrl(bucket: string, path: string): string {
  const { url } = storageConfig();
  const encodedPath = path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
  return `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function authHeaders(): Headers {
  const { key } = storageConfig();
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("apikey", key);
  return headers;
}

export async function downloadResearchObject(options: {
  bucket: string;
  path: string;
}): Promise<string> {
  const response = await fetch(objectUrl(options.bucket, options.path), {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `STORAGE_GET_FAILED: ${options.bucket}/${options.path} (${response.status})`,
    );
  }
  return response.text();
}

export function intentPacketPath(
  videoId: string,
  runId: string,
  relativePath: string,
): { bucket: string; path: string } {
  return {
    bucket: INTENT_BUCKET,
    path: `pre-research/v2/${videoId}/${runId}/${relativePath}`,
  };
}

export function transcriptObjectPath(videoId: string, storedPath?: string | null) {
  return {
    bucket: TRANSCRIPT_BUCKET,
    path: storedPath ?? `ai-dot-engineer/${videoId}.txt`,
  };
}

export { INTENT_BUCKET, TRANSCRIPT_BUCKET };
