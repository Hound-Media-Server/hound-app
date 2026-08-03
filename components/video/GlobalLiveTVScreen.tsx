import { MpvPlayerView, MpvPlayerViewRef } from "@/modules";
import { useLiveTVStore } from "@/stores/livePlayerStore";
import { useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "../ThemedText";

export default function GlobalLiveTVPlayer() {
  const videoRef = useRef<MpvPlayerViewRef>(null);
  const rect = useLiveTVStore((s) => s.rect);
  const [isReady, setIsReady] = useState<boolean>(false);
  if (!rect) return null;

  return (
    <>
      {!isReady && (
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
          url: "https://live.143b.ch/cam/flux/ts:abr.m3u8",
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
        onLoad={() => {
          setIsReady(true);
        }}
        onPlaybackStateChange={() => {
          setIsReady(true);
        }}
        onProgress={() => {
          setIsReady(true);
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
