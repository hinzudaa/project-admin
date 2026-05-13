"use client";

import React, { useState, useEffect } from "react";
import { movieApi } from "@/apis";
import toast from "react-hot-toast";
import { ImagePicker } from "../form/image-picker";

type Movie = {
    _id: string;
    title: string;
    description?: string;
    image?: { _id?: string; url: string };
    price?: number;
    discountedPrice?: number;
    releaseYear?: number;
    genres?: string[];
    isActive?: boolean;
    sortOrder?: number;
    isPremium?: boolean;
    status?: "draft" | "processing" | "ready" | "failed";
};

export const MOVIE_STATUSES = ["draft", "processing", "ready", "failed"] as const;

interface MovieModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    movie?: Movie;
}

export default function MovieModal({ isOpen, onClose, onSuccess, movie }: MovieModalProps) {
    const [title, setTitle] = useState(movie?.title || "");
    const [description, setDescription] = useState(movie?.description || "");
    const [price, setPrice] = useState(movie?.price != null ? String(movie?.price) : "");
    const [discountedPrice, setDiscountedPrice] = useState(movie?.discountedPrice != null ? String(movie?.discountedPrice) : "");
    const [releaseYear, setReleaseYear] = useState(movie?.releaseYear != null ? String(movie?.releaseYear) : "");
    const [genres, setGenres] = useState(movie?.genres?.join(", ") || "");
    const [isActive, setIsActive] = useState(movie?.isActive ?? true);
    const [sortOrder, setSortOrder] = useState(movie?.sortOrder != null ? String(movie?.sortOrder) : "0");
    const [isPremium, setIsPremium] = useState(movie?.isPremium || false);
    const [status, setStatus] = useState<typeof MOVIE_STATUSES[number]>(movie?.status || "draft");
    const [image, setImage] = useState<{ id?: string; url?: string } | null>(
        movie?.image ? { id: movie.image._id, url: movie.image.url } : null
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title) {
            toast.error("Title is required");
            return;
        }
        setLoading(true);
        try {
            const payload: Record<string, unknown> = {
                title,
                description,
                isActive,
                isPremium,
                status,
                sortOrder: Number(sortOrder) || 0,
                genres: genres.split(",").map(g => g.trim()).filter(Boolean),
            };
            if (price) payload.price = Number(price);
            if (discountedPrice) payload.discountedPrice = Number(discountedPrice);
            if (releaseYear) payload.releaseYear = Number(releaseYear);
            if (image?.id) payload.image = image.id;

            if (movie) {
                await movieApi.adminUpdateMovie(movie._id, payload);
                toast.success("Movie updated");
            } else {
                await movieApi.adminCreateMovie(payload);
                toast.success("Movie created");
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Operation failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl p-8 z-50 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {movie ? "Edit Movie" : "Add New Movie"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Title</label>
                            <input
                                type="text"
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter movie title"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Description</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter movie description"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Price (₮)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Discount Price</label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={discountedPrice}
                                    onChange={(e) => setDiscountedPrice(e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Thumbnail / Poster</label>
                            <ImagePicker
                                label="Movie Poster"
                                value={image}
                                onChange={(img) => setImage(img)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Release Year</label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={releaseYear}
                                    onChange={(e) => setReleaseYear(e.target.value)}
                                    placeholder="e.g. 2024"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Sort Order</label>
                                <input
                                    type="number"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Genres (comma separated)</label>
                            <input
                                type="text"
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={genres}
                                onChange={(e) => setGenres(e.target.value)}
                                placeholder="Action, Drama, Sci-Fi"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1.5 block">Status</label>
                            <select
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as typeof MOVIE_STATUSES[number])}
                            >
                                {MOVIE_STATUSES.map(s => (
                                    <option key={s} value={s} className="bg-gray-900 text-white">
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-700'}`} />
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Active</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isPremium}
                                    onChange={(e) => setIsPremium(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${isPremium ? 'bg-blue-500' : 'bg-gray-700'}`} />
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPremium ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Premium</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : movie ? "Update Movie" : "Create Movie"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
