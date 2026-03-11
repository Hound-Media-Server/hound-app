import { getSetting } from "@/stores/settingsStore";
import { fetchMediaFiles, fetchProviders } from "@/services/providerService";
import { MediaTypeMovie, MediaTypeTVShow, MediaType } from "@/constants/MediaTypes";

export interface StreamUrlParams {
  id: string;
  mediaType: string;
  modalTitle?: string;
  season?: number | string;
  episode?: number | string;
  startTime?: number | string;
  playerSettings?: string;
}

export function getStreamUrl(encodedData: string, streamsMatch: boolean, params: StreamUrlParams) {
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`mediaType=${params.mediaType}`);
  queryParts.push(`streamsMatch=${streamsMatch ? "true" : "false"}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);

  return `/stream/${encodeURIComponent(encodedData)}?${queryParts.join("&")}` as any;
}

// direct play or select stream based on user preferences
export async function getSelectStreamUrl(params: StreamUrlParams, forceSelect?: boolean) {
  const playAction = getSetting("defaultPlayAction");
  // if file is in hound, and type is direct, play without fetching other providers
  if (playAction === "direct" && !forceSelect) {
    try {
      const mediaFilesRes = await fetchMediaFiles(
        params.mediaType,
        params.id,
        params.season ? parseInt(params.season as string, 10) : undefined,
        params.episode ? parseInt(params.episode as string, 10) : undefined
      );
      if (mediaFilesRes?.data?.providers?.[0].streams?.length > 0) {
        return getStreamUrl(mediaFilesRes?.data?.providers?.[0].streams?.[0].encoded_data, false, params);
      }
      // prioritize media files, if not found, then fetch
      // this does add a delay to fetching providers
      const providersRes = await fetchProviders(
        params.mediaType,
        params.id,
        params.season ? parseInt(params.season as string, 10) : undefined,
        params.episode ? parseInt(params.episode as string, 10) : undefined
      );
      if (providersRes?.data?.providers?.[0].streams?.length > 0) {
        return getStreamUrl(providersRes?.data?.providers?.[0].streams?.[0].encoded_data, false, params);
      }
    } catch (e) {
      console.error("Error fetching providers for direct play:", e);
    }
  }
  // show select stream modal case
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`mediaType=${params.mediaType}`);
  if (params.modalTitle) queryParts.push(`modalTitle=${encodeURIComponent(params.modalTitle)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);

  return `/select-stream?${queryParts.join("&")}` as any;
}

export function getMediaPageUrl(media_type: string, media_source: string, source_id: string): string {
  if (!media_type) return "";
  const type = media_type === MediaTypeMovie ? "movie" : "tv";
  return `/${type}/${media_source + "-" + source_id}`;
}

export function getAddToCollectionUrl(media_type: string, media_source: string, source_id: string) {
  const type = media_type === MediaTypeTVShow ? MediaTypeTVShow : MediaTypeMovie;
  const queryParts = [];
  queryParts.push(`media_type=${type}`);
  queryParts.push(`media_source=${media_source}`);
  queryParts.push(`source_id=${source_id}`);

  return `/add-to-collection?${queryParts.join("&")}` as any;
}

export function getSeasonsUrl(id: string) {
  const queryParts = [];
  queryParts.push(`id=${id}`);

  return `/seasons?${queryParts.join("&")}` as any;
}