"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Newspaper,
    BookOpen,
    CreditCard,
    ChevronRight,
    ShieldCheck,
    MessagesSquare,
    BookDashed,
    ShieldAlert,
    Bot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Forum', icon: MessagesSquare, href: '/admin/forum' },
    { name: 'Membership', icon: CreditCard, href: '/admin/membership' },
    { name: 'Finance', icon: LayoutDashboard, href: '/admin/finance' },
    { name: 'Banner', icon: ShieldAlert, href: '/admin/banner' },
    { name: 'AI Humans', icon: Bot, href: '/admin/ai-human' },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "w-64 min-h-screen bg-[#0f0f12] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Admin
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-blue-600/10 text-blue-500 border border-blue-600/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-500" : "text-gray-400 group-hover:text-white")} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                            )} />
                        </Link>
                    );
                })}
            </nav>

            {/* User Status/Bottom section */}
            <div className="p-4 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 border border-white/10" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">admin@afterkiss.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
