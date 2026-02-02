import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTextStyles } from "@/hooks/useTextStyles";

/**
 * This layout is required for the web platform.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const textStyles = useTextStyles();

  const tabBarButton = (props: any) => {
    const style: any = props.style ?? {};
    return (
      <View className="flex-1 justify-center items-center">
        <Pressable
          {...props}
          style={({ pressed, focused }) => [
            style,
            {
              opacity: pressed || focused ? 0.6 : 1.0,
            },
          ]}
          className="border-2 border-transparent focus:border-white"
        />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarActiveBackgroundColor: Colors[colorScheme ?? "light"].background,
        tabBarStyle: {
          width: "100%",
        },
        tabBarPosition: "top",
        tabBarIconStyle: {
          height: textStyles.title.lineHeight,
          width: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => null,
          tabBarButton,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: () => null,
          tabBarButton,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: () => null,
          tabBarButton,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: () => null,
          tabBarButton,
        }}
      />
    </Tabs>
  );
}
