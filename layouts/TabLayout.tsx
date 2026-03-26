import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayoutMobile() {
  return (
    <Tabs
      initialRouteName="index"
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
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              size={24}
              name={focused ? "search" : "search-outline"}
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
