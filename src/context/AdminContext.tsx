import React, { createContext, useContext, useState } from "react";

export interface LoginResult {
  ok: boolean;
  message?: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("admin_token");
  });

  const login = async (password: string): Promise<LoginResult> => {
    try {
      const response = await fetch("/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        return { ok: true };
      }
      if (response.status === 429) {
        return { ok: false, message: "Too many failed attempts. Please try again in 15 minutes." };
      }
      return { ok: false, message: (data && data.error) || "Invalid administrator password" };
    } catch (error) {
      console.error("Login failed:", error);
    }
    return { ok: false, message: "Login failed. Please check your connection." };
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
