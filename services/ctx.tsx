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
const PROFILES_KEY = "auth-profiles";
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
  profiles: Session[];
  hasSelectedProfile: boolean;
  selectProfile: (profile: Session) => void;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  profiles: [],
  hasSelectedProfile: false,
  selectProfile: () => {},
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
  const [profiles, setProfiles] = useState<Session[]>([]);
  const [hasSelectedProfile, setHasSelectedProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let loadedProfiles: Session[] = [];
        let loadedSession: Session | null = null;

        if (Platform.OS === "web") {
          const profilesJson = localStorage.getItem(PROFILES_KEY);
          if (profilesJson) {
            loadedProfiles = JSON.parse(profilesJson);
          }
          const sessionJson = localStorage.getItem(SESSION_KEY);
          if (sessionJson) {
            loadedSession = JSON.parse(sessionJson);
          }
        } else {
          const [profilesJson, sessionJson] = await Promise.all([
            SecureStore.getItemAsync(PROFILES_KEY),
            SecureStore.getItemAsync(SESSION_KEY),
          ]);
          if (profilesJson) {
            loadedProfiles = JSON.parse(profilesJson);
          }
          if (sessionJson) {
            loadedSession = JSON.parse(sessionJson);
          }
        }

        setProfiles(loadedProfiles);

        if (loadedProfiles.length === 0) {
          setSession(null);
          setHasSelectedProfile(false);
        } else if (loadedProfiles.length === 1) {
          const singleProfile = loadedProfiles[0];
          setSession(singleProfile);
          setHasSelectedProfile(true);
          if (Platform.OS === "web") {
            localStorage.setItem(SESSION_KEY, JSON.stringify(singleProfile));
          } else {
            await SecureStore.setItemAsync(
              SESSION_KEY,
              JSON.stringify(singleProfile),
            );
          }
        } else {
          // If multiple profiles exist, force selection on startup
          setSession(null);
          setHasSelectedProfile(false);
        }
      } catch (e) {
        console.error("Failed to initialize auth", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

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

    const updatedProfiles = [...profiles];
    const index = updatedProfiles.findIndex(
      (p) => p.host === newSession.host && p.username === newSession.username,
    );
    if (index > -1) {
      updatedProfiles[index] = newSession;
    } else {
      updatedProfiles.push(newSession);
    }
    setProfiles(updatedProfiles);

    if (Platform.OS === "web") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
    } else {
      await Promise.all([
        SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession)),
        SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(updatedProfiles)),
      ]);
    }
    setSession(newSession);
    setHasSelectedProfile(true);
  };

  const signOut = async () => {
    if (session) {
      logout().catch(() => {
        console.log("logout call failed");
      });
      const updatedProfiles = profiles.filter(
        (p) => !(p.host === session.host && p.username === session.username),
      );
      setProfiles(updatedProfiles);
      if (Platform.OS === "web") {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
      } else {
        await SecureStore.setItemAsync(
          PROFILES_KEY,
          JSON.stringify(updatedProfiles),
        );
      }
    }

    setSession(null);
    setHasSelectedProfile(false);

    if (Platform.OS === "web") {
      localStorage.removeItem(SESSION_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  };

  const selectProfile = async (profile: Session) => {
    if (Platform.OS === "web") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(profile));
    }
    setSession(profile);
    setHasSelectedProfile(true);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        profiles,
        hasSelectedProfile,
        selectProfile,
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
