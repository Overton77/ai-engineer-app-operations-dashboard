import { youtubeWatchUrl } from "../lib/youtube";

export function WatchOnYouTube({
  videoId,
  storedUrl,
  className = "hover:underline",
}: {
  videoId: string;
  storedUrl?: string | null;
  className?: string;
}) {
  return (
    <a
      href={youtubeWatchUrl(videoId, storedUrl)}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      Watch on YouTube
    </a>
  );
}
