import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";

interface Props extends ViewProps {
  uri?: string;
  children?: React.ReactNode;
}

export default function GradientBackgroundView({
  uri,
  children,
  ...props
}: Props) {
  return (
    <View className="flex-1" {...props}>
      <View className="absolute inset-0">
        {uri && (
          <ImageBackground
            source={{ uri: uri }}
            className="absolute w-full h-full bg-primary"
            contentFit="cover"
          />
        )}
        <LinearGradient
          start={{ x: 0, y: 0.35 }}
          end={{ x: 0, y: 1 }}
          colors={["rgba(0,0,0,0)", "rgba(9,4,41,0.9)", "rgba(9,4,41,1)"]}
          style={styles.background}
        />
        <LinearGradient
          colors={["rgba(9,4,41,1)", "rgba(9,4,41,0.7)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0 }}
          style={styles.background}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
});
