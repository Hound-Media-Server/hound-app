import { MpvPlayerView, MpvPlayerViewRef } from "@/modules";
import { useLiveTVStore } from "@/stores/livePlayerStore";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ThemedText } from "../ThemedText";

export default function GlobalLiveTVPlayer() {
  const videoRef = useRef<MpvPlayerViewRef>(null);
  const rect = useLiveTVStore((s) => s.rect);
  const sourceURL = useLiveTVStore((s) => s.sourceURL);
  const prevSource = useRef(sourceURL);
  const [isReady, setIsReady] = useState<boolean>(false);
  useEffect(() => {
    if (prevSource.current === sourceURL) return;
    setIsReady(false);
    prevSource.current = sourceURL;
  }, [sourceURL]);
  if (!rect) return null;

  return (
    <>
      {!sourceURL && (
        <View
          className="items-center justify-center"
          style={{
            backgroundColor: "black",
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            zIndex: 12,
          }}
        >
          <ThemedText className="text-white mt-2">
            No stream selected.
          </ThemedText>
        </View>
      )}
      {sourceURL && !isReady && (
        <View
          className="items-center justify-center"
          style={{
            backgroundColor: "black",
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            zIndex: 11,
          }}
        >
          <ActivityIndicator size="large" color="white" />
          <ThemedText className="text-white mt-2">
            Loading Livestream...
          </ThemedText>
        </View>
      )}
      <MpvPlayerView
        ref={videoRef}
        source={{
          url: sourceURL || "",
          autoplay: true,
        }}
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          zIndex: 10,
        }}
        onTracksReady={() => {
          setIsReady(true);
        }}
        onError={(error) => {
          console.log(error);
        }}
      />
    </>
  );
}
