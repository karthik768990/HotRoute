"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/lib/api/client";

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("hotroute_token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiClient.get("/auth/me");
                if (response.data.success) {
                    setUser(response.data.data);
                } else {
                    localStorage.removeItem("hotroute_token");
                }
            } catch (error) {
                console.error("Failed to load user:", error);
                localStorage.removeItem("hotroute_token");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("hotroute_token", token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem("hotroute_token");
            setUser(null);
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
