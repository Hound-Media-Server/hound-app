import { apiClient } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

interface CollectionMeta {
  collection_id: number;
  collection_title: string;
  description: string;
  owner_username: string;
  is_primary: boolean;
  is_public: boolean;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

const fetchCollections = (): Promise<any> => {
  return apiClient("/collection/all");
};

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 5,
    select: (data: any) => data.data as CollectionMeta[],
  });
};
