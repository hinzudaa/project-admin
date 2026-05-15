"use client";

import React, { useState } from 'react';
import { X, Loader2, Save, User, Hash, MessageSquare } from 'lucide-react';
import { experienceApi } from '@/apis';
import toast from 'react-hot-toast';

interface AdjustExpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userId?: string;
}

export default function AdjustExpModal({ isOpen, onClose, onSuccess, userId }: AdjustExpModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        userId: string;
        amount: number | '';
        mode: 'add' | 'set';
        note: string;
    }>({
        userId: '',
        amount: 0,
        mode: 'add' as 'add' | 'set',
        note: '',
    });

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [prevUserId, setPrevUserId] = useState(userId);

    if (isOpen !== prevIsOpen || userId !== prevUserId) {
        setPrevIsOpen(isOpen);
        setPrevUserId(userId);
        if (isOpen) {
            setFormData({
                userId: userId || '',
                amount: 0,
                mode: 'add',
                note: '',
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userId) return toast.error('User ID is required');

        setSubmitting(true);
        try {
            await experienceApi.adminAdjustUserExp(formData.userId, {
                amount: Number(formData.amount) || 0,
                mode: formData.mode,
                note: formData.note,
            });
            toast.success('Experience adjusted successfully');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to adjust experience:', error);
            toast.error('Failed to adjust experience.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Adjust User EXP</h2>
                        <p className="text-sm text-gray-500 mt-1">Manually modify user experience points</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">User ID</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    required
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    placeholder="Enter user ID"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Mode</label>
                                <select
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="add" className="bg-[#121214]">Add / Subtract</option>
                                    <option value="set" className="bg-[#121214]">Set Absolute</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Amount</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        required
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder={formData.mode === 'add' ? 'e.g. 500 or -200' : 'e.g. 1000'}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Admin Note</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    placeholder="Brief explanation for this adjustment"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>Apply Change</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
