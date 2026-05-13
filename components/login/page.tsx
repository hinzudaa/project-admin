"use client";

import React, { useEffect, useState } from "react";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/apis";
import { useAuth, User } from "@/components/providers/AuthProvider";

type LoginPayload = {
    phone: string;
    password: string;
};

type LoginResponse = {
    token?: string;
    user?: User; // put your real User type here if you have it
    message?: string;
};

export default function AdminLoginPage() {
    const { login: authLogin, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) router.push("/admin");
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await authApi.login({ phone, password } as LoginPayload);

            const data: LoginResponse =
                typeof res === "object" && res !== null && "data" in res
                    ? (res as { data: LoginResponse }).data
                    : (res as LoginResponse);

            if (data?.token) {
                if (data.user?.role === "user") {
                    setError("You do not have administrative privileges.");
                    return;
                }
                authLogin(data.token, data.user);
                router.push("/admin");
                return;
            }

            setError(data?.message ?? "Login failed. No token received.");
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 animate-pulse flex items-center justify-center">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),rgba(0,0,0,1))] font-sans p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-4 shadow-xl shadow-blue-900/20">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        ProjectM Admin
                    </h1>
                    <p className="text-gray-400 mt-2">Sign in to manage your platform</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded bg-black/40 border-white/10 text-blue-600 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-400">Remember me</span>
                            </label>
                            <a
                                href="#"
                                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                            {!isLoading && <LogIn className="w-5 h-5" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    &copy; {new Date().getFullYear()} ProjectM. All rights reserved.
                </p>
            </div>
        </div>
    );
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;

    // axios-like: err.response.data.message
    if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: unknown } } };
        const msg = e.response?.data?.message;
        if (typeof msg === "string" && msg.trim()) return msg;
    }

    return "Нууц үг эсвэл нэвтрэх нэр буруу байна.";
}
