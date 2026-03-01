"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  _id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Decode a JWT and return its expiry timestamp (ms) or null if unreadable. */
function getTokenExpiry(jwt: string): number | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof decoded.exp !== "number") return null;
    return decoded.exp * 1000; // convert seconds → ms
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = Cookies.get("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        Cookies.remove("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !token && pathname !== "/login") {
      console.log("[Auth] No token found, redirecting to login");
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  // Auto-logout when the JWT token expires
  useEffect(() => {
    if (!token) return;

    const scheduleLogout = () => {
      // Clear any existing timer
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

      const expiryMs = getTokenExpiry(token);

      if (!expiryMs) {
        console.warn(
          "[Auth] Could not read token expiry — skipping auto-logout timer.",
        );
        return;
      }

      const msUntilExpiry = expiryMs - Date.now();

      if (msUntilExpiry <= 0) {
        // Token is already expired
        console.log("[Auth] Token already expired — logging out.");
        logout();
        return;
      }

      console.log(
        `[Auth] Token expires in ${Math.round(msUntilExpiry / 1000)}s — auto-logout scheduled.`,
      );
      logoutTimerRef.current = setTimeout(() => {
        console.log("[Auth] Token expired — logging out automatically.");
        logout();
      }, msUntilExpiry);
    };

    // Check immediately and schedule the timer
    scheduleLogout();

    // Also re-check when the user comes back to the tab (e.g. after a long absence)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const expiryMs = getTokenExpiry(token);
        if (expiryMs && Date.now() >= expiryMs) {
          console.log(
            "[Auth] Token expired while tab was hidden — logging out.",
          );
          logout();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    console.log("[Auth] Logging in user:", newUser.email);

    Cookies.set("admin_token", newToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    localStorage.setItem("admin_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    const verifyToken = Cookies.get("admin_token");
    console.log("[Auth] Token set successfully:", verifyToken ? "Yes" : "No");

    router.push("/");
  };

  const logout = () => {
    console.log("[Auth] Logging out user");
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    Cookies.remove("admin_token", { path: "/" });
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
