import {
  MOBILE_TAB_BAR_BOTTOM_MARGIN,
  MOBILE_TAB_BAR_HEIGHT,
} from "@/hooks/useMobileTabContentPadding";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayoutMobile() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        initialRouteName="index"
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#FF3B30",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarItemStyle: {
            flex: 1,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarStyle: {
            position: "absolute",
            overflow: "hidden",
            marginHorizontal: 20,
            marginBottom: MOBILE_TAB_BAR_BOTTOM_MARGIN,
            padding: 0,
            elevation: 2,
            backgroundColor: "#1C1C1E",
            borderRadius: 40,
            height: MOBILE_TAB_BAR_HEIGHT,
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
              <Ionicons
                size={24}
                name={focused ? "home" : "home-outline"}
                color={color}
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
              <Ionicons
                size={24}
                name={focused ? "albums" : "albums-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="collections"
          options={{
            title: "Collections",
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                size={24}
                name={focused ? "list" : "list-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="live_tv"
          options={{
            title: "Live TV",
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                size={24}
                name={focused ? "tv" : "tv-outline"}
                color={color}
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
              <Ionicons
                size={24}
                name={focused ? "settings" : "settings-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      {pathname !== "/search" && (
        <Pressable
          accessibilityLabel="Search"
          accessibilityRole="button"
          onPress={() => router.navigate("/search")}
          style={{
            position: "absolute",
            top: insets.top + 12,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#1C1C1E",
            alignItems: "center",
            justifyContent: "center",
            elevation: 2,
          }}
        >
          <Ionicons name="search" size={24} color="white" />
        </Pressable>
      )}
    </View>
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
