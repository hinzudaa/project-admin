"use client";

import React, { useState } from 'react';
import { X, Loader2, Save, User as UserIcon, Shield, Lock } from 'lucide-react';
import { adminCreateUser } from '@/apis/user';
import toast from 'react-hot-toast';
import { User } from '@/components/providers/AuthProvider';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
    role: string;
}

export default function UserModal({ isOpen, onClose, onSuccess }: UserModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateUserPayload>({
        username: '',
        email: '',
        password: '',
        role: 'user',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // The backend creation API expects the password field
            await adminCreateUser(formData as unknown as User);
            toast.success('User created successfully');
            onSuccess();
            onClose();
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'user',
            });
        } catch (error: unknown) {
            console.error('User creation error:', error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create New User</h2>
                        <p className="text-sm text-gray-500 mt-1">Initialize a new account with specific privileges</p>
                    </div>

                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" /> Username
                            </label>
                            <input
                                required
                                name="username"
                                type="text"
                                placeholder="johndoe"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Secure Password
                            </label>
                            <input
                                required
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Account Role
                            </label>
                            <select
                                name="role"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="user" className="bg-[#121214]">Standard User</option>
                                <option value="admin" className="bg-[#121214]">Administrator</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-2 flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Generate User</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
