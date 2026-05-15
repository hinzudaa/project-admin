"use client";

import React, { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Image from 'next/image';
import {
    Image as ImageIcon,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Trash2,
    Plus,
    Edit2,
} from "lucide-react";

import BannerModal from "@/components/admin/BannerModal";
import { bannerApi } from "@/apis";
import { useAuth } from "@/components/providers/AuthProvider";

interface Banner {
    _id: string;
    title: string;
    description: string;
    image: { _id: string; url: string };
    createdAt: string;
}

export default function BannerPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const { user: currentUser } = useAuth();

    const { data, isLoading, mutate } = useSWR(
        ["admin-banners", page, searchTerm],
        () => bannerApi.adminListBanners({ page, search: searchTerm })
    );

    const banners: Banner[] = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            await bannerApi.adminDeleteBanner(id);
            toast.success("Banner deleted successfully");
            mutate();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to delete banner");
        }
    };

    const handleEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Banner Management</h1>

                <div className="relative group overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search banners..."
                        className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <button
                    onClick={() => { setSelectedBanner(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Banner</span>
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Banner</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Description</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Created</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : banners.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                        <ImageIcon className="w-12 h-12 opacity-20 mx-auto mb-3" />
                                        No banners found
                                    </td>
                                </tr>
                            ) : (
                                banners?.map((banner) => (
                                    <tr key={banner._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 relative rounded-lg border border-white/10 overflow-hidden shrink-0">
                                                    <Image
                                                        src={banner.image?.url}
                                                        alt={banner.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{banner.title}</p>
                                                    <p className="text-xs text-gray-500">ID: {banner._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{banner.description}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(banner.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(banner)}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(banner._id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && banners.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                banner={selectedBanner}
                onSuccess={() => mutate()}
                currentUser={currentUser}
            />
        </div>
    );
}