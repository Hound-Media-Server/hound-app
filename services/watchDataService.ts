import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

/*
    For fetching watched media and resume progress
*/

const fetchMovieWatchData = (id: string) => {
    return apiClient(`/movie/${id}/history`); 
}

const fetchShowWatchData = (id: string, seasonNum: number) => {
    return apiClient(`/tv/${id}/season/${seasonNum}/history`); 
}

const fetchMovieWatchProgress = (id: string) => {
    return apiClient(`/movie/${id}/playback`);
}

const fetchShowWatchProgress = (id: string, seasonNum: number) => {
    return apiClient(`/tv/${id}/season/${seasonNum}/playback`);
}

export const useMovieWatchData = (id: string) => {
    return useQuery({
        queryKey: ['movie-watch-data', id],
        queryFn: () => fetchMovieWatchData(id),
        staleTime: 1000 * 60 * 5,
    });
}

export const useShowWatchData = (id: string, seasonNum: number) => {
    return useQuery({
        queryKey: ['show-watch-data', id, seasonNum],
        queryFn: () => fetchShowWatchData(id, seasonNum),
        staleTime: 1000 * 60 * 5,
        select: (data: any) => {
            const latest = data.data.reduce((a: any, b: any) =>
              new Date(a.rewatch_started_at) > new Date(b.rewatch_started_at)
                ? a
                : b
            );
            const watchedEpisodeIDs = (latest.watch_events || [])
              .map((event: any) => parseInt(event.source_id, 10))
              .filter((tmdbID: number) => !isNaN(tmdbID));
            return [...new Set(watchedEpisodeIDs)];
        },
    });
}

export const useMovieWatchProgress = (id: string) => {
    return useQuery({
        queryKey: ['movie-watch-progress', id],
        queryFn: () => fetchMovieWatchProgress(id),
        staleTime: 1000 * 60 * 5,
    });
}

export interface WatchProgress {
    episode_id: string;
    stream_protocol: string;
    encoded_data: string;
    current_progress_seconds: number;
    total_duration_seconds: number;
}

// returns a Map[string, WatchProgress] where int key is episode_id
export const useShowWatchProgress = (id: string, seasonNum: number) => {
    return useQuery({
        queryKey: ['show-watch-progress', id, seasonNum],
        queryFn: () => fetchShowWatchProgress(id, seasonNum),
        staleTime: 1000 * 60 * 5,
        select: (data: any) => {
            const progressMap = new Map<string, WatchProgress>();
            data.data?.map((item: WatchProgress) => {
                progressMap.set(item.episode_id, item);
            });
            return progressMap;
        },
    });
}