import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, TouchableHighlight } from "react-native";

function TVTabButton({ onPress, accessibilityState, iconName }: any) {
  const selected = accessibilityState?.selected;
  const [tvFocused, setTvFocused] = useState(false);

  return (
    <TouchableHighlight
      focusable
      onPress={onPress}
      onFocus={() => {
        setTvFocused(true);
      }}
      onBlur={() => setTvFocused(false)}
      hasTVPreferredFocus={selected}
      className={
        "flex items-center justify-center" +
        (tvFocused ? " opacity-100" : "opacity-0")
      }
    >
      <Ionicons
        size={24}
        name={selected ? iconName : `${iconName}-outline`}
        color={tvFocused ? "#FFD60A" : selected ? "#FF3B30" : "#8E8E93"}
      />
    </TouchableHighlight>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF3B30",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 4,
        },
        tabBarStyle: {
          display: "flex",
          position: "absolute",
          overflow: "hidden",
          opacity: 0.8,
          top: 10,
          marginHorizontal: 20,
          marginBottom: 20,
          elevation: 2,
          backgroundColor: "#1C1C1E",
          borderRadius: 40,
          height: 64,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TVTabButton
              onPress={() => {}}
              accessibilityState={{ selected: focused }}
              iconName="home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TVTabButton
              onPress={() => {}}
              accessibilityState={{ selected: focused }}
              iconName="albums"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TVTabButton
              onPress={() => {}}
              accessibilityState={{ selected: focused }}
              iconName="search"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TVTabButton
              onPress={() => {}}
              accessibilityState={{ selected: focused }}
              iconName="settings"
            />
          ),
        }}
      />
    </Tabs>
  );
  // return (
  //     <NativeTabs>
  //         <NativeTabs.Trigger name="index">
  //             <Label>Home</Label>
  //             <Ionicons name="home-outline" size={22} />
  //         </NativeTabs.Trigger>
  //         <NativeTabs.Trigger name="explore">
  //             <Label>Explore</Label>
  //             <Icon sf="atom" />
  //         </NativeTabs.Trigger>
  //         <NativeTabs.Trigger name="library">
  //             <Label>Library</Label>
  //             <Icon sf="atom" />
  //         </NativeTabs.Trigger>
  //     </NativeTabs>
  // );
}
