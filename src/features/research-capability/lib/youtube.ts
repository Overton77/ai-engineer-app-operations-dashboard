export function youtubeWatchUrl(videoId: string, storedUrl?: string | null): string {
  const trimmed = storedUrl?.trim();
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
