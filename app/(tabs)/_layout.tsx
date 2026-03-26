import TabLayoutMobile from "@/layouts/TabLayout";
import TabLayoutTV from "@/layouts/TabLayout.tv";
import { Platform } from "react-native";

export default function TabLayout() {
  if (Platform.isTV || Platform.isTVOS) {
    return <TabLayoutTV />;
  }
  return <TabLayoutMobile />;
}
