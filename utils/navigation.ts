import { getSetting } from "@/stores/settingsStore";
import { fetchMovieProviders, fetchShowProviders } from "@/services/providerService";

export interface StreamUrlParams {
  id: string;
  type: string;
  title?: string;
  season?: number | string;
  episode?: number | string;
  startTime?: number | string;
  playerSettings?: string;
}

export function getStreamUrl(encodedData: string, streamsMatch: boolean, params: StreamUrlParams) {
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`type=${params.type}`);
  queryParts.push(`streamsMatch=${streamsMatch ? "true" : "false"}`);
  if (params.title) queryParts.push(`title=${encodeURIComponent(params.title)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);

  return `/stream/${encodeURIComponent(encodedData)}?${queryParts.join("&")}` as any;
}

// direct play or select stream based on user preferences
export async function getSelectStreamUrl(params: StreamUrlParams, forceSelect?: boolean) {
  const playAction = getSetting("playAction");

  if (playAction === "direct" && !forceSelect) {
    try {
      let providersRes;
      if (params.type === "movie") {
        providersRes = await fetchMovieProviders(params.id);
      } else if (params.type === "tv") {
        providersRes = await fetchShowProviders(
          params.id,
          params.season ? parseInt(params.season as string, 10) : undefined,
          params.episode ? parseInt(params.episode as string, 10) : undefined
        );
      }
      const firstStream = providersRes?.data?.providers?.[0]?.streams?.[0];
      if (firstStream) {
        return getStreamUrl(firstStream.encoded_data, false, params);
      }
    } catch (e) {
      console.error("Error fetching providers for direct play:", e);
    }
  }
  // show select stream modal case
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`type=${params.type}`);
  if (params.title) queryParts.push(`title=${encodeURIComponent(params.title)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${encodeURIComponent(params.playerSettings)}`);

  return `/select-stream?${queryParts.join("&")}` as any;
}

export function getMediaPageUrl(media_type: string, media_source: string, source_id: string): string {
  if (!media_type) return "";
  media_type = media_type === "tvshow" ? "tv" : media_type;
  return `/${media_type === "movie" ? "movie" : "tv"}/${media_source + "-" + source_id}`;
}

export function getAddToCollectionUrl(media_type: string, media_source: string, source_id: string) {
  media_type = media_type === "tvshow" ? "tv" : media_type;
  const queryParts = [];
  queryParts.push(`media_type=${media_type}`);
  queryParts.push(`media_source=${media_source}`);
  queryParts.push(`source_id=${source_id}`);

  return `/add-to-collection?${queryParts.join("&")}` as any;
}

export function getSeasonsUrl(id: string) {
  const queryParts = [];
  queryParts.push(`id=${id}`);

  return `/seasons?${queryParts.join("&")}` as any;
}