import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSession } from "../services/ctx";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const { signIn } = useSession();
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!host || !username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(host, username, password);
    } catch (e: any) {
      console.log("Login Failed.", e.message);
      Alert.alert("Login Failed. Check your host/credentials.", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black justify-center">
      <View className="items-center mt-10 mb-10">
        <Text className="text-white text-3xl font-bold">Hound</Text>
        <Text className="text-gray-400 mt-2">Sign in to your server</Text>
      </View>

      <View className="space-y-4 px-10 flex-1 items-center w-full">
        <View className="w-full">
          <Text className="text-gray-400 mb-1 ml-1">Host URL</Text>
          <TextInput
            className="bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500"
            placeholder="e.g. 192.168.1.10:8000"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={host}
            onChangeText={setHost}
          />
        </View>

        <View className="w-full">
          <Text className="text-gray-400 mb-1 ml-1">Username</Text>
          <TextInput
            className="bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500"
            placeholder="Username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View className="w-full">
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
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
