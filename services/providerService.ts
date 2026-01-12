import { apiClient } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

/*
    id is in format tmdb-1234, etc.
*/
export const fetchMovieProviders = (id: string): Promise<any> => {
  return apiClient(`/movie/${id}/providers`);
};

export const fetchShowProviders = (
  id: string,
  seasonNumber?: number,
  episodeNumber?: number,
): Promise<any> => {
  return apiClient(
    `/tv/${id}/providers?season=${seasonNumber}&episode=${episodeNumber}`,
  );
};

// Fetching should only run when modal is open, so pass opened
// state in enabled
export const useMovieProviders = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["movie-providers", id],
    queryFn: () => fetchMovieProviders(id),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    select: (data: any) => data.data,
  });
};

export const useShowProviders = (
  id: string,
  enabled: boolean,
  seasonNumber?: number,
  episodeNumber?: number,
) => {
  return useQuery({
    queryKey: ["show-providers", id, seasonNumber, episodeNumber],
    queryFn: () => fetchShowProviders(id, seasonNumber, episodeNumber),
    enabled: enabled,
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data,
  });
};
