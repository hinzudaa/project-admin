"use client";

import React, { useState } from 'react';
import { X, Loader2, Save, Key, Type, Database, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { experienceApi } from '@/apis';
import { ExperienceRule } from '@/apis/experience';

interface ExperienceRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    rule?: ExperienceRule;
}

export default function ExperienceRuleModal({ isOpen, onClose, onSuccess, rule }: ExperienceRuleModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        title: '',
        type: 'fixed' as 'fixed' | 'rate',
        points: 0 as number | '',
        unitAmount: 0 as number | '',
        isActive: true,
    });

    const [prevRule, setPrevRule] = useState(rule);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (rule !== prevRule || isOpen !== prevIsOpen) {
        setPrevRule(rule);
        setPrevIsOpen(isOpen);
        if (rule) {
            setFormData({
                key: rule.key || '',
                title: rule.title || '',
                type: rule.type || 'fixed',
                points: rule.points ?? 0,
                unitAmount: rule.unitAmount ?? 0,
                isActive: rule.isActive ?? true,
            });
        } else {
            setFormData({
                key: '',
                title: '',
                type: 'fixed',
                points: 0,
                unitAmount: 0,
                isActive: true,
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const submitData = {
                ...formData,
                points: Number(formData.points) || 0,
                unitAmount: Number(formData.unitAmount) || 0,
            };
            if (rule) {
                await experienceApi.adminUpdateExperienceRule(rule._id, submitData);
            } else {
                await experienceApi.adminCreateExperienceRule(submitData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save experience rule:', error);
            alert('Failed to save experience rule.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{rule ? 'Update Rule' : 'New Rule'}</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure how users earn experience points</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Key Label</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    required
                                    name="key"
                                    value={formData.key}
                                    onChange={handleChange}
                                    placeholder="e.g. post_create"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Title</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Create Post"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Type</label>
                            <div className="relative">
                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="fixed">Fixed Points</option>
                                    <option value="rate">Rate Based</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Points</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">P</div>
                                <input
                                    required
                                    type="number"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {formData.type === 'rate' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Unit Amount</label>
                                <div className="relative">
                                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        required
                                        type="number"
                                        name="unitAmount"
                                        value={formData.unitAmount}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 ml-1">Status</label>
                            <button
                                type="button"
                                onClick={() => handleToggle('isActive')}
                                className={`flex items-center justify-between w-full p-3 rounded-2xl border transition-all ${formData.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                            >
                                <span className="font-semibold">{formData.isActive ? 'Active' : 'Inactive'}</span>
                                {formData.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{rule ? 'Update Rule' : 'Create Rule'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
