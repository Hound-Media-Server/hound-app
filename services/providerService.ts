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

export const useMovieProviders = (id: string) => {
  return useQuery({
    queryKey: ['movie-providers', id],
    queryFn: () => fetchMovieProviders(id),
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};

export const useShowProviders = (id: string) => {
  return useQuery({
    queryKey: ['show-providers', id],
    queryFn: () => fetchShowProviders(id),
    staleTime: 1000 * 60 * 5,
  });
};