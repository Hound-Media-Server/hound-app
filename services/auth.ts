import { Platform } from "react-native";
import { apiClient } from "./apiClient";

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    username: string;
  }
}

const clientID = "hound-app";

export async function login(
  host: string,
  username: string,
  password: string,
  deviceId: string,
): Promise<LoginResponse> {
  let baseUrl = host.trim();
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = `http://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/$/, "");

  // platforms: web, android-mobile, android-tv, ios, ipados, tvos
  let platform = Platform.OS as string;
  if (Platform.isTVOS) platform = "tvos";
  if (Platform.OS === "android" && Platform.isTV) platform = "android-tv";
  if (Platform.OS === "android" && !Platform.isTV) platform = "android-mobile";

  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientID,
        "X-Client-Platform": platform,
        "X-Device-Id": deviceId,
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorMessage = `Login failed: ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error: any) {
    if (error.message === "Network request failed") {
      throw new Error(
        `Network error: Could not connect to ${baseUrl}. Please check your connection and host URL.`,
      );
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.warn("Logout request failed:", error);
  }
}