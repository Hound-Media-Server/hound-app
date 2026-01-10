import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

export const fetchSearch = (query: string): Promise<any> => {
  return apiClient(`/search/?q=${query}`); 
};

export const useSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    staleTime: 1000 * 60 * 5, // cache is low for now since we don't want to cache partial searches when typing
    select: (data: any) => data.data,
    enabled: enabled && query.length > 0,
  });
};