import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

interface ServerInfoResponse {
  data: {
    server_id: string;
    latest_version: string;
    version: string;
    buildTime: string;
    commit: string;
  };
}

export const fetchServerInfo = (): Promise<ServerInfoResponse> => {
  return apiClient(`/server_info`);
};

export const useServerInfo = () => {
  return useQuery({
    queryKey: ["server-info"],
    queryFn: fetchServerInfo,
    staleTime: 1000 * 60 * 10, // 10 mins
  });
};