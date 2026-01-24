import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { SessionProvider, useSession } from "../services/ctx";
import ToastManager from "toastify-react-native";
import "./../global.css";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "@expo-google-fonts/cabin/useFonts";
import { Cabin_400Regular } from "@expo-google-fonts/cabin/400Regular";
import { Cabin_500Medium } from "@expo-google-fonts/cabin/500Medium";
import { Cabin_600SemiBold } from "@expo-google-fonts/cabin/600SemiBold";
import { Cabin_700Bold } from "@expo-google-fonts/cabin/700Bold";
import { Cabin_400Regular_Italic } from "@expo-google-fonts/cabin/400Regular_Italic";
import { Cabin_500Medium_Italic } from "@expo-google-fonts/cabin/500Medium_Italic";
import { Cabin_600SemiBold_Italic } from "@expo-google-fonts/cabin/600SemiBold_Italic";
import { Cabin_700Bold_Italic } from "@expo-google-fonts/cabin/700Bold_Italic";
import { cssInterop } from "nativewind";
import { Image } from "expo-image";

// enable styling expo image with nativewind classes
cssInterop(Image, { className: "style" });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
    },
  },
});

function RootLayoutNav() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inSignIn = segments[0] === "sign-in";

    if (!session && !inSignIn) {
      router.replace("/sign-in");
    } else if (session && inSignIn) {
      router.replace("/");
    }
  }, [session, segments, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tv/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="stream/[encoded_data]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/select-stream"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="(modals)/add-to-collection"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // if (Platform.OS === "web") {
  //   return (
  //     <View className="flex-1 justify-center items-center">
  //       <Text className="text-3xl">Web is not supported</Text>
  //     </View>
  //   );
  // }
  let [fontsLoaded] = useFonts({
    Cabin_400Regular,
    Cabin_500Medium,
    Cabin_600SemiBold,
    Cabin_700Bold,
    Cabin_400Regular_Italic,
    Cabin_500Medium_Italic,
    Cabin_600SemiBold_Italic,
    Cabin_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <RootLayoutNav />
      </QueryClientProvider>
      <ToastManager theme="dark" showProgressBar={false} useModal={false} />
    </SessionProvider>
  );
}
