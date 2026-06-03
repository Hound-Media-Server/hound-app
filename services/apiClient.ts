import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter, Platform } from "react-native";

const SESSION_KEY = "auth-session";

type ApiResponse<T> = T;

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  let sessionJson: string | null = null;
  if (Platform.OS === "web") {
    sessionJson = localStorage.getItem(SESSION_KEY);
  } else {
    sessionJson = await SecureStore.getItemAsync(SESSION_KEY);
  }
  let host = "";
  let token = "";

  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      host = session.host;
      token = session.token;
    } catch (e) {
      console.warn("Invalid session JSON");
    }
  }

  if (!host) {
    const error = new Error("Missing Host");
    // @ts-ignore
    error.status = 401;
    throw error;
  }

  // Convert /tvshow/ to /tv/ for API endpoints, easier to do
  const finalEndpoint = endpoint.replace("/tvshow/", "/tv/");
  const url = `${host}/api/v1${finalEndpoint}`;
  // 'omit' to stop cookies being sent, we use auth header instead
  const response = await fetch(url, {
    credentials: "omit",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    DeviceEventEmitter.emit("UNAUTHORIZED");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const error = new Error(errorBody.message || `API Error: ${response.status}`);
    // @ts-ignore
    error.status = response.status;
    throw error;
  }

  return response.json() as ApiResponse<T>;
}
