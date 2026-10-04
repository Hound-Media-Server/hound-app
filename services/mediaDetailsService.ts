import { apiClient } from './apiClient';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { MediaTypeMovie, MediaTypeTVShow } from '@/constants/MediaTypes';

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

export const prefetchMediaDetails = (
  queryClient: QueryClient,
  item?: {
    media_type?: string;
    media_source?: string;
    source_id?: string;
    logo_uri?: string;
    watch_progress?: { logo_uri?: string };
    next_episode?: { logo_uri?: string };
  },
) => {
  if (
    !item?.media_source ||
    !item.source_id ||
    item.logo_uri ||
    item.watch_progress?.logo_uri ||
    item.next_episode?.logo_uri
  ) return;
  const id = `${item.media_source}-${item.source_id}`;
  if (item.media_type === MediaTypeMovie) {
    void queryClient.prefetchQuery(movieDetailsQuery(id));
  } else if (item.media_type === MediaTypeTVShow) {
    void queryClient.prefetchQuery(showDetailsQuery(id));
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
