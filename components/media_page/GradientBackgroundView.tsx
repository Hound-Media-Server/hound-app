import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, ViewProps } from "react-native";

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
          colors={["rgba(0,0,0,0)", "rgba(9,4,41,0.85)", "rgba(9,4,41,1)"]}
          className="absolute w-full h-full"
        />
        <LinearGradient
          colors={["rgba(9,4,41,1)", "rgba(9,4,41,0.8)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0 }}
          className="absolute w-full h-full"
        />
      </View>
      {children}
    </View>
  );
}
