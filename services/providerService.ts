import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

/*
    id is in format tmdb-1234, etc.
*/
const fetchMovieProviders = (id: string): Promise<any> => {
  return apiClient(`/movie/${id}/providers`); 
};

const fetchShowProviders = (id: string): Promise<any> => {
  return apiClient(`/tv/${id}/providers`);
};

// Fetching should only run when modal is open, so pass opened
// state in enabled
export const useMovieProviders = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['movie-providers', id],
    queryFn: () => fetchMovieProviders(id),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};

export const useShowProviders = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['show-providers', id],
    queryFn: () => fetchShowProviders(id),
    enabled: enabled,
    staleTime: 1000 * 60 * 5,
  });
};