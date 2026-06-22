"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { financeApi, FinanceListParams } from '@/apis/finance';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Filter,
    Plus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FinanceEntryModal from '@/components/admin/FinanceEntryModal';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
        style: 'currency',
        currency: 'MNT',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('mn-MN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function FinancePage() {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [type, setType] = useState<string>('');
    const [source, setSource] = useState<string>('');
    const [from, setFrom] = useState<string>('');
    const [to, setTo] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const params: FinanceListParams = {
        page,
        limit,
        type: type || undefined,
        source: source || undefined,
        from: from || undefined,
        to: to || undefined,
    };

    const { data, isLoading, mutate } = useSWR(
        ['finance', params],
        () => financeApi.getList(params)
    );

    const { data: summary, mutate: mutateSummary } = useSWR(
        ['finance-summary', from, to],
        () => financeApi.getSummary({ from: from || undefined, to: to || undefined })
    );

    const items = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Санхүү</h1>
                    <p className="text-gray-500 mt-1 text-sm">Орлого болон зарлагын хяналтын самбар</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    <span>Гүйлгээ нэмэх</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Нийт Орлого"
                    value={summary?.totalIncome ?? 0}
                    icon={TrendingUp}
                    color="emerald"
                    trend="Incomes from all sources"
                />
                <StatCard
                    title="Нийт Зарлага"
                    value={summary?.totalExpenses ?? 0}
                    icon={TrendingDown}
                    color="rose"
                    trend="Total expenses"
                />
                <StatCard
                    title="Үлдэгдэл"
                    value={summary?.balance ?? 0}
                    icon={Wallet}
                    color="blue"
                    trend="Net profit"
                />
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">Зарлагын задаргаа</span>
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Filter className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {summary?.expensesByType && Object.entries(summary.expensesByType).map(([cat, info]) => (
                            <div key={cat} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 capitalize">{info.label}</span>
                                <span className="text-white font-medium">{formatCurrency(info.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Төрөл</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                            value={type}
                            onChange={(e) => { setType(e.target.value); setPage(1); }}
                        >
                            <option value="">Бүгд</option>
                            <option value="income">Орлого</option>
                            <option value="social">Нийгмийн</option>
                            <option value="other">Бусад</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Эх сурвалж</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                            value={source}
                            onChange={(e) => { setSource(e.target.value); setPage(1); }}
                        >
                            <option value="">Бүгд</option>
                            <option value="membership">Гишүүнчлэл</option>
                            <option value="manual">Гар аргаар</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Эхлэх огноо</label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={from}
                            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Дуусах огноо</label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={to}
                            onChange={(e) => { setTo(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-bold text-gray-400">Огноо</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-400">Төрөл</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-400 text-right">Дүн</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-400">Тайлбар / Эх сурвалж</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-400 text-right">Гүйцэтгэсэн</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                            <p className="text-gray-500 animate-pulse font-medium">Loading transactions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Wallet className="w-16 h-16 opacity-10" />
                                            <p className="italic text-lg">Гүйлгээ олдсонгүй</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium">{formatDate(item.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                                                item.type === 'income'
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    : item.type === 'social'
                                                        ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                                        : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                            )}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                                "font-bold text-base",
                                                item.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                            )}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{item.source}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-white text-sm font-medium truncate group-hover:text-clip group-hover:whitespace-normal">
                                                    {item.note}
                                                </p>
                                                {item.membership && (
                                                    <p className="text-[10px] text-blue-500 font-bold mt-1">
                                                        Membership Order: {item.membership.orderId || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm text-white font-medium">
                                                    {item.user?.name || item.createdBy?.name || 'System'}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {item.user?.username || item.createdBy?.username || ''}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && items.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/1">
                        <p className="text-sm text-gray-500">
                            Хуудас <span className="text-white font-medium">{page}</span> / <span className="text-white font-medium">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <FinanceEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { mutate(); mutateSummary(); }}
            />
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: { title: string, value: number, icon: React.ElementType, color: 'emerald' | 'rose' | 'blue', trend: string }) {
    const colorClasses = {
        emerald: "from-emerald-600/20 to-emerald-600/5 text-emerald-500 shadow-emerald-500/10",
        rose: "from-rose-600/20 to-rose-600/5 text-rose-500 shadow-rose-500/10",
        blue: "from-blue-600/20 to-blue-600/5 text-blue-500 shadow-blue-500/10",
    };

    const gradientClasses = {
        emerald: "bg-gradient-to-tr",
        rose: "bg-gradient-to-tr",
        blue: "bg-gradient-to-tr",
    };

    return (
        <div className={cn(
            "relative group overflow-hidden border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/5",
            gradientClasses[color],
            colorClasses[color]
        )}>
            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <h3 className="text-2xl font-black text-white">{formatCurrency(value)}</h3>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg",
                    color === 'emerald' ? "text-emerald-500" : color === 'rose' ? "text-rose-500" : "text-blue-500"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    color === 'emerald' ? "bg-emerald-500" : color === 'rose' ? "bg-rose-500" : "bg-blue-500"
                )} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{trend}</span>
            </div>

            {/* Background Decoration */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 opacity-10 transition-transform duration-500 group-hover:scale-150 group-hover:rotate-12",
                color === 'emerald' ? "text-emerald-500" : color === 'rose' ? "text-rose-500" : "text-blue-500"
            )}>
                <Icon size={96} />
            </div>
        </div>
    );
}
