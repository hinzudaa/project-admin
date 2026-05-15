"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    DollarSign,
    Users,
    TrendingUp,
    UserPlus,
    PieChart as PieIcon,
    ArrowDownCircle,
    ArrowUpCircle,
    Film,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface DailyStats {
    date: string;
    count?: number;
    amount?: number;
}

interface FinanceStats {
    income: number;
    expense: number;
    balance: number;
    expenseByType: Record<string, number>;
}

interface DashboardStats {
    from?: string;
    to?: string;
    date?: string;
    dailyRegistrations?: DailyStats[];
    dailyIncome?: DailyStats[];
    totalIncome?: number;
    totalRegisteredUsers?: number;
    totalPurchasingUsers?: number;
    totalInvoices?: number;
    totalPurchases?: number;
}

interface DashboardProps {
    stats: DashboardStats | null;
    finance?: FinanceStats;
    movieCount?: number;
}

export default function MembershipDashboard({ stats, finance, movieCount }: DashboardProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        React.startTransition(() => {
            setIsMounted(true);
        });
    }, []);

    if (!stats) return null;

    // Prepare data for charts
    const incomeData = (stats.dailyIncome || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        revenue: item.amount || 0,
    }));

    const registrationData = (stats.dailyRegistrations || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        count: item.count || 0,
    }));

    // Calculate totals if they are not provided (e.g. from ranged stats)
    const totalIncome = stats.totalIncome ?? (stats.dailyIncome || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalRegistrations = stats.totalRegisteredUsers ?? (stats.dailyRegistrations || []).reduce((acc, curr) => acc + (curr.count || 0), 0);
    
    // Finance derived data
    const expensePieData = finance?.expenseByType 
        ? Object.entries(finance.expenseByType).map(([name, value]) => ({ name, value }))
        : [];

    const incomeVsExpenseData = [
        { name: "Income", value: finance?.income || 0, color: "#10b981" },
        { name: "Expense", value: finance?.expense || 0, color: "#ef4444" },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Top Stat Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.07] transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Income</span>
                    <span className="text-2xl font-black text-white mt-2 leading-none">
                        ₮{(stats.totalIncome || totalIncome).toLocaleString()}
                    </span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.07] transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UserPlus className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Registrations</span>
                    <span className="text-2xl font-black text-white mt-2 leading-none">
                        {totalRegistrations.toLocaleString()}
                    </span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.07] transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ArrowDownCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Expenses</span>
                    <span className="text-2xl font-black text-white mt-2 leading-none">
                        ₮{(finance?.expense || 0).toLocaleString()}
                    </span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.07] transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Net Balance</span>
                    <span className="text-2xl font-black text-white mt-2 leading-none">
                        ₮{(finance?.balance || 0).toLocaleString()}
                    </span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.07] transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Film className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Movies</span>
                    <span className="text-2xl font-black text-white mt-2 leading-none">
                        {(movieCount || 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Financial Analysis Charts */}
            {finance && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Financial Summary</h3>
                                <p className="text-gray-500 text-sm">Income vs Expense comparison</p>
                            </div>
                            <ArrowUpCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="h-[250px] w-full min-w-0">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={incomeVsExpenseData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `₮${v / 1000}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: "#121214", border: "1px solid #ffffff10", borderRadius: "16px" }} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                        {incomeVsExpenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Expense Breakdown</h3>
                                <p className="text-gray-500 text-sm">Distribution by category</p>
                            </div>
                            <PieIcon className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="h-[250px] w-full min-w-0">
                            {isMounted && expensePieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={expensePieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expensePieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#121214", border: "1px solid #ffffff10", borderRadius: "16px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : !isMounted ? null : (
                                <div className="h-full flex items-center justify-center text-gray-600 font-medium">
                                    No expense data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Income Timeline */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Daily Income</h3>
                            <p className="text-gray-500 text-sm">Revenue growth overview</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>

                    <div className="h-[300px] w-full min-w-0">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={incomeData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₮${v / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#121214",
                                            border: "1px solid #ffffff10",
                                            borderRadius: "16px",
                                        }}
                                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Registration Timeline */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">User Growth</h3>
                            <p className="text-gray-500 text-sm">New registrations overview</p>
                        </div>
                        <Users className="w-6 h-6 text-purple-500" />
                    </div>

                    <div className="h-[300px] w-full min-w-0">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={registrationData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#121214",
                                            border: "1px solid #ffffff10",
                                            borderRadius: "16px",
                                        }}
                                        cursor={{ fill: "#ffffff05" }}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
