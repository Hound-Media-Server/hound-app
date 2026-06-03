import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TVFocusGuideView, View } from "react-native";
import { useSession } from "@/services/ctx";

function TVTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const tabRefs = useRef<any[]>([]);
  const [tabBarFocused, setTabBarFocused] = useState<boolean>(false);
  const fadeAnimation = useRef(new Animated.Value(0.4)).current;
  const [selectedTabNode, setSelectedTabNode] = useState<any>(null);
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setSelectedTabNode(tabRefs.current[state.index] ?? null);
  }, [state.index]);

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
      className="absolute top-5 left-10 right-10 z-50 flex-row justify-between items-center"
      onFocus={() => {
        setTabBarFocused(true);
      }}
      onBlur={() => {
        setTabBarFocused(false);
      }}
    >
      <TVFocusGuideView
        autoFocus
        destinations={selectedTabNode ? [selectedTabNode] : undefined}
      >
        <Animated.View
          className="self-start flex-row bg-black/50 rounded-full overflow-hidden p-2"
          style={{ opacity: fadeAnimation, columnGap: 8 }}
        >
          {state.routes.map((route: any, index: number) => {
            const isSelected = state.index === index;

            const onPress = () => {
              if (isSelected) return;

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                className="group"
                key={route.key}
                ref={(ref) => {
                  tabRefs.current[index] = ref;
                }}
                onPress={() => {
                  onPress();
                }}
                onFocus={() => {
                  onPress();
                }}
              >
                <View
                  className={`rounded-full px-4 py-2 overflow-hidden ${
                    isSelected ? "bg-white/20" : "bg-white/0"
                  } group-focus:bg-white`}
                >
                  <ThemedText className="text-white group-focus:text-black">
                    {descriptors[route.key]?.options?.title === "Search" ? (
                      <Ionicons
                        name="search-outline"
                        size={20}
                        color="group-focus:text-black"
                      />
                    ) : (
                      descriptors[route.key]?.options?.title
                    )}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </TVFocusGuideView>

      <Animated.View style={{ opacity: fadeAnimation }}>
        <Pressable
          className="w-10 h-10 rounded-full bg-gray-600 justify-center items-center border-2 border-transparent focus:border-white active:scale-95"
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
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{ headerShown: false, tabBarPosition: "top" }}
      tabBar={(props) => <TVTabBar {...props} />}
    >
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="collections" options={{ title: "Collections" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
