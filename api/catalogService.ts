import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

const fetchTrendingMovies = (): Promise<any> => {
  return apiClient('/movie/trending');
};

const fetchTrendingShows = (): Promise<any> => {
  return apiClient('/tv/trending');
};

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['trending-movies'],
    queryFn: fetchTrendingMovies,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};

export const useTrendingShows = () => {
  return useQuery({
    queryKey: ['trending-shows'],
    queryFn: fetchTrendingShows,
    staleTime: 1000 * 60 * 5,
  });
};