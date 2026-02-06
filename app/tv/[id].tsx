import TVDetailsMobile from "@/screens/tv/TVDetails";
import TVDetailsTV from "@/screens/tv/TVDetails.tv";
import { Platform } from "react-native";

export default function TVDetails() {
  if (Platform.isTV) {
    return <TVDetailsTV />;
  }
  return <TVDetailsMobile />;
}
