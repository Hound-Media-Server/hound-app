import { useQuery } from "@tanstack/react-query";
import { MediaTypeTVShow } from "@/constants/MediaTypes";
import {
  getSkipSegment,
  normalizeSegments,
  VideoSegments,
} from "@/utils/videoSegments";
import { ServerVersionGTE } from "@/utils/version";
import { apiClient } from "./apiClient";
import { useServerInfo } from "./internalService";

export function useVideoSegments(
  media: {
    id: string;
    mediaType: string;
    seasonNumber?: number;
    episodeNumber?: number;
    src: string;
    hasNextEpisode?: boolean;
  },
  duration: number,
  position: number,
) {
  const { data: serverInfo, isLoading: isServerInfoLoading } = useServerInfo();
  // skip intro are available from server v0.3.8.
  const supportsVideoSegments = isServerInfoLoading
    ? false
    : ServerVersionGTE(serverInfo?.data?.version, "0.3.8");
  const {
    id,
    mediaType,
    seasonNumber: season,
    episodeNumber: episode,
    src,
  } = media;
  const durationMs = Math.round(duration * 1000);
  const { data } = useQuery({
    queryKey: ["video-segments", id, season, episode, src, durationMs],
    enabled:
      supportsVideoSegments &&
      mediaType === MediaTypeTVShow &&
      season !== undefined &&
      episode !== undefined &&
      durationMs > 0,
    queryFn: async ({ signal }) => {
      const response = await apiClient<{ data: VideoSegments | null }>(
        `/tv/${id}/segments?season=${season}&episode=${episode}&duration_ms=${durationMs}`,
        { signal },
      );
      const segments = response.data;
      if (
        !segments ||
        `${segments.media_source}-${segments.source_id}` !== id ||
        segments.season !== season ||
        segments.episode !== episode
      ) {
        return [];
      }
      return normalizeSegments(segments, durationMs / 1000);
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  return supportsVideoSegments
    ? getSkipSegment(data || [], position, duration, !!media.hasNextEpisode)
    : null;
}
