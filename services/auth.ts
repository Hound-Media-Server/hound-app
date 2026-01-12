import { Platform } from "react-native";

export interface LoginResponse {
  token: string;
  username: string;
}

export async function login(
  host: string,
  username: string,
  password: string,
): Promise<LoginResponse> {
  let baseUrl = host.trim();
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = `http://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/$/, "");

  let platform = "android";
  if (Platform.OS === "web") {
    platform = "web";
  } else if (Platform.isTVOS) {
    platform = "tvos";
  } else if (Platform.isTV) {
    platform = "tv";
  } else if (Platform.OS === "ios") {
    platform = "ios";
  }

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client": platform,
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
}
