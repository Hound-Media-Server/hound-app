import { LiveTVProps } from "@/app/(tabs)/live_tv";
import { ThemedText } from "@/components/ThemedText";
import { XtreamCategory } from "@/services/iptvService";
import { useLiveTVStore } from "@/stores/livePlayerStore";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  TouchableOpacity,
  TVFocusGuideView,
  useTVEventHandler,
  useWindowDimensions,
  View,
} from "react-native";

export default function IPTVScreenTV({
  iptvProviders,
  selectedProvider,
  setIPTVProviderID,
  categories,
}: LiveTVProps) {
  const iptvProvidersRef = useRef<FlatList>(null);
  const videoPlayerRef = useRef<View>(null);
  const resizePlayer = useLiveTVStore((s) => s.setRect);

  const { width: fw, height: fh } = useWindowDimensions();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const updatePlayer = () => {
    videoPlayerRef.current?.measureInWindow((x, y, width, height) => {
      resizePlayer({ x, y, width, height });
    });
  };

  const setFullscreen = () => {
    resizePlayer({ x: 0, y: 0, width: fw, height: fh });
    setIsFullscreen(true);
  };

  useEffect(() => {
    if (!isFullscreen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      updatePlayer();
      setIsFullscreen(false);
      return true;
    });
    return () => sub.remove();
  }, [isFullscreen]);

  return (
    <View
      className={"flex-1 px-5 md:px-12 " + (Platform.isTV ? "mt-20" : "mt-5")}
    >
      {wrapTVFocusGuideView(
        <FlatList
          data={iptvProviders}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 0,
            marginTop: 10,
            marginBottom: 20,
          }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              focusable
              onPress={() => setIPTVProviderID(item.iptv_provider_id)}
              onFocus={() =>
                Platform.isTV && setIPTVProviderID(item.iptv_provider_id)
              }
              className={
                "items-center justify-center rounded-xl p-2" +
                (item?.iptv_provider_id === selectedProvider?.iptv_provider_id
                  ? Platform.isTV
                    ? " bg-secondary/50"
                    : " bg-secondary"
                  : Platform.isTV
                    ? " bg-gray-600"
                    : " bg-gray-400") +
                (Platform.isTV ? " h-[40px] focus:bg-secondary" : "")
              }
              activeOpacity={Platform.isTV ? 1 : 0.75}
            >
              {
                <ThemedText
                  className={"text-primary" + (Platform.isTV ? " text-lg" : "")}
                >
                  {item?.name}
                </ThemedText>
              }
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.iptv_provider_id}
          ref={iptvProvidersRef}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              iptvProvidersRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
                viewPosition: 0.5,
              });
            }, 100);
          }}
        />,
      )}
      <View className="flex-row flex-1">
        <View className="w-[25%] pr-3">
          <FlashList<XtreamCategory>
            data={categories}
            keyExtractor={(item) => `category-${item.category_id}`}
            renderItem={({ item }) => (
              <Pressable
                className="bg-white/10 p-4 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white"
                focusable={Platform.isTV}
              >
                <ThemedText className="text-lg font-semibold text-white overflow-hidden line-clamp-1">
                  {item.category_name}
                </ThemedText>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <ThemedText
                className="text-xl font-semibold text-white mt-2"
                onPress={setFullscreen}
              >
                No Categories
              </ThemedText>
            )}
          />
        </View>
        <View
          ref={videoPlayerRef}
          className="bg-white w-[40%] p-3"
          style={{ aspectRatio: 16 / 9 }}
          onLayout={updatePlayer}
        />
        <View className="flex-1 ps-5 pe-2">
          <ThemedText type="defaultSemiBold" className="text-3xl text-white">
            BBC News
          </ThemedText>
          <ThemedText className="text-lg text-gray-300 mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
            voluptates, quidem deleniti tempora nisi voluptatem aperiam sint
            explicabo cum mollitia quia tenetur porro. Iusto eos aspernatur
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function wrapTVFocusGuideView(children: React.ReactNode) {
  if (!Platform.isTV) return children;
  return <TVFocusGuideView autoFocus>{children}</TVFocusGuideView>;
}
