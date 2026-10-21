import { useTVScale } from "@/hooks/useTVScale";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TVFocusGuideView, View } from "react-native";
import { useSession } from "@/services/ctx";
import { ServerVersionGTE } from "@/utils/version";
import { useServerInfo } from "@/services/internalService";

function TVTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: {
  state: any;
  descriptors: any;
  emitter: any;
  navigateToTab: (routeKey: string) => void;
}) {
  const scale = useTVScale();
  const tabRefs = useRef<any[]>([]);
  const [tabBarFocused, setTabBarFocused] = useState<boolean>(false);
  const fadeAnimation = useRef(new Animated.Value(0.4)).current;
  const [selectedTabNode, setSelectedTabNode] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const targetRef = useRef<number>(state.index);
  const issued = useRef(new Set<number>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const node = tabRefs.current[state.index] ?? null;
    setSelectedTabNode(node);
    if (issued.current.delete(state.index)) return;
    targetRef.current = state.index;
    if (tabBarFocused) node?.requestTVFocus?.();
  }, [state.index]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const goTo = (index: number, route: any) => {
    if (targetRef.current === index) return;
    targetRef.current = index;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      issued.current.clear();
      issued.current.add(index);
      const event = emitter.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigateToTab(route.key);
      }
    }, 120);
  };

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: tabBarFocused ? 1 : 0.4,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [tabBarFocused, fadeAnimation]);

  const initial = session?.username
    ? session.username.charAt(0).toUpperCase()
    : "?";

  return (
    <View
      className="absolute top-5 left-10 right-10 z-50 flex-row justify-center items-center"
      onFocus={() => {
        setTabBarFocused(true);
      }}
      onBlur={() => {
        setTabBarFocused(false);
        setFocusedIndex(null);
      }}
    >
      <TVFocusGuideView
        autoFocus
        destinations={selectedTabNode ? [selectedTabNode] : undefined}
      >
        <Animated.View
          className="self-start flex-row bg-black/40 rounded-full overflow-hidden px-1 py-0.5"
          style={{ opacity: fadeAnimation, columnGap: 2 * scale }}
        >
          {state.routes.map((route: any, index: number) => {
            const isSelected = (focusedIndex ?? state.index) === index;
            const title = descriptors[route.key]?.options?.title;
            return (
              <Pressable
                className="group py-1"
                key={route.name}
                ref={(ref) => {
                  tabRefs.current[index] = ref;
                }}
                onPress={() => goTo(index, route)}
                onFocus={() => {
                  setFocusedIndex(index);
                  goTo(index, route);
                }}
              >
                <View
                  className={`flex-1 justify-center rounded-full py-1 overflow-hidden ${
                    title === "Search" ? "w-7 items-center" : "px-3"
                  } ${
                    isSelected ? "bg-white/20" : "bg-white/0"
                  } group-focus:bg-white`}
                >
                  <ThemedText className="text-white group-focus:text-black text-sm">
                    {title === "Search" ? (
                      <Ionicons
                        name="search-outline"
                        size={14 * scale}
                        color="group-focus:text-black"
                      />
                    ) : (
                      title
                    )}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </TVFocusGuideView>

      <Animated.View
        style={{ opacity: fadeAnimation, position: "absolute", right: 0 }}
      >
        <Pressable
          className="w-10 h-10 rounded-full bg-gray-600 justify-center items-center 
            border-2 border-transparent focus:border-white active:scale-95"
          onPress={() => router.push("/profile-select")}
          focusable={true}
        >
          <ThemedText className="text-white font-bold uppercase text-base">
            {initial}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  // live tv apis available from 0.3.0
  const { data: serverInfo, isLoading: isServerInfoLoading } = useServerInfo();
  const showLiveTV = isServerInfoLoading
    ? false
    : ServerVersionGTE(serverInfo?.data?.version, "0.3.0-beta");
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{ headerShown: false, tabBarPosition: "top" }}
      tabBar={(props) => <TVTabBar {...props} />}
    >
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="collections" options={{ title: "Collections" }} />
      {showLiveTV ? (
        <Tabs.Screen name="live_tv" options={{ title: "Live TV" }} />
      ) : null}
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
