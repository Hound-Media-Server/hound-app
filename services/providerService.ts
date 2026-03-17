import { apiClient } from "./apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MediaTypeMovie, MediaTypeTVShow, MediaType } from "../constants/MediaTypes";

export const fetchMediaFiles = async (
  mediaType: MediaType | string,
  id: string,
  season?: number | null,
  episode?: number | null
): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (season) queryParams.append("season", season.toString());
  if (season && episode) queryParams.append("episode", episode.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return apiClient(`/${mediaType}/${id}/media_files${queryString}`);
};

export const fetchProviders = async (
  mediaType: MediaType | string,
  id: string,
  season?: number | null,
  episode?: number | null,
): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (season) queryParams.append("season", season.toString());
  if (season && episode) queryParams.append("episode", episode.toString());
  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";
  return apiClient(`/${mediaType}/${id}/providers${queryString}`);
};

export const fetchUnifiedStreams = async (
  mediaType: MediaType | string,
  id: string,
  season?: number | null,
  episode?: number | null,
) => {
  const [mediaFilesData, providersData] = await Promise.all([
    fetchMediaFiles(mediaType, id, season, episode).catch((err) => {
      console.log("mediaFilesData failed", err);
      return null;
    }),
    fetchProviders(mediaType, id as string, season, episode).catch((err) => {
      console.log("providersData failed", err);
      return null;
    }),
  ]);

  const mediaFilesProviders = (mediaFilesData as any)?.data?.providers || [];
  const externalProviders = (providersData as any)?.data?.providers || [];

  const mediaFilesStreams = mediaFilesProviders.flatMap(
    (p: any) => p.streams || [],
  );
  const externalStreams = externalProviders.flatMap(
    (p: any) => p.streams || [],
  );
  const allStreams = [...mediaFilesStreams, ...externalStreams];

  return {
    ...(providersData as any),
    ...(mediaFilesData as any),
    streams: allStreams,
  };
};

export const useMediaFiles = (
  mediaType: MediaType | string,
  id: string,
  season?: number | null,
  episode?: number | null
) => {
  return useQuery({
    queryKey: ["media-files", mediaType, id, season, episode],
    queryFn: () => fetchMediaFiles(mediaType, id, season, episode),
  });
};

export const useProviders = (
  mediaType: MediaType | string,
  id: string,
  season?: number | null,
  episode?: number | null
) => {
  return useQuery({
    queryKey: ["providers", mediaType, id, season, episode],
    queryFn: () => fetchProviders(mediaType, id, season, episode),
  });
};

export const useUnifiedStreams = (
  mediaType: MediaType | string,
  id: string,
  season?: number,
  episode?: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["unified-streams", mediaType, id, season, episode],
    queryFn: () => fetchUnifiedStreams(mediaType, id, season, episode),
    enabled,
  });
};

export const useUnifiedStreamsMutation = () => {
  return useMutation({
    mutationFn: async ({
      mediaType,
      id,
      season,
      episode,
    }: {
      mediaType: MediaType | string;
      id: string;
      season?: number;
      episode?: number;
    }) => {
      const data = await fetchUnifiedStreams(mediaType, id, season, episode);
      return {
        ...data,
        providers: null, 
      };
    },
  });
};