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

const fetchSeasonDetails = (id: string, seasonNum: number): Promise<any> => {
  return apiClient(`/tv/${id}/season/${seasonNum}`);
};

export const useMovieDetails = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['movie-details', id],
    queryFn: () => fetchMovieDetails(id),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!id,
    select: (data: any) => data.data
  });
};

export const useShowDetails = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['show-details', id],
    queryFn: () => fetchShowDetails(id),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!id,
    select: (data: any) => data.data
  });
};

export const useSeasonDetails = (id: string, seasonNum: number) => {
  return useQuery({
    queryKey: ['season-details', id, seasonNum],
    queryFn: () => fetchSeasonDetails(id, seasonNum),
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data
  });
};