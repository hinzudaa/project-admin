"use client";

import React, { useState } from 'react';
import { X, Loader2, Save, Calendar, FileText, Globe, EyeOff, Info, Hash, DollarSign } from 'lucide-react';
import { membershipApi } from '@/apis';
import { ImagePicker } from '../form/image-picker';

interface MembershipPlan {
    _id: string;
    title: string;
    description?: string;
    tier?: 'basic' | 'standard' | 'premium';
    months: number;
    price: number;
    isActive: boolean;
    sortOrder: number;
    image?: {
        _id: string;
        url: string;
    };
    createdAt: string;
}

interface MembershipPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plan?: MembershipPlan;
}

export default function MembershipPlanModal({ isOpen, onClose, onSuccess, plan }: MembershipPlanModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tier: 'basic' as 'basic' | 'standard' | 'premium',
        months: 1 as number | '',
        price: 0 as number | '',
        isActive: true,
        sortOrder: 0 as number | '',
        image: null as { id?: string; url?: string } | null,
    });

    const [prevPlan, setPrevPlan] = useState(plan);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (plan !== prevPlan || isOpen !== prevIsOpen) {
        setPrevPlan(plan);
        setPrevIsOpen(isOpen);
        if (plan) {
            setFormData({
                title: plan.title || '',
                description: plan.description || '',
                tier: plan.tier || 'basic',
                months: plan.months ?? 1,
                price: plan.price ?? 0,
                isActive: plan.isActive ?? true,
                sortOrder: plan.sortOrder ?? 0,
                image: plan.image ? { id: plan.image._id, url: plan.image.url } : null,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                tier: 'basic',
                months: 1,
                price: 0,
                isActive: true,
                sortOrder: 0,
                image: null,
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleToggle = (name: 'isActive') => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                months: Number(formData.months) || 1,
                price: Number(formData.price) || 0,
                sortOrder: Number(formData.sortOrder) || 0,
                image: formData.image?.id || null,
            };

            if (plan) {
                await membershipApi.adminUpdateMembershipPlan(plan._id, payload);
            } else {
                await membershipApi.adminCreateMembershipPlan(payload);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(plan ? 'Failed to update plan:' : 'Failed to create plan:', error);
            alert(plan ? 'Failed to update plan.' : 'Failed to create plan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#121214] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{plan ? 'Update Plan' : 'Create New Plan'}</h2>
                        <p className="text-sm text-gray-500 mt-1">{plan ? 'Modify the existing membership plan' : 'Define a new subscription tier for users'}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <form id="membership-plan-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                {/* Title Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Plan Title</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="title"
                                            placeholder="e.g. Premium Monthly"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Tier Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Tier</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['basic', 'standard', 'premium'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, tier: t }))}
                                                className={`py-3 rounded-2xl border font-semibold text-sm capitalize transition-all ${formData.tier === t
                                                    ? t === 'premium' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                        : t === 'standard' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Description</label>
                                    <div className="relative group">
                                        <div className="absolute top-4 left-5 pointer-events-none">
                                            <Info className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <textarea
                                            name="description"
                                            placeholder="What does this plan offer?"
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm leading-relaxed"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Months Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-400 ml-1">Duration (Months)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                name="months"
                                                min="1"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                                value={formData.months}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-400 ml-1">Price (₮)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                name="price"
                                                min="0"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                                value={formData.price}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Sort Order */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-400 ml-1">Sort Order</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Hash className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                type="number"
                                                name="sortOrder"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                                value={formData.sortOrder}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-400 ml-1">Status</label>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle('isActive')}
                                            className={`flex items-center justify-between w-full p-3.5 rounded-2xl border transition-all ${formData.isActive
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                : 'bg-white/5 border-white/10 text-gray-500'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {formData.isActive ? <Globe className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5" />}
                                                <span className="font-semibold text-sm">Active</span>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Image Picker Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Plan Cover Image</label>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:border-white/20">
                                        <ImagePicker
                                            label="Plan Image"
                                            value={formData.image}
                                            onChange={(img) => setFormData(prev => ({ ...prev, image: img }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-white/10 bg-white/2 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="membership-plan-form"
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{plan ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{plan ? 'Update Plan' : 'Create Plan'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
