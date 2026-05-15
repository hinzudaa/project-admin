"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { GameZone, gameZoneApi } from '@/apis/game-zone';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import {
    Gamepad2,
    Search,
    Loader2,
    Trash2,
    Plus,
    Edit2,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    Gamepad
} from 'lucide-react';

export default function GameZonesPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, mutate } = useSWR(
        ['game-zones', page, searchTerm],
        () => gameZoneApi.listGameZones({ page, search: searchTerm })
    );

    const items = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this GameZone?')) {
            return;
        }

        try {
            await gameZoneApi.deleteGameZone(id);
            toast.success('GameZone deleted successfully');
            mutate();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete';
            toast.error(message);
        }
    };

    const toggleStatus = async (item: GameZone) => {
        try {
            await gameZoneApi.updateGameZone(item._id, { isActive: !item.isActive });
            toast.success(`GameZone ${item.isActive ? 'deactivated' : 'activated'}`);
            mutate();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update status';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">GameZone</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage game zones and configurations</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search game zones..."
                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <Link
                        href="/admin/game-zone/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create GameZone</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Game</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Type / Level</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Model</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Sort</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-gray-500 animate-pulse">Loading game zones...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Gamepad2 className="w-12 h-12 opacity-20" />
                                            <p className="italic">No game zones found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: GameZone) => (
                                    <tr key={item._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold overflow-hidden shrink-0 relative">
                                                    {item.image?.url ? (
                                                        <Image
                                                            src={item.image.url}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <Gamepad className="w-6 h-6 opacity-30" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-300 uppercase">{item.type}</span>
                                                <span className="text-xs text-gray-500 capitalize">{item.level}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-gray-300 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                                {item.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(item)}
                                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${item.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}
                                            >
                                                {item.isActive ? (
                                                    <><ToggleRight className="w-4 h-4" /> Active</>
                                                ) : (
                                                    <><ToggleLeft className="w-4 h-4" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400 font-medium">#{item.sortOrder}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/game-zone/${item._id}`}
                                                    className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4.5 h-4.5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
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
                            Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
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
        </div>
    );
}
