"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { siteUrl } from "../../config/site";
import { HttpRequest } from "@/utils/request";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

export interface User {
    _id: string;
    email: string;
    username?: string;
    name?: string;
    role?: string;
    provider?: string;
    gender?: string;
    membershipExpiresAt?: string;
    avatar?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: Error | null;
    login: (token: string, userData?: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            const loginTime = localStorage.getItem("login_time");
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            const isExpired = !loginTime || (Date.now() - parseInt(loginTime) > sevenDaysInMs);

            if (isExpired) {
                localStorage.removeItem("token");
                localStorage.removeItem("login_time");
                React.startTransition(() => {
                    setTokenState(null);
                });
            } else {
                React.startTransition(() => {
                    setTokenState(savedToken);
                });
            }
        }
    }, []);

    const fetcher = async () => {
        const req = new HttpRequest(token);
        return req.get("/users/me");
    };

    const { data: user, error, isLoading } = useSWR<User>(
        token ? `${siteUrl}/users/me` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            shouldRetryOnError: false,
        }
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("login_time");
        React.startTransition(() => {
            setTokenState(null);
        });
        mutate(`${siteUrl}/users/me`, null, false);
    };

    useEffect(() => {
        if (error && token) {
            const err = error as Record<string, unknown>;
            // Most backends return 401 when a session is invalidated (e.g. by a new login)
            if (err.status === 401 || err.status === 500) {
                toast.error("Өөр төхөөрөмжөөс нэвтэрсэн байна. Таныг системээс гаргалаа.", {
                    id: "double-login-toast",
                });
                logout();
                router.push("/");
            }
        }
    }, [error, token, router]);

    const login = (newToken: string, userData?: User) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("login_time", Date.now().toString());
        React.startTransition(() => {
            setTokenState(newToken);
        });
        if (userData) {
            mutate(`${siteUrl}/users/me`, userData, false);
        } else {
            mutate(`${siteUrl}/users/me`);
        }
    };

    useEffect(() => {
        if (user && user.role === "user") {
            logout();
            router.push("/");
        }
    }, [user, router]);

    return (
        <AuthContext.Provider
            value={{
                user: user || null,
                token,
                isLoading,
                error: error || null,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
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
