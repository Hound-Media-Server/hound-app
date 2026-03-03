import { apiClient } from "./apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface CollectionMeta {
  collection_id: number;
  collection_title: string;
  description: string;
  owner_username: string;
  is_primary: boolean;
  is_public: boolean;
  thumbnail_uri: string;
  created_at: string;
  updated_at: string;
}

interface Genre {
  genre_id: number;
  genre: string;
  media_type: string;
  media_source: string;
  source_id: number;
}

interface CollectionRecord {
  media_type: string;
  media_source: string;
  source_id: string;
  media_title: string;
  original_title: string;
  status: string;
  overview: string;
  duration: number;
  release_date: string;
  last_air_date: string;
  next_air_date: string;
  thumbnail_uri: string;
  backdrop_uri: string;
  logo_uri: string;
  genres: Genre[];
  original_language: string;
  origin_country: string[];
}

interface CollectionResponseData {
  records: CollectionRecord[];
  collection: CollectionMeta;
  total_records: number;
  limit: number;
  offset: number;
}

interface CollectionContentsResponse {
  data: CollectionResponseData;
  status: string;
}

interface AddToCollectionPayload {
  media_type: string;
  media_source: string;
  source_id: string;
}

const fetchAllCollections = (): Promise<any> => {
  return apiClient("/collection/all");
};

const fetchCollectionContents = (
  collectionID: number | string,
  media_type?: "movie" | "tvshow",
  genre_id?: number,
  limit?: number,
  offset?: number
): Promise<CollectionContentsResponse> => {
  const params = new URLSearchParams();
  if (media_type) params.append("media_type", media_type);
  if (genre_id) params.append("genre_id", genre_id.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  if (offset !== undefined) params.append("offset", offset.toString());

  const queryString = params.toString();
  const url = `/collection/${collectionID}${queryString ? `?${queryString}` : ""}`;
  return apiClient(url);
};

const addToCollection = ({
  collectionId,
  payload,
}: {
  collectionId: number | string;
  payload: AddToCollectionPayload;
}): Promise<any> => {
  return apiClient(`/collection/${collectionId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const useAllCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchAllCollections,
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data as CollectionMeta[],
  });
};

export const useCollectionContents = (
  collectionID: number | string,
  limit?: number,
  offset?: number
) => {
  return useQuery({
    queryKey: ["collection-contents", collectionID, limit, offset],
    queryFn: () => fetchCollectionContents(collectionID, undefined, undefined, limit, offset),
    select: (data) => data.data,
  });
};

export const useHoundLibrary = (
  media_type?: "movie" | "tvshow",
  genre_id?: number,
  limit?: number,
  offset?: number
) => {
  return useQuery({
    queryKey: ["collection-contents", "hound-library", media_type, genre_id, limit, offset],
    queryFn: () => fetchCollectionContents("hound-library", media_type, genre_id, limit, offset),
    select: (data) => data.data,
  });
};

export const useAddToCollection = () => {
  return useMutation({
    mutationFn: addToCollection,
  });
};
