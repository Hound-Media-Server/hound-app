import { MediaTypeMovie } from "@/constants/MediaTypes";

export function formatMediaMetadata(
  media: {
    release_date?: string;
    status?: string;
    duration?: number;
    media_type?: string;
    genres?: Array<{ genre?: string }>;
  } | null | undefined,
): string {
  if (!media) return "";
  const minutes =
    (media.media_type === MediaTypeMovie || !media.media_type) &&
    media.duration != null &&
    media.duration > 0
      ? media.duration
      : undefined;
  const duration = minutes
    ? minutes < 60
      ? `${minutes}m`
      : `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`
    : "";
  const genres = media.genres
    ?.map((genre) => genre.genre)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  return [
    media.release_date?.slice(0, 4),
    media.status === "Ended" ? "Finished Airing" : media.status,
    duration,
    genres,
  ]
    .filter(Boolean)
    .join("  ·  ");
}

export function normalizeOverview(overview?: string | null): string {
  return overview?.replace(/\s+/g, " ").trim() ?? "";
}
