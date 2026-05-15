"use client";

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { movieApi, userApi } from '@/apis';
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
    AlertCircle
} from 'lucide-react';
import MovieModal from '@/components/admin/MovieModal';
import { ImagePicker } from "@/components/form/image-picker";

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
    status?: "draft" | "processing" | "ready" | "failed";
    video?: {
        masterUrl: string;
        qualities: string[];
        duration: number;
        originalName?: string;
    } | null;
    failureReason?: string | null;
    createdAt?: string;
};

type Purchase = {
    _id: string;
    user?: {
        username: string;
        name?: string;
    };
    kind: 'single' | 'bundle';
    movieTitle?: string;
    price: number;
    source: string;
    status: string;
    createdAt: string;
};

type User = {
    _id: string;
    username: string;
    name?: string;
};

export default function MoviesPage() {
    const [activeTab, setActiveTab] = useState<'movies' | 'bundle' | 'purchases'>('movies');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

    const { data, isLoading, mutate } = useSWR(
        ['movies', page, searchTerm, activeTab],
        () => activeTab === 'movies' ? movieApi.adminListMovies({ page, search: searchTerm }) : null
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
                    <h1 className="text-3xl font-bold text-white">Movie Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage movies, bundles, and customer purchases</p>
                </div>

                {activeTab === 'movies' && (
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
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
                <button
                    onClick={() => setActiveTab('movies')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'movies' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Movies
                </button>
                <button
                    onClick={() => setActiveTab('bundle')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'bundle' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Bundle Settings
                </button>
                <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'purchases' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Purchases
                </button>
            </div>

            {activeTab === 'movies' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/2">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Movie</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</th>
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
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">₮{movie.price?.toLocaleString()}</span>
                                                    {movie.discountedPrice && (
                                                        <span className="text-xs text-gray-500 line-through">₮{movie.discountedPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${movie.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {movie.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${movie.status === 'ready' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : movie.status === 'processing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : movie.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                        {movie.status || 'Draft'}
                                                    </span>
                                                </div>
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
            )}

            {activeTab === 'bundle' && (
                <BundleSettings />
            )}

            {activeTab === 'purchases' && (
                <MoviePurchases />
            )}

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

function BundleSettings() {
    const { data, isLoading, mutate } = useSWR('movie-bundle', () => movieApi.adminGetBundle());
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [image, setImage] = useState<{ id?: string, url?: string } | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (data?.data && !initialized.current) {
            const bundle = data.data;
            setTitle(bundle.title || '');
            setDescription(bundle.description || '');
            setPrice(bundle.price != null ? String(bundle.price) : '');
            setDiscountedPrice(bundle.discountedPrice != null ? String(bundle.discountedPrice) : '');
            setIsActive(bundle.isActive ?? true);
            setImage(bundle.image ? { id: bundle.image._id, url: bundle.image.url } : null);
            initialized.current = true;
        }
    }, [data]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await movieApi.adminUpsertBundle({
                title,
                description,
                price: Number(price),
                discountedPrice: discountedPrice ? Number(discountedPrice) : null,
                isActive,
                image: image?.id
            });
            toast.success('Bundle updated');
            mutate();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update bundle';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

    return (
        <div className="max-w-4xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">Bundle Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Bundle Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Discount Price</label>
                            <input
                                type="number"
                                value={discountedPrice}
                                onChange={e => setDiscountedPrice(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Bundle Image</label>
                        <ImagePicker label="Bundle Image" value={image} onChange={setImage} />
                    </div>
                    <div className="flex items-center gap-3">
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
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

function MoviePurchases() {
    const [page, setPage] = useState(1);
    const { data, isLoading, mutate } = useSWR(['movie-purchases', page], () => movieApi.adminListMoviePurchases({ page }));
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

    const items: Purchase[] = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsGrantModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Grant Access</span>
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500">No purchases found</td></tr>
                            ) : (
                                items.map((p) => (
                                    <tr key={p._id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{p.user?.name || p.user?.username || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{p.user?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{p.kind === 'bundle' ? 'All Movies Bundle' : (p.movieTitle || 'Single Movie')}</span>
                                                <span className="text-[10px] uppercase text-blue-400 font-bold">{p.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white font-bold text-sm">
                                            ₮{p.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${p.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : p.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && items.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>

            {isGrantModalOpen && (
                <GrantAccessModal
                    onClose={() => setIsGrantModalOpen(false)}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
}

function GrantAccessModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [movieId, setMovieId] = useState('');
    const [kind, setKind] = useState<'single' | 'bundle'>('single');
    const [isComplimentary, setIsComplimentary] = useState(true);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch users based on search
    const { data: usersData } = useSWR(
        userSearch.length >= 2 ? ['user-search', userSearch] : null,
        () => userApi.getUsers({ page: 1, search: userSearch })
    );

    // Fetch movies for selection
    const { data: moviesData } = useSWR('movies-list-grant', () => movieApi.adminListMovies({ limit: 100 }));
    const moviesList: Movie[] = moviesData?.data || [];

    const handleSubmit = async () => {
        if (!selectedUser?._id) return toast.error('Please select a user');
        if (kind === 'single' && !movieId) return toast.error('Please select a movie');

        setLoading(true);
        try {
            await movieApi.adminGrantMoviePurchase({
                userId: selectedUser._id,
                movieId: kind === 'single' ? movieId : undefined,
                kind,
                isComplimentary,
                note
            });
            toast.success('Access granted successfully');
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to grant access';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-8 z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold text-white mb-6">Grant Access</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Search User</label>
                        {selectedUser ? (
                            <div className="flex items-center justify-between p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {selectedUser.name?.[0] || selectedUser.username?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold">{selectedUser.name || selectedUser.username}</p>
                                        <p className="text-xs text-blue-400">@{selectedUser.username}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white"><AlertCircle className="w-4 h-4 rotate-45" /></button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Username or Name..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                                {usersData?.data && userSearch.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl max-h-48 overflow-y-auto">
                                        {usersData.data.map((u: User) => (
                                            <button
                                                key={u._id}
                                                onClick={() => { setSelectedUser(u); setUserSearch(''); }}
                                                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">{u.name?.[0] || u.username?.[0]}</div>
                                                <div>
                                                    <p className="text-white text-sm font-bold">{u.name || u.username}</p>
                                                    <p className="text-xs text-gray-500">@{u.username}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {usersData.data.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No users found</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setKind('single')}
                            className={`flex-1 py-3 rounded-xl border transition-all font-bold ${kind === 'single' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'border-white/10 text-gray-400'}`}
                        >
                            Single Movie
                        </button>
                        <button
                            onClick={() => setKind('bundle')}
                            className={`flex-1 py-3 rounded-xl border transition-all font-bold ${kind === 'bundle' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'border-white/10 text-gray-400'}`}
                        >
                            Bundle
                        </button>
                    </div>

                    {kind === 'single' && (
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Select Movie</label>
                            <select
                                value={movieId}
                                onChange={e => setMovieId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Select a movie...</option>
                                {moviesList.map((m) => (
                                    <option key={m._id} value={m._id} className="bg-gray-900">{m.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-sm text-gray-300 font-medium">Free Access (Complimentary)</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isComplimentary}
                                onChange={(e) => setIsComplimentary(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${isComplimentary ? 'bg-indigo-500' : 'bg-gray-700'}`} />
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isComplimentary ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1.5 block">Internal Note</label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Reason for granting access..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedUser}
                            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? 'Processing...' : 'Grant Access'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
