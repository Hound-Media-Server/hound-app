import { apiClient } from "./apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatRelativeTime } from "../utils/dateUtils";

/*
    For fetching watched media and resume progress
*/
export interface PlayerSettings {
  player?: string;
  resize_mode?: string;
  audio_idx?: number;
  audio_lang?: string;
  subtitle_idx?: number;
  subtitle_lang?: string;
}

export interface WatchProgress {
  client_platform: string;
  episode_source_id: string;
  stream_protocol: string;
  encoded_data: string;
  season_number?: number;
  episode_number?: number;
  current_progress_seconds: number;
  total_duration_seconds: number;
  player_settings: PlayerSettings | null;
}

export interface NextEpisode {
  season_number: number;
  episode_number: number;
  episode_source_id: string;
}

export interface WatchAction {
  media_type: "tvshow" | "movie";
  media_source: "tmdb";
  source_id: string;
  watch_action_type: "resume" | "next_episode";
  title: string;
  overview: string;
  release_date: string;
  thumbnail_uri: string;
  watch_progress: WatchProgress | null;
  next_episode: NextEpisode | null;
}

export interface ContinueWatchingResponse {
  status: string;
  data: WatchAction | null;
}

const fetchMovieWatchData = (id: string) => {
  return apiClient(`/movie/${id}/history`);
};

const fetchShowWatchData = (id: string, seasonNum: number) => {
  return apiClient(`/tv/${id}/season/${seasonNum}/history`);
};

const fetchMovieWatchProgress = (id: string) => {
  return apiClient(`/movie/${id}/playback`);
};

const fetchShowWatchProgress = (id: string, seasonNum: number) => {
  return apiClient(`/tv/${id}/season/${seasonNum}/playback`);
};

const fetchMovieContinueWatching = (id: string) => {
  return apiClient<ContinueWatchingResponse>(`/movie/${id}/continue_watching`);
};

const fetchShowContinueWatching = (id: string) => {
  return apiClient<ContinueWatchingResponse>(`/tv/${id}/continue_watching`);
};

export const updatePlaybackProgress = async (
  id: string,
  mediaType: "movie" | "tv",
  data: PlaybackPayload,
) => {
  const endpoint =
    mediaType === "movie" ? `/movie/${id}/playback` : `/tv/${id}/playback`;
  return apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const addWatchHistory = async (
  id: string,
  mediaType: "movie" | "tv",
  data: HistoryPayload,
) => {
  const endpoint =
    mediaType === "movie" ? `/movie/${id}/history` : `/tv/${id}/history`;
  return apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useMovieWatchData = (id: string) => {
  return useQuery({
    queryKey: ["movie-watch-data", id],
    queryFn: () => fetchMovieWatchData(id),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => {
      // get latest rewatch, but there really should only be one rewatch for movies
      // extra rewatches are unexpected behavior
      if (!data.data || data.data.length === 0) return null;
      const latest = data.data.reduce((a: any, b: any) =>
        new Date(a.rewatch_started_at) > new Date(b.rewatch_started_at) ? a : b,
      );
      // get latest watch event
      const latestEvent = (latest.watch_events || [])
        .sort(
          (a: any, b: any) =>
            new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime(),
        )
        .at(-1);
      if (!latestEvent) return null;
      const ONE_MONTH_SECONDS = 30 * 24 * 60 * 60;
      return formatRelativeTime(latestEvent.watched_at, ONE_MONTH_SECONDS);
    },
  });
};

export const useShowWatchData = (id: string, seasonNum: number) => {
  return useQuery({
    queryKey: ["show-watch-data", id, seasonNum],
    queryFn: () => fetchShowWatchData(id, seasonNum),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => {
      if (!data.data || data.data.length === 0)
        return new Map<string, string>();
      const latest = data.data.reduce((a: any, b: any) =>
        new Date(a.rewatch_started_at) > new Date(b.rewatch_started_at) ? a : b,
      );
      const watchMap = new Map<string, string>();
      // convert to relative time, eg. 1 day ago, etc.
      // cutoff is one month, after a month format as date
      // for duplicate events for the same episode, overwrite
      // to show latest only
      const ONE_MONTH_SECONDS = 30 * 24 * 60 * 60;
      (latest.watch_events || [])
        .sort(
          (a: any, b: any) =>
            new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime(),
        )
        .forEach((event: any) => {
          watchMap.set(
            event.source_id,
            formatRelativeTime(event.watched_at, ONE_MONTH_SECONDS),
          );
        });
      return watchMap;
    },
  });
};

export const useMovieWatchProgress = (id: string) => {
  return useQuery({
    queryKey: ["movie-watch-progress", id],
    queryFn: () => fetchMovieWatchProgress(id),
    staleTime: 1000 * 60 * 5,
  });
};

// returns a Map[string, WatchProgress] where int key is episode_id
export const useShowWatchProgress = (id: string, seasonNum: number) => {
  return useQuery({
    queryKey: ["show-watch-progress", id, seasonNum],
    queryFn: () => fetchShowWatchProgress(id, seasonNum),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => {
      const progressMap = new Map<string, WatchProgress>();
      data.data?.map((item: WatchProgress) => {
        progressMap.set(item.episode_source_id, item);
      });
      return progressMap;
    },
  });
};

export const useMovieContinueWatching = (id: string) => {
  return useQuery({
    queryKey: ["movie-continue-watching", id],
    queryFn: () => fetchMovieContinueWatching(id),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data,
  });
};

export const useShowContinueWatching = (id: string) => {
  return useQuery({
    queryKey: ["show-continue-watching", id],
    queryFn: () => fetchShowContinueWatching(id),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data,
  });
};

export interface PlaybackPayload {
  season_number?: number;
  episode_number?: number;
  encoded_data: string;
  current_progress_seconds: number;
  total_duration_seconds: number;
  player_settings?: PlayerSettings;
}

export interface HistoryPayload {
  action_type: "watch";
  season?: number;
  episode?: number;
}

export const useUpdatePlaybackProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mediaType,
      data,
    }: {
      id: string;
      mediaType: "movie" | "tv";
      data: PlaybackPayload;
    }) => updatePlaybackProgress(id, mediaType, data),
    onSuccess: (data, variables) => {
      if (variables.mediaType === "movie") {
        queryClient.invalidateQueries({
          queryKey: ["movie-watch-progress", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movie-continue-watching", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movie-watch-data", variables.id],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["show-watch-progress", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["show-continue-watching", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["show-watch-data", variables.id],
        });
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update playback progress:", variables, error);
    },
  });
};

export const useAddWatchHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mediaType,
      data,
    }: {
      id: string;
      mediaType: "movie" | "tv";
      data: HistoryPayload;
    }) => addWatchHistory(id, mediaType, data),
    onSuccess: (data, variables) => {
      if (variables.mediaType === "movie") {
        queryClient.invalidateQueries({
          queryKey: ["movie-watch-data", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movie-watch-progress", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["movie-continue-watching", variables.id],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["show-watch-data", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["show-watch-progress", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["show-continue-watching", variables.id],
        });
      }
    },
    onError: (error, variables) => {
      console.error("Failed to add watch history:", variables, error);
    },
  });
};
