import { LiveTVProps } from "@/app/(tabs)/live_tv";
import { ThemedText } from "@/components/ThemedText";
import {
  useChannelEPGs,
  useChannels,
  XtreamCategory,
} from "@/services/iptvService";
import { useLiveTVStore } from "@/stores/livePlayerStore";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useKeepAwake } from "expo-keep-awake";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  findNodeHandle,
  Platform,
  Pressable,
  TVFocusGuideView,
  useWindowDimensions,
  View,
} from "react-native";

export interface NowPlayingInfo {
  name: string;
  description: string;
  program_title: string;
  program_description: string;
  start_time: string;
  stop_time: string;
}

export interface EPGProgrammeLanguage {
  text: string;
  lang?: string;
}

export interface EPGProgramme {
  epg_channel_id: string;
  start_time: string;
  stop_time: string;
  titles: EPGProgrammeLanguage[];
  descriptions: EPGProgrammeLanguage[];
}

function getCurrentEPG(epgData: EPGProgramme[] | undefined) {
  if (!epgData) return null;
  const currentTime = Date.now();
  for (const prog of epgData) {
    const start = new Date(prog.start_time).getTime();
    const stop = new Date(prog.stop_time).getTime();
    if (currentTime >= start && currentTime <= stop) {
      return prog;
    }
  }
  return null;
}

// choose english or the first available language for epgs
function pickText(items: EPGProgrammeLanguage[] | undefined): string {
  if (!items || items.length === 0) return "";
  const english = items.find(
    (i) => i.lang && i.lang.toLowerCase().startsWith("en"),
  );
  return (english ?? items[0]).text;
}

export default function IPTVScreenTV({
  iptvProviders,
  selectedProvider,
  setIPTVProviderID,
  categories,
}: LiveTVProps) {
  const videoPlayerRef = useRef<View>(null);
  const resizePlayer = useLiveTVStore((s) => s.setRect);
  const setSource = useLiveTVStore((s) => s.setSource);
  const sourceURL = useLiveTVStore((s) => s.sourceURL);

  const { width: fw, height: fh } = useWindowDimensions();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [categoryID, setCategoryID] = useState<number | null>(null);
  const [channelInfo, setChannelInfo] = useState<NowPlayingInfo | null>(null);
  const [providersFocused, setProvidersFocused] = useState<boolean>(false);

  const { data: channels, isLoading: isChannelsLoading } = useChannels(
    selectedProvider?.iptv_provider_id,
    selectedProvider?.iptv_provider_type,
    categoryID,
  );

  const epgChannelIDs = useMemo(() => {
    if (!channels?.channels) return undefined;
    const ids = channels.channels
      .map((ch: any) => ch?.epg_channel_id)
      .filter((id: string) => id && id.length > 0);
    return Array.from(new Set(ids)) as string[];
  }, [channels]);

  const { data: rawEPGData } = useChannelEPGs(
    selectedProvider?.iptv_provider_id,
    selectedProvider?.iptv_provider_type,
    epgChannelIDs,
  );

  // map epg_channel_id to programmes
  const epgByChannelId = useMemo(() => {
    const map = new Map<string, EPGProgramme[]>();
    if (!rawEPGData) return map;
    for (const prog of rawEPGData as EPGProgramme[]) {
      const list = map.get(prog.epg_channel_id) || [];
      list.push(prog);
      map.set(prog.epg_channel_id, list);
    }
    return map;
  }, [rawEPGData]);

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
    if (channels?.channels?.length && !sourceURL) {
      const firstChannel = channels.channels[0];
      const currentEPG = getCurrentEPG(
        epgByChannelId?.get(firstChannel.epg_channel_id),
      );
      setSource(firstChannel.stream_url);
      setChannelInfo({
        name: firstChannel.name,
        description: firstChannel.description,
        program_title: pickText(currentEPG?.titles),
        program_description: pickText(currentEPG?.descriptions),
        start_time: currentEPG?.start_time || "",
        stop_time: currentEPG?.stop_time || "",
      });
    }
  }, [channels, epgByChannelId]);

  useEffect(() => {
    if (!isFullscreen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      updatePlayer();
      setIsFullscreen(false);
      return true;
    });
    return () => sub.remove();
  }, [isFullscreen]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryID(categories[0].category_id);
    }
  }, [categories]);

  const fadeAnim = useRef(new Animated.Value(Platform.isTV ? 0.4 : 1)).current;
  const [focusedProviderIdx, setFocusedProviderIdx] = useState<number>(0);

  useEffect(() => {
    if (iptvProviders && selectedProvider) {
      const idx = iptvProviders.findIndex(
        (p) => p.iptv_provider_id === selectedProvider?.iptv_provider_id,
      );
      setFocusedProviderIdx(idx);
    }
  }, [selectedProvider, iptvProviders]);

  useEffect(() => {
    if (!Platform.isTV) return;
    Animated.timing(fadeAnim, {
      toValue: !providersFocused ? 0.5 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [providersFocused, fadeAnim]);

  const categoryListRef = useRef<FlashListRef<any>>(null);
  const channelListRef = useRef<FlashListRef<any>>(null);

  useKeepAwake();

  return (
    <View
      className={"flex-1 px-5 md:px-12 " + (Platform.isTV ? "mt-20" : "mt-5")}
    >
      <TVFocusGuideView autoFocus>
        <Animated.View
          className="flex-row gap-2 pt-2 pb-4"
          style={{ opacity: fadeAnim }}
        >
          {iptvProviders?.map((p, idx) => (
            <Pressable
              focusable
              key={`iptv-provider-${p.iptv_provider_id}`}
              onFocus={() => {
                if (!Platform.isTV) return;
                setProvidersFocused(true);
                if (idx === focusedProviderIdx) return;
                setIPTVProviderID(p.iptv_provider_id);
              }}
              onBlur={() => {
                setProvidersFocused(false);
              }}
              onPress={() => {
                setProvidersFocused(true);
                setIPTVProviderID(p.iptv_provider_id);
              }}
              className={
                "rounded-xl p-2 group " +
                (idx === focusedProviderIdx ? "bg-secondary" : "bg-gray-500")
              }
            >
              <ThemedText className="text-primary">{p.name}</ThemedText>
            </Pressable>
          ))}
        </Animated.View>
      </TVFocusGuideView>
      <View className="flex-1 flex-row gap-1 justify-between">
        <TVFocusGuideView autoFocus className="w-[25%]">
          <ThemedText className="text-white text-2xl font-semibold ml-2 mb-4">
            Categories
          </ThemedText>
          <FlashList<XtreamCategory>
            ref={categoryListRef}
            data={categories}
            keyExtractor={(item) => `category-${item.category_id}`}
            renderItem={({ item, index }) => (
              <Pressable
                className="bg-white/10 p-4 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white"
                focusable={Platform.isTV}
                onPress={() => {
                  setCategoryID(item.category_id);
                }}
                onFocus={() => {
                  categoryListRef?.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.15,
                  });
                }}
              >
                <ThemedText
                  className={
                    "text-lg font-semibold overflow-hidden line-clamp-1 " +
                    (item.category_id === categoryID
                      ? "text-yellow-300"
                      : "text-white")
                  }
                >
                  {item.category_name}
                </ThemedText>
              </Pressable>
            )}
            ListEmptyComponent={() =>
              selectedProvider?.iptv_provider_type === "xtream" ? (
                <ThemedText className="text-xl font-semibold text-white mt-2">
                  No Categories
                </ThemedText>
              ) : (
                <Pressable
                  className="bg-white/10 p-4 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white"
                  focusable={Platform.isTV}
                >
                  <ThemedText className="text-lg font-semibold text-white">
                    All Channels
                  </ThemedText>
                </Pressable>
              )
            }
            showsVerticalScrollIndicator={false}
          />
        </TVFocusGuideView>
        <TVFocusGuideView autoFocus className="w-[30%]">
          <ThemedText className="text-white text-2xl font-semibold ml-2 mb-4">
            Channels
          </ThemedText>
          {isChannelsLoading ? (
            <View className="w-full h-[80%] justify-center items-center">
              <ActivityIndicator color="white" size="large" />
            </View>
          ) : (
            <FlashList<any>
              ref={channelListRef}
              data={channels?.channels}
              keyExtractor={(item) => `channel-${item.stream_id}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const currentEPG = getCurrentEPG(
                  epgByChannelId?.get(item.epg_channel_id),
                );
                const programTitle = pickText(currentEPG?.titles);
                const programDescription = pickText(currentEPG?.descriptions);
                let programStartTime = new Date(
                  currentEPG?.start_time || "",
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                let programStopTime = new Date(
                  currentEPG?.stop_time || "",
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                if (programStartTime === "Invalid Date") {
                  programStartTime = "";
                }
                if (programStopTime === "Invalid Date") {
                  programStopTime = "";
                }
                return (
                  <Pressable
                    className="bg-white/10 p-3 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white flex-row"
                    focusable={Platform.isTV}
                    onPress={() => {
                      if (item.stream_url === sourceURL) {
                        setFullscreen();
                      } else {
                        setSource(item.stream_url as string);
                        setChannelInfo({
                          name: item.name,
                          description: item.description,
                          program_title: programTitle,
                          program_description:
                            programDescription || "No description avaiable",
                          start_time: programStartTime || "",
                          stop_time: programStopTime || "",
                        });
                      }
                    }}
                    onFocus={() => {
                      channelListRef?.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.15,
                      });
                    }}
                  >
                    <View className="flex-row justify-center">
                      {/* {item.thumbnail_url && (
                        <Image
                          source={{ uri: item.thumbnail_url }}
                          style={{
                            width: 30,
                            height: 30,
                            objectFit: "contain",
                          }}
                          contentFit="contain"
                          recyclingKey={item.id}
                        />
                      )} */}
                      <View className="ml-4">
                        <ThemedText
                          className={
                            "text-lg font-semibold overflow-hidden " +
                            (item.stream_url === sourceURL
                              ? "text-secondary"
                              : "text-white")
                          }
                          numberOfLines={1}
                        >
                          {item.name}
                        </ThemedText>
                        {programTitle ? (
                          <>
                            <ThemedText
                              className="text-gray-300"
                              numberOfLines={1}
                            >
                              {programTitle}
                            </ThemedText>
                            <ThemedText className="text-gray-400">
                              {programStartTime + " - " + programStopTime}
                            </ThemedText>
                          </>
                        ) : (
                          <ThemedText
                            className="text-gray-300"
                            numberOfLines={1}
                          >
                            No Program Data
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </TVFocusGuideView>
        <View className="w-[40%]">
          <Pressable
            className="w-full bg-gray-700 focus:bg-white rounded-md"
            focusable
            onPress={() => {
              setFullscreen();
            }}
            style={{
              padding: 3,
              aspectRatio: 16 / 9,
            }}
          >
            <View
              ref={videoPlayerRef}
              className="bg-black flex-1"
              onLayout={updatePlayer}
            />
          </Pressable>
          <View className="flex-1 mt-2 ps-5 pe-2">
            <ThemedText
              type="defaultSemiBold"
              className="text-2xl text-white mb-0 pb-0"
              numberOfLines={2}
            >
              {channelInfo?.name}
            </ThemedText>
            {channelInfo?.program_title ? (
              <>
                <ThemedText
                  className="text-lg text-secondary"
                  numberOfLines={2}
                >
                  {channelInfo?.program_title}
                </ThemedText>
              </>
            ) : null}
            {channelInfo?.start_time && channelInfo?.stop_time ? (
              <ThemedText className="text-md text-white">
                {channelInfo?.start_time} - {channelInfo?.stop_time}
              </ThemedText>
            ) : null}
            {channelInfo?.program_title && channelInfo?.program_description ? (
              <ThemedText className="text-md text-gray-400" numberOfLines={6}>
                {channelInfo?.program_description}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
