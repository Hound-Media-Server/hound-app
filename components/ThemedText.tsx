import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  // edit to support dark/light mode switching in the future
  return (
    <Text
      className={className}
      style={[
        type === "default" ? { fontFamily: "Cabin_400Regular" } : undefined,
        type === "title" ? { fontFamily: "Cabin_700Bold" } : undefined,
        type === "defaultSemiBold"
          ? { fontFamily: "Cabin_600SemiBold" }
          : undefined,
        type === "subtitle" ? { fontFamily: "Cabin_700Bold" } : undefined,
        type === "link" ? { fontFamily: "Cabin_400Regular" } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
