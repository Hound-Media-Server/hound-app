import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { DeviceEventEmitter, Platform } from "react-native";
import { login, logout } from "./auth";

const SESSION_KEY = "auth-session";
const DEVICE_ID_KEY = "device-id";

export type Session = {
  host: string;
  token: string;
  username: string;
};

type AuthContextType = {
  signIn: (host: string, username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session?: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          setSession(JSON.parse(session));
        } catch (e) {
          console.error("Failed to parse session", e);
        }
      }
    } else {
      SecureStore.getItemAsync(SESSION_KEY).then((json) => {
        if (json) {
          try {
            setSession(JSON.parse(json));
          } catch (e) {
            console.error("Failed to parse session", e);
          }
        }
      });
    }
    setIsLoading(false);
    // Listen for unauthorized events to trigger logout
    const subscription = DeviceEventEmitter.addListener("UNAUTHORIZED", () => {
      signOut();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const signIn = async (host: string, username: string, password: string) => {
    const deviceId = await getDeviceID();
    const data = await login(host, username, password, deviceId);
    const newSession: Session = {
      host: host.trim().replace(/\/$/, ""),
      token: data.data.token,
      username: data.data.username,
    };
    if (
      !newSession.host.startsWith("http://") &&
      !newSession.host.startsWith("https://")
    ) {
      newSession.host = `http://${newSession.host}`;
    }
    if (Platform.OS === "web") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession));
    }
    setSession(newSession);
  };

  const signOut = async () => {
    if (session) {
      logout().catch(() => {
        console.log("logout call failed");
      });
    }
    setSession(null);
    if (Platform.OS === "web") {
      localStorage.removeItem(SESSION_KEY);
    } else {
      SecureStore.deleteItemAsync(SESSION_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function getDeviceID(): Promise<string> {
  let deviceId: string | null = null;
  if (Platform.OS === "web") {
    deviceId = localStorage.getItem(DEVICE_ID_KEY);
  } else {
    deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  }
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    if (Platform.OS === "web") {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } else {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
  }
  return deviceId;
}
