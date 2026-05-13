"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { movieApi } from '@/apis';
import toast from 'react-hot-toast';
import {
    Film,
    Search,
    Loader2,
    Trash2,
    Plus,
    Edit2,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
} from 'lucide-react';
import MovieModal from '@/components/admin/MovieModal';

type Movie = {
    _id: string;
    title: string;
    description?: string;
    image?: { url: string };
    price?: number;
    discountedPrice?: number;
    releaseYear?: number;
    genres?: string[];
    isActive?: boolean;
    sortOrder?: number;
    isPremium?: boolean;
    status?: "draft" | "processing" | "ready" | "failed";
    createdAt?: string;
};

export default function MoviesPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

    const { data, isLoading, mutate } = useSWR(
        ['movies', page, searchTerm],
        () => movieApi.adminListMovies({ page, search: searchTerm })
    );

    const movies: Movie[] = data?.movies || data?.data || [];
    const totalPages = data?.totalPages || 1;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this movie?')) return;
        try {
            await movieApi.adminDeleteMovie(id);
            toast.success('Movie deleted');
            mutate();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete';
            toast.error(message);
        }
    };

    const handleEdit = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedMovie(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Movies</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage movies and video content</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Movie</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Movie</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-gray-500 animate-pulse">Loading movies...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : movies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Film className="w-12 h-12 opacity-20" />
                                            <p className="italic">No movies found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                movies.map((movie) => (
                                    <tr key={movie._id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden shrink-0">
                                                    {movie.image?.url ? (
                                                        <img src={movie.image.url} alt={movie.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Film className="w-5 h-5 text-blue-500 opacity-40" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                        {movie.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[240px]">{movie.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-300">
                                                <ShoppingCart className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-sm font-medium">
                                                    {movie.price != null ? `₮${movie.price.toLocaleString()}` : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${movie.isActive
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {movie.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${movie.status === 'ready' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        movie.status === 'processing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                            movie.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {movie.status || 'Draft'}
                                                </span>
                                                {movie.isPremium && (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                        Premium
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">
                                                {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(movie)}
                                                    className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie._id)}
                                                    className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                                                    title="Delete"
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

                {!isLoading && movies.length > 0 && (
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

            <MovieModal
                key={selectedMovie?._id || (isModalOpen ? 'new' : 'closed')}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                movie={selectedMovie}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
