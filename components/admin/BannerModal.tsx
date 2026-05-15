"use client";

import React, { useState } from "react";
import { bannerApi } from "@/apis";
import toast from "react-hot-toast";
import { ImagePicker } from "../form/image-picker";

interface Banner {
    _id: string;
    title: string;
    description: string;
    image: { _id: string; url: string };
}

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    banner?: Banner | null;
    currentUser: { _id: string } | null;
}

export default function BannerModal({ isOpen, onClose, onSuccess, banner, currentUser }: BannerModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<{ id?: string; url?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const [prevBanner, setPrevBanner] = useState(banner);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (banner !== prevBanner || isOpen !== prevIsOpen) {
        setPrevBanner(banner);
        setPrevIsOpen(isOpen);
        if (banner) {
            setTitle(banner.title);
            setDescription(banner.description);
            setImage({ id: banner.image?._id, url: banner.image?.url });
        } else {
            setTitle("");
            setDescription("");
            setImage(null);
        }
    }

    const handleSubmit = async () => {
        if (!title || !description || !image?.id) {
            toast.error("Title, Description, and Image are required");
            return;
        }
        if (!currentUser?._id) {
            toast.error("User not authenticated");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                title,
                description,
                image: image.id,
                createdBy: currentUser._id,
                updatedBy: currentUser._id,
            };
            if (banner) {
                await bannerApi.adminUpdateBanner(banner._id, payload);
                toast.success("Banner updated successfully");
            } else {
                await bannerApi.adminCreateBanner(payload);
                toast.success("Banner created successfully");
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
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-gray-900 rounded-2xl p-6 z-50">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {banner ? "Edit Banner" : "Add New Banner"}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Title</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Description</label>
                        <textarea
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-white font-medium text-sm mb-1 block">Image</label>
                        <ImagePicker
                            label="Banner Image"
                            value={image}
                            onChange={(img) => setImage(img)}
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
                            {loading ? "Saving..." : banner ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}