"use client";

import React, { useState, useEffect } from "react";
import { movieApi } from "@/apis";
import toast from "react-hot-toast";
import { ImagePicker } from "../form/image-picker";

type Movie = {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: { _id?: string; url: string };
    price?: number;
    isPremium?: boolean;
};

interface MovieModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    movie?: Movie;
}

export default function MovieModal({ isOpen, onClose, onSuccess, movie }: MovieModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [thumbnail, setThumbnail] = useState<{ id?: string; url?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (movie) {
            setTitle(movie.title);
            setDescription(movie.description || "");
            setPrice(movie.price != null ? String(movie.price) : "");
            setIsPremium(movie.isPremium || false);
            setThumbnail(movie.thumbnail ? { id: movie.thumbnail._id, url: movie.thumbnail.url } : null);
        } else {
            setTitle("");
            setDescription("");
            setPrice("");
            setIsPremium(false);
            setThumbnail(null);
        }
    }, [movie, isOpen]);

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
                isPremium,
            };
            if (price) payload.price = Number(price);
            if (thumbnail?.id) payload.thumbnail = thumbnail.id;

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
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-md bg-gray-900 rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {movie ? "Edit Movie" : "Add Movie"}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Title</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Movie title"
                        />
                    </div>
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Description</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description"
                        />
                    </div>
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Price (₮)</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0 = free"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPremium"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                            className="w-4 h-4 rounded bg-black/40 border-white/10 text-blue-600"
                        />
                        <label htmlFor="isPremium" className="text-white font-medium text-sm cursor-pointer">
                            Premium content (requires membership)
                        </label>
                    </div>
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Thumbnail</label>
                        <ImagePicker
                            label="Movie Thumbnail"
                            value={thumbnail}
                            onChange={(img) => setThumbnail(img)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-2xl border border-white/10 text-white hover:bg-white/5 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : movie ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
