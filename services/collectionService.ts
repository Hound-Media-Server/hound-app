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

interface AddToCollectionPayload {
  media_type: string;
  media_source: string;
  source_id: string;
}

const fetchCollections = (): Promise<any> => {
  return apiClient("/collection/all");
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

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data as CollectionMeta[],
  });
};

export const useAddToCollection = () => {
  return useMutation({
    mutationFn: addToCollection,
  });
};
