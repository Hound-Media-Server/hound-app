import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SessionProvider, useSession } from "../services/ctx";
import "./../global.css";
import { StatusBar } from "expo-status-bar";

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
        name="select-stream"
        options={{
          headerShown: false,
          presentation: "modal",
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

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <RootLayoutNav />
      </QueryClientProvider>
    </SessionProvider>
  );
}
