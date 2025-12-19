"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

  const login = (newToken: string, newUser: User) => {
    console.log("[Auth] Logging in user:", newUser.email);
    
    // Secure cookie: ensure usage of 'secure: true' in production if https. 
    // For local dev http, secure: false (default behaves likely okay, but explicit is better).
    // SameSite: 'lax' allows cookie to be sent on same-site navigations
    Cookies.set("admin_token", newToken, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production", 
      sameSite: 'lax',
      path: '/' 
    });
    
    localStorage.setItem("admin_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    
    // Verify cookie was set
    const verifyToken = Cookies.get("admin_token");
    console.log("[Auth] Token set successfully:", verifyToken ? "Yes" : "No");
    
    router.push("/");
  };

  const logout = () => {
    console.log("[Auth] Logging out user");
    Cookies.remove("admin_token", { path: '/' });
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
