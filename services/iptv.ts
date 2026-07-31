import { apiClient } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

const fetchIPTVProviders = (): Promise<any> => {
  return apiClient("/iptv_providers");
};

export const useIPTVProviders = () => {
  return useQuery({
    queryKey: ["iptv-providers"],
    queryFn: fetchIPTVProviders,
    select: (data: any) => data.data,
  });
};

const fetchXtreamCategories = (iptvProviderID: number): Promise<any> => {
  return apiClient(`/live/${iptvProviderID}/categories`);
};

export const useXtreamCategories = (iptvProviderID: number) => {
  return useQuery({
    queryKey: ["xtream-categories", iptvProviderID],
    queryFn: () => fetchXtreamCategories(iptvProviderID),
    select: (data: any) => data.data,
  });
};

const fetchXtreamChannels = (iptvProviderID: number | null, categoryID: number | null): Promise<any> => {
    return apiClient(`/live/${iptvProviderID}/channels?category_id=${categoryID}`)
}

export const useXtreamChannels = (iptvProviderID: number | null, categoryID: number | null) => {
    return useQuery({
        queryKey: ["xtream-channels", iptvProviderID, categoryID],
        queryFn: () => fetchXtreamChannels(iptvProviderID, categoryID),
        enabled: iptvProviderID !== null && categoryID !== null,
        select: (data: any) => data.data,
    })
}
