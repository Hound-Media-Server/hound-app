import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useMemo } from "react";
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
import { Image, ImageBackground } from "expo-image";
import { registerLocale } from "@cospired/i18n-iso-languages";
import { GlobalModalHost } from "@/components/modals/GlobalModalHost";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

// enable styling expo image with nativewind classes
cssInterop(Image, { className: "style" });
cssInterop(ImageBackground, { className: "style" });

function RootLayoutNav() {
  const { session, isLoading, profiles } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
        },
      },
    });
  }, [session?.username, session?.host]);

  useEffect(() => {
    if (isLoading) return;
    const inSignIn = segments[0] === "sign-in";
    const inProfileSelect = segments[0] === "profile-select";

    if (profiles.length === 0) {
      if (!inSignIn) {
        router.replace("/sign-in");
      }
    } else {
      if (!session) {
        if (!inProfileSelect && !inSignIn) {
          router.replace("/profile-select");
        }
      } else {
        if (inSignIn) {
          router.replace("/");
        }
      }
    }
  }, [session, profiles, segments, isLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tv/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="stream/[encoded_data]"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "fade",
          }}
        />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="profile-select" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)/select-stream"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="(modals)/add-to-collection"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="(modals)/seasons"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "fade",
          }}
        />
      </Stack>
      <GlobalModalHost />
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"));
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
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <RootLayoutNav />
        <ToastManager theme="dark" showProgressBar={false} useModal={false} />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
