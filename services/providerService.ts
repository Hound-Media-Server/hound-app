import { apiClient } from "./apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";

export const fetchMediaFiles = async (
  mediaType: string,
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
  mediaType: string,
  id: string,
  season?: number,
  episode?: number
): Promise<any> => {
  if (mediaType === "tvshow") {
    mediaType = "tv";
  }
  const queryParams = new URLSearchParams();
  if (season) queryParams.append("season", season.toString());
  if (season && episode) queryParams.append("episode", episode.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return apiClient(`/${mediaType}/${id}/providers${queryString}`);
};

export const useUnifiedStreams = (
  mediaType: string,
  id: string,
  season?: number,
  episode?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["unified-streams", mediaType, id, season, episode],
    queryFn: async () => {
      const [mediaFilesData, providersData] = await Promise.all([
        fetchMediaFiles(mediaType, id, season, episode).catch((err) => {console.log("mediaFilesData failed", err); return null}),
        fetchProviders(mediaType, id, season, episode).catch((err) => {console.log("providersData failed", err); return null}),
      ]);

      const mediaFilesProviders = (mediaFilesData as any)?.data?.providers || [];
      const externalProviders = (providersData as any)?.data?.providers || [];

      const mediaFilesStreams = mediaFilesProviders.flatMap((p: any) => p.streams || []);
      const externalStreams = externalProviders.flatMap((p: any) => p.streams || []);
      const allStreams = [...mediaFilesStreams, ...externalStreams];
      
      return {
        ...(providersData as any),
        ...(mediaFilesData as any),
        streams: allStreams,
      };
    },
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
      mediaType: string;
      id: string;
      season?: number;
      episode?: number;
    }) => {
      const [mediaFilesData, providersData] = await Promise.all([
        fetchMediaFiles(mediaType, id, season, episode).catch(() => ({})),
        fetchProviders(mediaType, id, season, episode).catch(() => ({})),
      ]);
      const mediaFilesProviders = (mediaFilesData as any)?.data?.providers || [];
      const externalProviders = (providersData as any)?.data?.providers || [];

      const mediaFilesStreams = mediaFilesProviders.flatMap((p: any) => p.streams || []);
      const externalStreams = externalProviders
        .flatMap((p: any) => p.streams || []);
      const allStreams = [...mediaFilesStreams, ...externalStreams];
      
      return {
        ...(providersData as any),
        ...(mediaFilesData as any),
        providers: null,
        streams: allStreams,
      };
    },
  });
};