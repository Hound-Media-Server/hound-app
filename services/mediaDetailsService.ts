import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

/*
    id is in format tmdb-1234, etc.
*/

const fetchMovieDetails = (id: string): Promise<any> => {
  return apiClient(`/movie/${id}`); 
};

const fetchShowDetails = (id: string): Promise<any> => {
  return apiClient(`/tv/${id}`);
};

export const useMovieDetails = (id: string) => {
  return useQuery({
    queryKey: ['movie-details', id],
    queryFn: () => fetchMovieDetails(id),
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};

export const useShowDetails = (id: string) => {
  return useQuery({
    queryKey: ['show-details', id],
    queryFn: () => fetchShowDetails(id),
    staleTime: 1000 * 60 * 5,
  });
};