"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { networkApi } from "@/apis";
import Image from 'next/image';
import {
    MessagesSquare,
    Search,
    Calendar,
    User as UserIcon,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Flag,
    CheckCircle2,
    MessageCircle,
    Heart
} from 'lucide-react';

interface Post {
    _id: string;
    title: string;
    description: string;
    image?: {
        _id: string;
        url: string;
    };
    isPinned: boolean;
    likeCount: number;
    commentCount: number;
    createdBy: {
        _id: string;
        username: string;
        name: string;
    };
    reportsCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface Report {
    _id: string;
    reporter: {
        _id: string;
        username: string;
        avatar?: string;
    };
    post: {
        _id: string;
        title: string;
        image?: {
            _id: string;
            url: string;
        };
        isPinned: boolean;
    };
    reason: string;
    isResolved: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ForumPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');

    const { data: postsData, isLoading: postsLoading, mutate: mutatePosts } = useSWR(
        activeTab === 'posts' ? ['network-posts', page, searchTerm] : null,
        () => networkApi.adminListNetworkPosts({ page, search: searchTerm })
    );

    const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
        activeTab === 'reports' ? ['network-reports', page, searchTerm] : null,
        () => networkApi.adminListNetworkReports({ page, search: searchTerm })
    );

    const posts = postsData?.data || [];
    const reports = reportsData?.data || [];
    const totalPages = postsData?.totalPages || 1;


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDeletePost = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await networkApi.adminDeleteNetworkPost(id);
                mutatePosts();
                mutateReports();
            } catch (error) {
                console.error('Failed to delete post:', error);
                alert('Failed to delete post');
            }
        }
    };

    const handleResolveReport = async (id: string, action: 'RESOLVE' | 'DISMISS') => {
        try {
            await networkApi.adminResolveNetworkReport(id, { action });
            mutateReports();
        } catch (error) {
            console.error('Failed to resolve report:', error);
            alert('Failed to resolve report');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Forum Management</h1>
                    <p className="text-gray-500 mt-1">Monitor posts and manage reports from the community</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={activeTab === 'posts' ? "Search posts..." : "Search reports..."}
                            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-white/10">
                <button
                    onClick={() => { setActiveTab('posts'); setSearchTerm(''); }}
                    className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'posts'
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                >
                    <MessagesSquare className="w-4 h-4" />
                    Posts
                </button>
                <button
                    onClick={() => { setActiveTab('reports'); setSearchTerm(''); }}
                    className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'reports'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                >
                    <Flag className="w-4 h-4" />
                    Reports
                    {reports.length > 0 && activeTab !== 'reports' && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {reports.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/2">
                                {activeTab === 'posts' ? (
                                    <>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Author & Content</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Engagement</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Reports</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Reporter & Reason</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Target</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTab === 'posts' ? (
                                postsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                <p className="text-gray-500 animate-pulse">Loading posts...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <MessagesSquare className="w-12 h-12 opacity-20" />
                                                <p className="italic">No posts found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post: Post) => (
                                        <tr key={post._id} className="hover:bg-white/2 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-4">
                                                    {post.image?.url && (
                                                        <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 flex items-center justify-center overflow-hidden border border-white/10 relative">
                                                            <Image src={post.image.url} alt={post.title} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-white truncate">
                                                                @{post.createdBy?.username || 'unknown'}
                                                            </p>
                                                            {post.isPinned && (
                                                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">PINNED</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-200 font-medium truncate mt-0.5">
                                                            {post.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                            {post.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <Heart className="w-4 h-4 text-pink-500/50" />
                                                        <span className="text-xs text-gray-400 font-medium">{post.likeCount}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <MessageCircle className="w-4 h-4 text-blue-500/50" />
                                                        <span className="text-xs text-gray-400 font-medium">{post.commentCount}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {(post.reportsCount ?? 0) > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {post.reportsCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-xs">
                                                        {formatDate(post.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-400">
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                reportsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                                                <p className="text-gray-500 animate-pulse">Loading reports...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <Flag className="w-12 h-12 opacity-20" />
                                                <p className="italic">No reports found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report: Report) => (
                                        <tr key={report._id} className="hover:bg-white/2 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {report.reporter?.avatar ? (
                                                        <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                            <Image src={report.reporter.avatar} alt={report.reporter.username || 'user'} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-semibold text-white">
                                                            @{report.reporter?.username || 'unknown'}
                                                        </p>
                                                        <p className="text-xs text-red-400/80 mt-1">
                                                            {report.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {report.post?.image?.url ? (
                                                        <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center overflow-hidden border border-white/10 relative">
                                                            <Image src={report.post.image.url} alt="Post" fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
                                                            <MessagesSquare className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-block w-fit mb-1 bg-blue-500/10 text-blue-400">
                                                            POST
                                                        </span>
                                                        <span className="text-xs text-gray-200 truncate max-w-[200px]">
                                                            {report.post?.title || 'Unknown post'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${!report.isResolved
                                                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${!report.isResolved ? 'bg-yellow-500' : 'bg-emerald-500'
                                                        }`} />
                                                    {!report.isResolved ? 'PENDING' : 'RESOLVED'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {formatDate(report.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-400">
                                                    {!report.isResolved && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResolveReport(report._id, 'RESOLVE')}
                                                                className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors"
                                                                title="Mark as Resolved"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { if (report.post?._id) handleDeletePost(report.post._id); }}
                                                                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                                                title="Delete Post"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {((activeTab === 'posts' && posts.length > 0) || (activeTab === 'reports' && reports.length > 0)) && (
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
        </div>
    );
}
