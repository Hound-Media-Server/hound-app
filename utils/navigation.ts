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
  if (params.playerSettings) queryParts.push(`playerSettings=${params.playerSettings}`);

  return `/stream/${encodedData}?${queryParts.join("&")}` as any;
}

export function getSelectStreamUrl(params: StreamUrlParams) {
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`type=${params.type}`);
  if (params.title) queryParts.push(`title=${encodeURIComponent(params.title)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);
  if (params.playerSettings) queryParts.push(`playerSettings=${params.playerSettings}`);

  return `/select-stream?${queryParts.join("&")}` as any;
}

export function getAddToCollectionUrl(media_type: string, media_source: string, source_id: string) {
  const queryParts = [];
  queryParts.push(`media_type=${media_type}`);
  queryParts.push(`media_source=${media_source}`);
  queryParts.push(`source_id=${source_id}`);

  return `/add-to-collection?${queryParts.join("&")}` as any;
}