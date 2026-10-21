import TabLayoutMobile from "@/layouts/TabLayout";
import TabLayoutTV from "@/layouts/TabLayout.tv";
import { Platform } from "react-native";

export const unstable_settings = { anchor: "index" };

export default function TabLayout() {
  if (Platform.isTV || Platform.isTVOS) {
    return <TabLayoutTV />;
  }
  return <TabLayoutMobile />;
}
