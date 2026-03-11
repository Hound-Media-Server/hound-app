export const MediaTypeMovie = "movie";
export const MediaTypeTVShow = "tvshow";
export const MediaTypeEpisode = "episode";

export type MediaType = typeof MediaTypeMovie | typeof MediaTypeTVShow | typeof MediaTypeEpisode;
