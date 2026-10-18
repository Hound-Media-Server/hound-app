import { View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useTVScale } from "@/hooks/useTVScale";
import type { MediaScores as MediaScoresData } from "@/services/mediaDetailsService";

const ICONS = {
  imdb: {
    src: require("@/assets/score_icons/imdb_icon.svg"),
    ratio: 575 / 289.83,
  },
  fresh: {
    src: require("@/assets/score_icons/rt_fresh_icon.svg"),
    ratio: 138.75 / 141.25,
  },
  rotten: {
    src: require("@/assets/score_icons/rt_rotten_icon.svg"),
    ratio: 145 / 140,
  },
  metacritic: {
    src: require("@/assets/score_icons/metacritic_icon.svg"),
    ratio: 1,
  },
};

// decode once into the image memory cache so icons don't flash black on remount
Object.values(ICONS).forEach((icon) => Image.loadAsync(icon.src).catch(() => {}));

export default function MediaScores({
  scores,
  variant = "row",
}: {
  scores?: MediaScoresData;
  variant?: "row" | "column";
}) {
  const scale = useTVScale();
  const { imdb_score, rt_score, metacritic_score } = scores ?? {};
  const items = [
    imdb_score != null && {
      key: "imdb",
      icon: ICONS.imdb,
      value: imdb_score.toFixed(1),
    },
    rt_score != null && {
      key: "rt",
      icon: rt_score >= 60 ? ICONS.fresh : ICONS.rotten,
      value: `${rt_score}%`,
    },
    metacritic_score != null && {
      key: "mc",
      icon: ICONS.metacritic,
      value: metacritic_score,
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof ICONS.imdb;
    value: string | number;
  }[];

  if (items.length === 0) return null;

  const iconHeight = 18 * scale;
  const isColumn = variant === "column";
  return (
    <View
      className={isColumn ? "gap-2" : "flex-row flex-wrap gap-x-4 gap-y-1 mt-2"}
    >
      {items.map(({ key, icon, value }) => (
        <View key={key} className="flex-row items-center gap-2">
          <View
            className="items-end"
            style={
              isColumn ? { width: iconHeight * ICONS.imdb.ratio } : undefined
            }
          >
            <Image
              source={icon.src}
              contentFit="contain"
              transition={200}
              style={{ height: iconHeight, aspectRatio: icon.ratio }}
            />
          </View>
          <ThemedText className="text-white text-base">{value}</ThemedText>
        </View>
      ))}
    </View>
  );
}
