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
  streamsMatch?: boolean;
  previousEncodedData?: string; // previous watched stream, will be prioritized if autoSelect is true
}

export function getStreamUrl(encodedData: string, params: StreamUrlParams) {
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`mediaType=${params.mediaType}`);
  if (params.streamsMatch) queryParts.push(`streamsMatch=true`);
  if (params.previousEncodedData) queryParts.push(`previousEncodedData=${encodeURIComponent(params.previousEncodedData)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);

  return `/stream/${encodeURIComponent(encodedData)}?${queryParts.join("&")}` as any;
}

// direct play or select stream based on user preferences
// forceSelect -> user explicitly wants to see the select stream modal
export function getSelectStreamUrl(params: StreamUrlParams, forceSelect?: boolean) {
  const playAction = getSetting("defaultPlayAction");
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`mediaType=${params.mediaType}`);
  if (params.modalTitle) queryParts.push(`modalTitle=${encodeURIComponent(params.modalTitle)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);
  if (params.previousEncodedData) queryParts.push(`previousEncodedData=${encodeURIComponent(params.previousEncodedData)}`);

  // In direct play, select-stream modal will resolve the top result, 
  // attempting to match previousEncodeData if available
  if (playAction === "direct" && !forceSelect) {
    queryParts.push("autoSelect=true");
  }

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