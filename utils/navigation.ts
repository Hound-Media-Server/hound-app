export interface StreamUrlParams {
  id: string;
  type: string;
  title?: string;
  season?: number | string;
  episode?: number | string;
  startTime?: number | string;
}

export function getStreamUrl(encodedData: string, params: StreamUrlParams) {
  const queryParts = [];
  queryParts.push(`id=${params.id}`);
  queryParts.push(`type=${params.type}`);
  if (params.title) queryParts.push(`title=${encodeURIComponent(params.title)}`);
  if (params.season) queryParts.push(`season=${params.season}`);
  if (params.episode) queryParts.push(`episode=${params.episode}`);
  if (params.startTime) queryParts.push(`startTime=${params.startTime}`);

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

  return `/select-stream?${queryParts.join("&")}` as any;
}
