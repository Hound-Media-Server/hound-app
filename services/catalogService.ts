import { apiClient } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

const fetchTrendingMovies = (): Promise<any> => {
  return apiClient("/catalog/trending-movies");
};

const fetchTrendingShows = (): Promise<any> => {
  return apiClient("/catalog/trending-shows");
};

export const fetchContinueWatching = (): Promise<any> => {
  return apiClient("/continue_watching");
};

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ["trending-movies"],
    queryFn: fetchTrendingMovies,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    select: (data: any) => data.data,
  });
};

export const useTrendingShows = () => {
  return useQuery({
    queryKey: ["trending-shows"],
    queryFn: fetchTrendingShows,
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data,
  });
};

export const useContinueWatching = () => {
  return useQuery({
    queryKey: ["continue-watching"],
    queryFn: fetchContinueWatching,
    select: (data: any) => data.data,
  });
};
