import { apiClient } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

export interface IPTVProvider {
  iptv_provider_id: number;
  iptv_provider_type: string;
  name: string;
  host: string;
  username: string;
  is_default: boolean;
  last_refresh: string;
}

interface IPTVProvidersResponse {
  data: IPTVProvider[];
}

const fetchIPTVProviders = (): Promise<IPTVProvidersResponse> => {
  return apiClient("/iptv_providers");
};

export const useIPTVProviders = () => {
  return useQuery({
    queryKey: ["iptv-providers"],
    queryFn: fetchIPTVProviders,
    select: (data: IPTVProvidersResponse) => data.data as IPTVProvider[],
  });
};

export interface XtreamCategory {
  category_id: number;
  category_name: string;
  parent_id: number;
}

interface XtreamCategoriesResponse {
  data: XtreamCategory[];
}

const fetchXtreamCategories = (iptvProviderID: number): Promise<XtreamCategoriesResponse> => {
  return apiClient(`/live/${iptvProviderID}/categories`);
};

export const useXtreamCategories = (iptvProviderID: number | undefined, iptvProviderType: string | undefined) => {
  return useQuery({
    queryKey: ["xtream-categories", iptvProviderID],
    queryFn: () => fetchXtreamCategories(iptvProviderID as number),
    select: (data: any) => data.data as XtreamCategory[],
    staleTime: 1000 * 60 * 10,
    enabled: !!iptvProviderID && iptvProviderType === "xtream",
  });
};

const fetchXtreamChannels = (iptvProviderID: number, categoryID: number): Promise<any> => {
    return apiClient(`/live/${iptvProviderID}/channels?category_id=${categoryID}`)
}

export const useXtreamChannels = (iptvProviderID: number | null, categoryID: number | null) => {
    return useQuery({
        queryKey: ["xtream-channels", iptvProviderID, categoryID],
        queryFn: () => fetchXtreamChannels(iptvProviderID as number, categoryID as number),
        enabled: iptvProviderID !== null && categoryID !== null,
        select: (data: any) => data.data,
    })
}
