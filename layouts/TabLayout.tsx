import { NativeTabs, Label, Icon } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import WebTabLayout from "./TabLayout.web";

export default function TabLayout() {
    if (Platform.OS === "android" && Platform.isTV) {
        return <WebTabLayout />;
    }
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>Home</Label>
                <Icon sf="house" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="explore">
                <Label>Explore</Label>
                <Icon sf="atom" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="library">
                <Label>Library</Label>
                <Icon sf="atom" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
