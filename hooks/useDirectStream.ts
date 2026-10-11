import { useEffect, useMemo, useState } from "react";
import { useMediaFiles, useProviders } from "@/services/providerService";

// Resolve media files first, then retain provider results for direct stream retries.
export function useDirectStream({
  mediaType,
  id,
  season,
  episode,
  previousEncodedData,
}: {
  mediaType: string;
  id: string;
  season?: number;
  episode?: number;
  previousEncodedData?: string;
}) {
  const [selectedStream, setSelectedStream] = useState<{
    encodedData: string;
    streamsMatch: boolean;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const mediaFiles = useMediaFiles(mediaType, id, season, episode);
  const providers = useProviders(mediaType, id, season, episode);
  // Fetch concurrently, but wait for the media file result before choosing a provider.
  const streams = useMemo(() => {
    const mediaFileStreams = (mediaFiles.data?.data?.providers || []).flatMap(
      (provider: any) => provider.streams || [],
    );
    if (mediaFileStreams.length > 0) {
      return mediaFileStreams;
    }
    const providerStreams = (providers.data?.data?.providers || []).flatMap(
      (provider: any) => provider.streams || [],
    );
    return mediaFiles.isPending ? [] : providerStreams;
  }, [mediaFiles.data, mediaFiles.isPending, providers.data]);
  const hasMediaFile = (mediaFiles.data?.data?.providers || []).some(
    (provider: any) => provider.streams?.length,
  );

  useEffect(() => {
    if (selectedStream || streams.length === 0) return;
    const match = previousEncodedData
      ? streams.find((stream: any) => stream.encoded_data === previousEncodedData)
      : null;
    if (
      !hasMediaFile && previousEncodedData && !match &&
      (mediaFiles.isPending || providers.isPending)
    ) return;
    setSelectedStream({
      encodedData: (match || streams[0]).encoded_data,
      streamsMatch: !!match,
    });
  }, [
    streams,
    previousEncodedData,
    selectedStream,
    mediaFiles.isPending,
    providers.isPending,
    hasMediaFile,
  ]);

  return {
    selectedStream,
    tryNextStream: () => {
      if (hasMediaFile) return;
      const index = streams.findIndex((stream: any) => stream.encoded_data === selectedStream?.encodedData);
      if (attempt >= 3 || index < 0 || !streams[index + 1]) return;
      setAttempt(attempt + 1);
      setSelectedStream({ encodedData: streams[index + 1].encoded_data, streamsMatch: false });
    },
    isLoading: !selectedStream &&
      (mediaFiles.isPending || providers.isPending || streams.length > 0),
    isError: mediaFiles.isError && providers.isError,
  };
}
