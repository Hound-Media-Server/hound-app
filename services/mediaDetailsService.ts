import { apiClient } from './apiClient';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MediaTypeMovie, MediaTypeTVShow } from '@/constants/MediaTypes';
import { useServerInfo } from './internalService';

/*
    id is in format tmdb-1234, etc.
*/

const fetchMovieDetails = (id: string): Promise<any> => {
  return apiClient(`/movie/${id}`); 
};

const fetchShowDetails = (id: string): Promise<any> => {
  return apiClient(`/tv/${id}`);
};

const fetchSeasonDetails = (id: string, seasonNum: number): Promise<any> => {
  return apiClient(`/tv/${id}/season/${seasonNum}`);
};

const movieDetailsQuery = (id: string) => ({
  queryKey: ['movie-details', id],
  queryFn: () => fetchMovieDetails(id),
  staleTime: 1000 * 60 * 5,
});

const showDetailsQuery = (id: string) => ({
  queryKey: ['show-details', id],
  queryFn: () => fetchShowDetails(id),
  staleTime: 1000 * 60 * 5,
});

export interface MediaScores {
  short_overview?: string;
  imdb_score?: number;
  rt_score?: number;
  metacritic_score?: number;
  mdblist_score?: number;
  mdblist_score_average?: number;
  trakt_score?: number;
  letterboxd_score?: number;
  tmdb_score?: number;
  rt_audience_score?: number;
  metacritic_user_score?: number;
  rogerebert_score?: number | null;
  mal_score?: number | null;
  imdb_votes?: number;
  rt_votes?: number;
  rt_audience_votes?: number;
  metacritic_votes?: number;
  metacritic_user_votes?: number;
  trakt_votes?: number;
  tmdb_votes?: number;
  letterboxd_votes?: number;
  rogerebert_votes?: number | null;
  mal_votes?: number | null;
}

const scoresQuery = (mediaType: string, id: string) => ({
  queryKey: ['media-scores', mediaType, id],
  queryFn: () => apiClient<{ data: MediaScores }>(`/${mediaType}/${id}/scores`),
  staleTime: 1000 * 60 * 30,
  gcTime: 1000 * 60 * 60,
  retry: false,
});

const SCORES_MAX_WAIT_MS = 1500;

export const useMediaScores = (
  mediaType: string,
  id: string,
  enabled: boolean = true,
) => {
  const { data: serverInfo, isPending: isServerInfoPending } = useServerInfo();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    if (!enabled) return;
    const timer = setTimeout(() => setTimedOut(true), SCORES_MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, [enabled, mediaType, id]);
  const query = useQuery({
    ...scoresQuery(mediaType, id),
    enabled:
      enabled &&
      id.startsWith('tmdb-') &&
      !!serverInfo?.data?.hound_plus_enabled,
    select: (data) => data.data,
  });
  const isWaiting =
    enabled && !!id && !timedOut && (isServerInfoPending || query.isLoading);
  return { ...query, isWaiting };
};

export const prefetchMediaDetails = (
  queryClient: QueryClient,
  item?: { media_type?: string; media_source?: string; source_id?: string | number },
) => {
  if (!item?.media_source || !item.source_id) return;
  const id = `${item.media_source}-${item.source_id}`;
  const serverInfo = queryClient.getQueryData<{
    data?: { hound_plus_enabled?: boolean };
  }>(['server-info']);
  const scoresEnabled =
    serverInfo?.data?.hound_plus_enabled && item.media_source === 'tmdb';
  if (item.media_type === MediaTypeMovie) {
    void queryClient.prefetchQuery(movieDetailsQuery(id));
    if (scoresEnabled) void queryClient.prefetchQuery(scoresQuery(item.media_type, id));
  } else if (item.media_type === MediaTypeTVShow) {
    void queryClient.prefetchQuery(showDetailsQuery(id));
    if (scoresEnabled) void queryClient.prefetchQuery(scoresQuery(item.media_type, id));
  }
};

export const useMovieDetails = (id: string, enabled: boolean = true) => {
  return useQuery({
    ...movieDetailsQuery(id),
    enabled: enabled && !!id,
    select: (data: any) => data.data
  });
};

export const useShowDetails = (id: string, enabled: boolean = true) => {
  return useQuery({
    ...showDetailsQuery(id),
    enabled: enabled && !!id,
    select: (data: any) => data.data
  });
};

export const useSeasonDetails = (id: string, seasonNum: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['season-details', id, seasonNum],
    queryFn: () => fetchSeasonDetails(id, seasonNum),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!id && !!seasonNum,
    select: (data: any) => data.data
  });
};
