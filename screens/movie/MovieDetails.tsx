import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { router } from "expo-router";
import { getAddToCollectionUrl } from "@/utils/navigation";
import { useModalStore } from "@/stores/modalStore";
import { useWatchlist } from "@/services/collectionService";
import { MediaTypeMovie } from "@/constants/MediaTypes";
import { MovieDetailsProps } from "@/app/movie/[id]";
import MediaPageTitle from "@/components/media_page/MediaPageTitle";
import SectionHeader from "@/components/media_page/SectionHeader";
import OverviewSkeleton from "@/components/media_page/OverviewSkeleton";
import MediaScores from "@/components/media_page/MediaScores";
import { useMediaScores, useMovieCollection } from "@/services/mediaDetailsService";
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
  const collection = details?.extra_data?.collection;
  const { data: collectionParts } = useMovieCollection(collection?.id);
  const { data: scores, isWaiting: isScoresWaiting } = useMediaScores(
    MediaTypeMovie,
    id,
  );

  const creators = details?.creators?.map((item: any) => item.name).join(", ");
  const metadata = formatMediaMetadata(details);
  return (
    <>
      <View className="flex-1 relative bg-primary">
        <ParallaxScrollView
          headerHeight={300}
          headerImage={
            details?.backdrop_uri ? (
              <Image
                source={{ uri: details?.backdrop_uri }}
                className="absolute w-full h-96"
                contentFit="cover"
              />
            ) : (
              <View className="absolute w-full h-96 bg-zinc-900 border-b border-zinc-800" />
            )
          }
        >
          <View className="px-5 sm:px-8 md:px-24 pb-8">
            <View className="me-5">
              <MediaPageTitle
                title={details?.media_title}
                logoUri={details?.logo_uri}
              />
              {!!metadata && (
                <ThemedText
                  className="text-secondary mt-1 opacity-80 sm:text-lg"
                  numberOfLines={2}
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
              {isScoresWaiting ? (
                <OverviewSkeleton />
              ) : (
                <ThemedText className="text-gray-400 text-md sm:text-lg mt-1">
                  {normalizeOverview(
                    scores?.short_overview || details?.overview,
                  )}
                </ThemedText>
              )}
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
                <ThemedText className="text-secondary opacity-80 text-xs sm:text-sm">
                  Last watched {movieWatchData}
                </ThemedText>
              )}
              <View className="mt-1">
                <MediaScores scores={scores} />
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                focusable
                hasTVPreferredFocus
                onPress={handlePlayPress}
                activeOpacity={0.75}
                className="p-2 mt-3 bg-secondary rounded-2xl w-[120px] sm:w-[150px] items-center"
              >
                <ThemedText className="text-primary text-md sm:text-lg">
                  {playLabel}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
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
                activeOpacity={0.75}
                className="p-2 mt-3 bg-white rounded-2xl w-11 h-11 items-center justify-center"
              >
                <Ionicons
                  name={watchlist.inWatchlist ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            {details?.cast?.length > 0 && (
              <View className="mt-2">
                <SectionHeader>
                  Cast
                </SectionHeader>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={details?.cast}
                    showDescription={true}
                    itemType="cast"
                  />
                </View>
              </View>
            )}
            {collectionParts?.length > 1 && (
              <View className="mt-2">
                <SectionHeader>{collection.name}</SectionHeader>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={collectionParts}
                    itemType="compact"
                  />
                </View>
              </View>
            )}
            {details?.recommendations?.length > 0 && (
              <View className="mt-2">
                <SectionHeader>
                  Similar Movies
                </SectionHeader>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={details.recommendations.filter(
                      (item: any) =>
                        !collectionParts?.some(
                          (part: any) => part.source_id === item.source_id,
                        ),
                    )}
                    itemType="compact"
                  />
                </View>
              </View>
            )}
          </View>
        </ParallaxScrollView>
        <TouchableOpacity
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
          activeOpacity={0.75}
          className="absolute top-12 right-4 z-50 p-2"
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
}
