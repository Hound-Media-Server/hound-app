import { View } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { getAddToCollectionUrl } from "@/utils/navigation";
import GradientBackgroundView from "@/components/media_page/GradientBackgroundView";
import {
  TVFocusButtonMore,
  TVFocusButtonText,
} from "@/components/TVFocusButton";
import { useModalStore } from "@/stores/modalStore";
import { useWatchlist } from "@/services/collectionService";
import { MediaTypeMovie } from "@/constants/MediaTypes";
import { MovieDetailsProps } from "@/app/movie/[id]";
import MediaPageTitle from "@/components/media_page/MediaPageTitle";
import MediaScores from "@/components/media_page/MediaScores";
import { useMediaScores } from "@/services/mediaDetailsService";
import { formatMediaMetadata, normalizeOverview } from "@/utils/mediaMetadata";

export default function MovieDetails({
  id,
  details,
  continueWatching,
  movieWatchData,
  playLabel,
  handlePlayPress,
}: MovieDetailsProps) {
  const openModal = useModalStore((s) => s.open);
  const watchlist = useWatchlist(details);
  const { data: scores, isWaiting: isScoresWaiting } = useMediaScores(
    MediaTypeMovie,
    id,
  );

  const creators = details?.creators?.map((item: any) => item.name).join(", ");
  const metadata = formatMediaMetadata(details);
  const overview = normalizeOverview(
    scores?.short_overview || details?.overview,
  );
  return (
    <View className="flex-1 absolute inset-0 bg-red-500">
      <GradientBackgroundView
        uri={details?.backdrop_uri as string}
        className="h-full w-full px-8 py-8"
      >
        <View
          className={overview.length > 300 ? "flex-1 w-4/5" : "flex-1 w-3/5"}
        >
          <View className="absolute bottom-0">
            <MediaPageTitle
              title={details?.media_title}
              logoUri={details?.logo_uri}
            />
            {!!metadata && (
              <ThemedText
                className="text-secondary mt-1 opacity-80 sm:text-lg"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {metadata}
              </ThemedText>
            )}
            {!!creators && (
              <ThemedText className="text-gray-300 mt-1 sm:text-lg">
                {creators}
              </ThemedText>
            )}
            <ThemedText
              className={`text-gray-400 text-md sm:text-lg mt-1 ${isScoresWaiting ? "opacity-0" : ""}`}
            >
              {overview}
            </ThemedText>
            {details?.cast?.length > 0 && (
              <ThemedText className="italic text-gray-200 text-sm mt-1">
                Starring{" "}
                {details.cast
                  .slice(0, 3)
                  .map((item: any) => item.name)
                  .join(", ")}
                {details.cast.length > 3 && ", and more..."}
              </ThemedText>
            )}
            {movieWatchData && (
              <ThemedText className="text-secondary opacity-80 text-xs sm:text-sm mt-1">
                Last watched {movieWatchData}
              </ThemedText>
            )}
            {scores && (
              <View className="mt-2">
                <MediaScores scores={scores} />
              </View>
            )}
            <View className="flex-row gap-3 mt-3">
              <TVFocusButtonMore
                onPress={() =>
                  openModal({
                    type: "playOptions",
                    props: {
                      mediaItem: {
                        ...details,
                        watch_progress: continueWatching?.watch_progress,
                      },
                      modalTitle: details?.media_title,
                      autoFocus: true,
                      showCollections: true,
                    },
                  })
                }
              />
              <TVFocusButtonText
                onPress={handlePlayPress}
                label={playLabel}
                hasTVPreferredFocus
              />
              <TVFocusButtonText
                onPress={() =>
                  watchlist.supported
                    ? watchlist.toggle()
                    : router.push(
                        getAddToCollectionUrl(
                          MediaTypeMovie,
                          details?.media_source,
                          details?.source_id,
                        ),
                      )
                }
                label={
                  watchlist.supported
                    ? watchlist.inWatchlist
                      ? "In Watchlist"
                      : "Add to Watchlist"
                    : "Add to Collection"
                }
              />
            </View>
          </View>
        </View>
      </GradientBackgroundView>
    </View>
  );
}
