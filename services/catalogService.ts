import { apiClient } from "./apiClient";
import { useQueries, useQuery } from "@tanstack/react-query";

const fetchTrendingMovies = (): Promise<any> => {
  return apiClient("/catalog/trending-movies");
};

const fetchTrendingShows = (): Promise<any> => {
  return apiClient("/catalog/trending-shows");
};

export const fetchContinueWatching = (): Promise<any> => {
  return apiClient("/continue_watching");
};

export const fetchUserHomeRows = (): Promise<any> => {
  return apiClient("/home");
};

export const fetchHomeRow = (homeRowIndex: number): Promise<any> => {
  return apiClient(`/home/${homeRowIndex}`);
};


export const useTrendingMovies = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trending-movies"],
    queryFn: fetchTrendingMovies,
    staleTime: 1000 * 60 * 120, // cache for 120 mins
    select: (data: any) => data.data,
    enabled,
  });
};

export const useTrendingShows = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trending-shows"],
    queryFn: fetchTrendingShows,
    staleTime: 1000 * 60 * 120,
    select: (data: any) => data.data,
    enabled,
  });
};

export const useContinueWatching = () => {
  return useQuery({
    queryKey: ["continue-watching"],
    queryFn: fetchContinueWatching,
    select: (data: any) => data.data,
  });
};

export const useUserHomeRowsList = (enabled: boolean) => {
  return useQuery({
    queryKey: ["home-rows"],
    queryFn: fetchUserHomeRows,
    select: (data: any) => data.data,
    enabled,
  });
};

export const useHomeRows = (length: number, enabled: boolean) => {
  return useQueries({
    queries: Array.from({ length: length }, (_, i) => i).map((id) => ({
      queryKey: ["home-rows", id],
      queryFn: () => fetchHomeRow(id),
      select: (data: any) => data.data,
      enabled: enabled,
    })),
  });
};