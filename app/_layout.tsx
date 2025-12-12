import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./../global.css";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}
