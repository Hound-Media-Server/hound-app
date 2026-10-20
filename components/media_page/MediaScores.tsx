import { View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useTVScale } from "@/hooks/useTVScale";
import { formatToThousands } from "@/utils/numberFormat";
import type { MediaScores as MediaScoresData } from "@/services/mediaDetailsService";

const ICONS = {
  imdb: {
    src: require("@/assets/score_icons/imdb_icon.svg"),
    ratio: 575 / 289.83,
  },
  mal: {
    src: require("@/assets/score_icons/mal_icon.svg"),
    ratio: 1,
  },
  certified: {
    src: require("@/assets/score_icons/rt_certified_fresh_icon.svg"),
    ratio: 1,
  },
  fresh: {
    src: require("@/assets/score_icons/rt_fresh_icon.svg"),
    ratio: 138.75 / 141.25,
  },
  rotten: {
    src: require("@/assets/score_icons/rt_rotten_icon.svg"),
    ratio: 145 / 140,
  },
  letterboxd: {
    src: require("@/assets/score_icons/letterboxd_icon.svg"),
    ratio: 440 / 225,
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
  const {
    imdb_score,
    imdb_votes,
    mal_score,
    mal_votes,
    rt_score,
    rt_votes,
    letterboxd_score,
    letterboxd_votes,
    metacritic_score,
    metacritic_votes,
  } = scores ?? {};
  const items = [
    imdb_score != null && {
      key: "imdb",
      icon: ICONS.imdb,
      value: imdb_score.toFixed(1),
      votes: imdb_votes,
    },
    mal_score != null && {
      key: "mal",
      icon: ICONS.mal,
      value: mal_score.toFixed(1),
      votes: mal_votes,
    },
    rt_score != null && {
      key: "rt",
      icon:
        rt_score > 75 && (rt_votes ?? 0) > 80
          ? ICONS.certified
          : rt_score >= 60
            ? ICONS.fresh
            : ICONS.rotten,
      value: `${rt_score}%`,
      votes: rt_votes,
    },
    letterboxd_score != null && {
      key: "letterboxd",
      icon: ICONS.letterboxd,
      value: `${letterboxd_score.toFixed(1)}/5`,
      votes: letterboxd_votes,
    },
    metacritic_score != null && {
      key: "mc",
      icon: ICONS.metacritic,
      value: metacritic_score,
      votes: metacritic_votes,
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof ICONS.imdb;
    value: string | number;
    votes?: number | null;
  }[];

  if (items.length === 0) return null;

  const iconHeight = 18 * scale;
  const renderIcon = (icon: typeof ICONS.imdb) => (
    <Image
      source={icon.src}
      contentFit="contain"
      transition={200}
      style={{ height: iconHeight, aspectRatio: icon.ratio }}
    />
  );
  const renderVotes = (votes?: number | null) =>
    !!votes && (
      <ThemedText className="text-[#808080] text-xs">
        ({formatToThousands(votes)})
      </ThemedText>
    );

  if (variant === "column") {
    const cell = (node: React.ReactNode, key: string, end?: boolean) => (
      <View
        key={key}
        className={`justify-center ${end ? "items-end" : ""}`}
        style={{ height: iconHeight }}
      >
        {node}
      </View>
    );
    return (
      <View className="flex-row gap-2">
        <View className="gap-2">
          {items.map((i) => cell(renderIcon(i.icon), i.key, true))}
        </View>
        <View className="gap-2">
          {items.map((i) =>
            cell(
              <ThemedText className="text-white text-base">{i.value}</ThemedText>,
              i.key,
            ),
          )}
        </View>
        <View className="gap-2">
          {items.map((i) => cell(renderVotes(i.votes), i.key))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2">
      {items.map(({ key, icon, value, votes }) => (
        <View key={key} className="flex-row items-center gap-2">
          {renderIcon(icon)}
          <ThemedText className="text-white text-base">{value}</ThemedText>
          {renderVotes(votes)}
        </View>
      ))}
    </View>
  );
}
