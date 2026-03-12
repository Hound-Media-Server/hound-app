import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TVFocusGuideView, View } from "react-native";

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
  const selectedTabRef = tabRefs.current[state.index] ?? null;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: tabBarFocused ? 1 : 0.4,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [tabBarFocused, fadeAnimation]);

  return (
    <View className="absolute top-5 left-10 right-0 z-50">
      <TVFocusGuideView
        autoFocus
        destinations={selectedTabRef ? [selectedTabRef] : undefined}
        onFocus={() => {
          setTabBarFocused(true);
        }}
        onBlur={() => {
          setTabBarFocused(false);
        }}
      >
        <Animated.View
          className="self-start flex-row bg-black/50 rounded-full overflow-hidden p-2"
          style={{ opacity: fadeAnimation, columnGap: 8 }}
        >
          {state.routes.map((route: any, index: number) => {
            const isSelected = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isSelected && !event.defaultPrevented) {
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
                <View className="rounded-full px-4 py-2 bg-white/10 group-focus:bg-white">
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
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
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
