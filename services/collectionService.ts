import { apiClient } from "./apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaTypeMovie, MediaTypeTVShow, MediaType } from "../constants/MediaTypes";
import { Toast } from "toastify-react-native";
import { useServerInfo } from "./internalService";
import { ServerVersionGTE } from "../utils/version";

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
  media_type: MediaType;
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
  media_type: MediaType;
  media_source: string;
  source_id: string;
}

const fetchAllCollections = (): Promise<any> => {
  return apiClient("/collection/all");
};

const fetchPublicCollections = (): Promise<any> => {
  return apiClient("/collection/public");
};

const fetchCollectionContents = (
  collectionID: number | string,
  media_type?: MediaType,
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
  collectionID,
  payload,
}: {
  collectionID: number | string;
  payload: AddToCollectionPayload;
}): Promise<any> => {
  return apiClient(`/collection/${collectionID}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const deleteFromCollection = ({
  collectionID,
  mediaType,
  mediaSource,
  sourceID,
}: {
  collectionID: number | string;
  mediaType: MediaType;
  mediaSource: string;
  sourceID: string;
}): Promise<any> => {
  const payload: AddToCollectionPayload = {
    media_type: mediaType,
    media_source: mediaSource,
    source_id: sourceID,
  };
  return apiClient(`/collection/${collectionID}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
};

export const useAllCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchAllCollections,
    staleTime: 1000 * 60 * 1,
    select: (data: any) => data.data as CollectionMeta[],
  });
};

export const usePublicCollections = () => {
  return useQuery({
    queryKey: ["public-collections"],
    queryFn: fetchPublicCollections,
    staleTime: 1000 * 60 * 1,
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
    staleTime: 1000 * 60 * 1,
    select: (data) => data.data,
  });
};

export const useHoundLibrary = (
  media_type?: MediaType,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCollection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection-contents", variables.collectionID],
      });
    },
  });
};

export const useDeleteFromCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFromCollection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection-contents", variables.collectionID],
      });
    },
  });
};
export const useWatchlist = (item: any, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { data: serverInfo } = useServerInfo();
  const supported = ServerVersionGTE(serverInfo?.data?.version, "0.4.2");
  const params = new URLSearchParams({
    media_type: item?.media_type,
    media_source: item?.media_source,
    source_id: String(item?.source_id),
  });
  const { data: inWatchlist } = useQuery({
    queryKey: ["watchlist", params.toString()],
    queryFn: () =>
      apiClient<{ data: { contains: boolean } }>(`/collection/watchlist/contains?${params}`),
    select: (data) => data.data.contains,
    enabled: enabled && supported && !!item?.source_id,
  });
  const { mutate } = useMutation({
    mutationFn: (add: boolean) =>
      apiClient(`/collection/watchlist`, {
        method: add ? "POST" : "DELETE",
        body: JSON.stringify({
          media_type: item.media_type,
          media_source: item.media_source,
          source_id: String(item.source_id),
        }),
      }),
    onSuccess: (_, add) => {
      Toast.success(add ? "Added to Watchlist" : "Removed from Watchlist");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection-contents"] });
    },
    onError: (error: any) => Toast.error(error?.message || "Failed to update watchlist"),
  });
  return { supported, inWatchlist: !!inWatchlist, toggle: () => mutate(!inWatchlist) };
};
