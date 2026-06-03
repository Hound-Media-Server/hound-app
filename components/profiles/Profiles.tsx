import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, Session } from "../../services/ctx";

export default function Profiles() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, profiles, selectProfile, signIn } = useSession();

  const [isAdding, setIsAdding] = useState(false);
  const [host, setHost] = useState(session?.host || profiles[0]?.host || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (profile: Session) => {
    await selectProfile(profile);
    queryClient.clear();
    router.replace("/");
  };

  const handleAddProfile = async () => {
    if (!host || !username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(host, username, password);
      queryClient.clear();
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Failed to add profile", e.message);
    } finally {
      setLoading(false);
    }
  };

  let activeProfileIdx = profiles.findIndex(
    (p) => session?.host === p.host && session?.username === p.username,
  );
  if (activeProfileIdx === -1) activeProfileIdx = 0;

  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center px-6">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        className="w-full max-w-md"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          {isAdding ? (
            <Text className="text-white text-3xl font-bold">Add Profile</Text>
          ) : (
            <Text className="text-white text-3xl font-bold">Profiles</Text>
          )}
        </View>

        {!isAdding ? (
          <View className="w-full">
            {profiles.map((profile, index) => {
              const isActive = activeProfileIdx === index;
              return (
                <FocusablePressable
                  hasTVPreferredFocus={isActive}
                  key={`${profile.host}-${profile.username}-${index}`}
                  onPress={() => handleSelect(profile)}
                  focusable={Platform.isTV}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-600 justify-center items-center">
                    <Text className="text-white text-xl font-bold uppercase">
                      {profile.username.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white text-lg font-semibold">
                      {profile.username}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {profile.host}
                    </Text>
                  </View>
                </FocusablePressable>
              );
            })}
            <FocusablePressable
              onPress={() => setIsAdding(true)}
              focusable={Platform.isTV}
            >
              <Text className="text-white text-lg font-bold">
                + Add Profile
              </Text>
            </FocusablePressable>
          </View>
        ) : (
          <View className="w-full space-y-4">
            <View className="w-full">
              <Text className="text-gray-400 mb-1 ml-1">Host URL</Text>
              <TextInput
                className="bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500"
                placeholder="e.g. 192.168.1.10:8000"
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={host}
                onChangeText={setHost}
                autoCorrect={false}
              />
            </View>
            <View className="w-full mt-2">
              <Text className="text-gray-400 mb-1 ml-1">Username</Text>
              <TextInput
                className="bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500"
                placeholder="Username"
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                autoCorrect={false}
              />
            </View>

            <View className="w-full mt-2">
              <Text className="text-gray-400 mb-1 ml-1">Password</Text>
              <TextInput
                className="bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500"
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              className="w-full bg-indigo-600 p-4 rounded-lg items-center mt-4 active:bg-indigo-700"
              onPress={handleAddProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Add Profile
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full bg-zinc-800 p-4 rounded-lg items-center mt-2 active:bg-zinc-700"
              onPress={() => setIsAdding(false)}
              disabled={loading}
            >
              <Text className="text-gray-400 font-bold text-lg">Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FocusablePressable = ({ children, ...props }: any) => {
  return (
    <Pressable
      {...props}
      className="flex-row mt-3 p-3 focus:bg-white/20 rounded-full"
    >
      {children}
    </Pressable>
  );
};
