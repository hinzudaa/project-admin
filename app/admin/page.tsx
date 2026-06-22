"use client";

import React, { useState } from "react";
import useSWR from "swr";
import MembershipDashboard from '@/components/admin/MembershipDashboard';
import { Loader2, LayoutDashboard, Calendar, RefreshCcw } from 'lucide-react';
import { dashboardApi, financeApi } from "@/apis";

export default function AdminDashboard() {
    const [range, setRange] = useState<{ from: string; to: string }>(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);
        return {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],

        };
    });

    const { data: statsData, isLoading: statsLoading, error: statsError, mutate: mutateStats } = useSWR(
        ['dashboard-stats', range.from, range.to],
        () => dashboardApi.adminDashboardStats({ from: range.from, to: range.to })
    );

    const { data: financeData, isLoading: financeLoading, error: financeError, mutate: mutateFinance } = useSWR(
        ['finance-stats', range.from, range.to],
        () => financeApi.getSummary({ from: range.from, to: range.to })
    );

    const isPageLoading = statsLoading || financeLoading;
    const isPageError = statsError || financeError;

    const handleRefresh = () => {
        mutateStats();
        mutateFinance();
    };

    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 text-blue-500 font-black uppercase tracking-widest text-xs">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Overview</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none mb-3">Command Center</h1>
                    <p className="text-gray-500 font-medium">Real-time platform metrics and financial analytics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <input
                                type="date"
                                value={range.from}
                                onChange={(e) => setRange(prev => ({ ...prev, from: e.target.value }))}
                                className="bg-transparent text-white text-xs font-bold outline-none border-none focus:ring-0 w-28 uppercase"
                            />
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 px-3 py-2">
                            <input
                                type="date"
                                value={range.to}
                                onChange={(e) => setRange(prev => ({ ...prev, to: e.target.value }))}
                                className="bg-transparent text-white text-xs font-bold outline-none border-none focus:ring-0 w-28 uppercase"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isPageLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isPageLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse text-sm">Synchronizing Data...</p>
                </div>
            ) : isPageError ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 max-w-lg text-center font-medium">
                        {(() => {
                            const err = (statsError || financeError) as Record<string, unknown>;
                            let msg = (err?.message as string) || "Өгөгдөл татахад алдаа гарлаа.";
                            try {
                                if (typeof msg === 'string' && msg.startsWith('[')) {
                                    const parsed = JSON.parse(msg);
                                    if (Array.isArray(parsed) && parsed[0]?.message) {
                                        msg = parsed[0].message;
                                    }
                                }
                            } catch { }
                            return msg;
                        })()}
                    </div>
                </div>
            ) : (
                <MembershipDashboard
                    stats={statsData?.data || statsData}
                    finance={financeData ? {
                        income: financeData.totalIncome,
                        expense: financeData.totalExpenses,
                        balance: financeData.balance,
                        expenseByType: Object.fromEntries(
                            Object.entries(financeData.expensesByType || {}).map(([, info]) => [info.label, info.total])
                        ),
                    } : undefined}
                />
            )}
        </div>
    );
}
