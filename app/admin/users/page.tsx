"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { getUsers, deleteUser, updateAvatar } from '@/apis/user';
import toast from 'react-hot-toast';
import {
    Mail,
    User as UserIcon,
    Shield,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Trash2,
    Plus,
    Zap,
    Edit2
} from 'lucide-react';
import UserModal from '@/components/admin/UserModal';
import AdjustExpModal from '@/components/admin/AdjustExpModal';
import { User } from '@/components/providers/AuthProvider';
import Image from 'next/image';

export default function UsersPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustExpOpen, setIsAdjustExpOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

    const { data, isLoading, mutate } = useSWR(
        ['users', page, searchTerm],
        () => getUsers({ page, search: searchTerm })
    );

    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteUser(id);
            toast.success('User deleted successfully');
            mutate();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error(message);
        }
    };

    const handleAdjustExp = (id: string) => {
        setSelectedUserId(id);
        setIsAdjustExpOpen(true);
    };

    const handleUploadAvatar = async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const load = toast.loading('Uploading avatar...');
        try {
            await updateAvatar(formData, id);
            toast.success('Avatar updated successfully', { id: load });
            mutate();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to upload avatar';
            toast.error(message, { id: load });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Users Management</h1>

                <div className="relative group overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setSelectedUserId(undefined);
                            setIsAdjustExpOpen(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 px-6 py-2.5 rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Zap className="w-5 h-5" />
                        <span>Adjust EXP</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New User</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Membership</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Gender</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Created Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-gray-500 animate-pulse">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <UserIcon className="w-12 h-12 opacity-20" />
                                            <p className="italic">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: User) => (
                                    <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative group/avatar">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold overflow-hidden relative">
                                                        {user.avatar ? (
                                                            <Image
                                                                src={user.avatar}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            (user.name || user.username || user.email)[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 rounded-full cursor-pointer transition-opacity">
                                                        <Plus className="w-4 h-4 text-white" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleUploadAvatar(user._id, file);
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                        {user.name || user.username || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-purple-500' : 'text-blue-500'}`} />
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {(user.role || 'user').toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {user.membershipExpiresAt
                                                        ? new Date(user.membershipExpiresAt).toLocaleDateString()
                                                        : 'No Active Plan'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400 capitalize">{user.gender || 'Not specified'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAdjustExp(user._id)}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all transform active:scale-95"
                                                    title="Edit Experience"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAdjustExp(user._id)}
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
                                                    title="Quick Adjust EXP"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all transform active:scale-95"
                                                    title="Delete User"
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

                {/* Pagination */}
                {!isLoading && users.length > 0 && (
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

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => mutate()}
            />

            <AdjustExpModal
                isOpen={isAdjustExpOpen}
                onClose={() => setIsAdjustExpOpen(false)}
                userId={selectedUserId}
                onSuccess={() => mutate()}
            />
        </div>
    );
}

