"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Film,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { movieApi } from "@/apis";
import type {
  AdminMovie,
  AdminMovieBundle,
  AdminMovieBundlePayload,
  AdminMovieListParams,
  AdminMoviePayload,
  MovieStatus,
} from "@/apis/movie";
import { ImagePicker } from "@/components/form/image-picker";

type MovieFormState = {
  title: string;
  description: string;
  image: { id?: string; url?: string } | null;
  price: string;
  discountedPrice: string;
  releaseYear: string;
  genres: string;
  isActive: boolean;
  sortOrder: string;
};

type BundleFormState = {
  title: string;
  description: string;
  image: { id?: string; url?: string } | null;
  movieIds: string[];
  price: string;
  discountedPrice: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: MovieFormState = {
  title: "",
  description: "",
  image: null,
  price: "",
  discountedPrice: "",
  releaseYear: "",
  genres: "",
  isActive: true,
  sortOrder: "0",
};

const emptyBundleForm: BundleFormState = {
  title: "",
  description: "",
  image: null,
  movieIds: [],
  price: "",
  discountedPrice: "",
  isActive: true,
  sortOrder: "0",
};

const statusStyles: Record<MovieStatus, string> = {
  draft: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

function extractErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("mn-MN").format(value || 0);
}

function formatDuration(seconds: number) {
  if (!seconds) return "No video";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function toNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a valid non-negative number`);
  }
  return Math.round(parsed);
}

function buildPayload(form: MovieFormState): AdminMoviePayload {
  const title = form.title.trim();
  if (!title) throw new Error("Title is required");

  const price = toNumber(form.price, "Price");
  const discountedPrice = form.discountedPrice.trim()
    ? toNumber(form.discountedPrice, "Discounted price")
    : null;
  if (discountedPrice !== null && discountedPrice > price) {
    throw new Error("Discounted price cannot be greater than price");
  }

  const releaseYear = form.releaseYear.trim()
    ? toNumber(form.releaseYear, "Release year")
    : null;
  if (releaseYear !== null && (releaseYear < 1900 || releaseYear > 2999)) {
    throw new Error("Release year must be between 1900 and 2999");
  }

  return {
    title,
    description: form.description.trim() || null,
    image: form.image?.id || null,
    price,
    discountedPrice,
    releaseYear,
    genres: form.genres
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean),
    isActive: form.isActive,
    sortOrder: form.sortOrder.trim()
      ? toNumber(form.sortOrder, "Sort order")
      : 0,
  };
}

function buildBundlePayload(
  form: BundleFormState,
  selectableMovies: AdminMovie[]
): AdminMovieBundlePayload {
  const title = form.title.trim();
  if (!title) throw new Error("Bundle title is required");

  const movieIds = [...new Set(form.movieIds)];
  if (movieIds.length < 2) {
    throw new Error("Select at least 2 movies for a bundle");
  }

  const selectedMovies = selectableMovies.filter((movie) =>
    movieIds.includes(movie._id)
  );
  if (selectedMovies.length !== movieIds.length) {
    throw new Error("Selected movie list is incomplete. Refresh and try again.");
  }

  const price = toNumber(form.price, "Bundle price");
  const discountedPrice = form.discountedPrice.trim()
    ? toNumber(form.discountedPrice, "Bundle discounted price")
    : null;
  if (discountedPrice !== null && discountedPrice > price) {
    throw new Error("Discounted price cannot be greater than price");
  }

  const selectedTotal = selectedMovies.reduce(
    (sum, movie) => sum + movie.effectivePrice,
    0
  );
  const effectivePrice =
    discountedPrice !== null && discountedPrice < price
      ? discountedPrice
      : price;
  if (effectivePrice <= 0) {
    throw new Error("Bundle price must be greater than 0");
  }
  if (effectivePrice >= selectedTotal) {
    throw new Error("Bundle price must be cheaper than selected movies total");
  }

  return {
    title,
    description: form.description.trim() || null,
    image: form.image?.id || null,
    movieIds,
    price,
    discountedPrice,
    isActive: form.isActive,
    sortOrder: form.sortOrder.trim()
      ? toNumber(form.sortOrder, "Sort order")
      : 0,
  };
}

function movieToForm(movie: AdminMovie): MovieFormState {
  return {
    title: movie.title,
    description: movie.description || "",
    image: movie.image
      ? { id: movie.image._id, url: movie.image.url }
      : null,
    price: String(movie.price ?? 0),
    discountedPrice:
      movie.discountedPrice === null || movie.discountedPrice === undefined
        ? ""
        : String(movie.discountedPrice),
    releaseYear:
      movie.releaseYear === null || movie.releaseYear === undefined
        ? ""
        : String(movie.releaseYear),
    genres: movie.genres.join(", "),
    isActive: movie.isActive,
    sortOrder: String(movie.sortOrder ?? 0),
  };
}

function bundleToForm(bundle: AdminMovieBundle): BundleFormState {
  return {
    title: bundle.title,
    description: bundle.description || "",
    image: bundle.image
      ? { id: bundle.image._id, url: bundle.image.url }
      : null,
    movieIds: bundle.movieIds ?? bundle.movies.map((movie) => movie._id),
    price: String(bundle.price ?? 0),
    discountedPrice:
      bundle.discountedPrice === null || bundle.discountedPrice === undefined
        ? ""
        : String(bundle.discountedPrice),
    isActive: bundle.isActive,
    sortOrder: String(bundle.sortOrder ?? 0),
  };
}

function MovieModal({
  isOpen,
  movie,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  movie: AdminMovie | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!isOpen) return null;

  return (
    <MovieModalContent
      key={movie?._id ?? "new"}
      movie={movie}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function MovieModalContent({
  movie,
  onClose,
  onSaved,
}: {
  movie: AdminMovie | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<MovieFormState>(() =>
    movie ? movieToForm(movie) : emptyForm
  );
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof MovieFormState>(
    key: K,
    value: MovieFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    let payload: AdminMoviePayload;
    try {
      payload = buildPayload(form);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Invalid form data"));
      return;
    }

    setSaving(true);
    try {
      if (movie) {
        await movieApi.adminUpdateMovie(movie._id, payload);
        toast.success("Movie updated");
      } else {
        await movieApi.adminCreateMovie(payload);
        toast.success("Movie created");
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to save movie"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close movie form"
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111116] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {movie ? "Edit Movie" : "Add Movie"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create the movie first, then upload the video file from the list.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-300">Title</span>
            <input
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Movie title"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-300">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setField("description", event.target.value)
              }
              rows={4}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Short description"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-300">
              Price (MNT)
            </span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="0"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-300">
              Discounted price
            </span>
            <input
              type="number"
              min="0"
              value={form.discountedPrice}
              onChange={(event) =>
                setField("discountedPrice", event.target.value)
              }
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Optional"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-300">
              Release year
            </span>
            <input
              type="number"
              min="1900"
              max="2999"
              value={form.releaseYear}
              onChange={(event) =>
                setField("releaseYear", event.target.value)
              }
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="2026"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-300">
              Sort order
            </span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => setField("sortOrder", event.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="0"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-300">
              Genres
            </span>
            <input
              value={form.genres}
              onChange={(event) => setField("genres", event.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Drama, Action, Comedy"
            />
          </label>

          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <ImagePicker
              label="Cover image"
              value={form.image}
              onChange={(image) => setField("image", image)}
            />
          </div>

          <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setField("isActive", event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-300">
              Active in user app
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {movie ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BundleModal({
  isOpen,
  bundle,
  movies,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  bundle: AdminMovieBundle | null;
  movies: AdminMovie[];
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!isOpen) return null;

  return (
    <BundleModalContent
      key={bundle?._id ?? "new-bundle"}
      bundle={bundle}
      movies={movies}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function BundleModalContent({
  bundle,
  movies,
  onClose,
  onSaved,
}: {
  bundle: AdminMovieBundle | null;
  movies: AdminMovie[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const selectableMovies = useMemo(() => {
    const map = new Map<string, AdminMovie>();
    movies.forEach((movie) => map.set(movie._id, movie));
    bundle?.movies.forEach((movie) => map.set(movie._id, movie));
    return Array.from(map.values());
  }, [bundle?.movies, movies]);

  const [form, setForm] = useState<BundleFormState>(() =>
    bundle ? bundleToForm(bundle) : emptyBundleForm
  );
  const [saving, setSaving] = useState(false);

  const selectedMovies = selectableMovies.filter((movie) =>
    form.movieIds.includes(movie._id)
  );
  const selectedTotal = selectedMovies.reduce(
    (sum, movie) => sum + movie.effectivePrice,
    0
  );
  const bundlePrice = Number(form.discountedPrice || form.price || 0);
  const savings = Math.max(0, selectedTotal - bundlePrice);

  const setField = <K extends keyof BundleFormState>(
    key: K,
    value: BundleFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleMovie = (id: string) => {
    setForm((current) => ({
      ...current,
      movieIds: current.movieIds.includes(id)
        ? current.movieIds.filter((movieId) => movieId !== id)
        : [...current.movieIds, id],
    }));
  };

  const handleSubmit = async () => {
    let payload: AdminMovieBundlePayload;
    try {
      payload = buildBundlePayload(form, selectableMovies);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Invalid bundle data"));
      return;
    }

    setSaving(true);
    try {
      if (bundle) {
        await movieApi.adminUpdateMovieBundle(bundle._id, payload);
        toast.success("Bundle updated");
      } else {
        await movieApi.adminCreateMovieBundle(payload);
        toast.success("Bundle created");
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to save bundle"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close bundle form"
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111116] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {bundle ? "Edit Bundle" : "Add Bundle"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select ready movies and set a discounted bundle price.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-4">
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-gray-300">Title</span>
              <input
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Weekend bundle"
              />
            </label>

            <label className="space-y-1 block">
              <span className="text-sm font-medium text-gray-300">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Short bundle description"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-300">
                  Price
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-300">
                  Discount
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.discountedPrice}
                  onChange={(event) =>
                    setField("discountedPrice", event.target.value)
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Optional"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-300">
                  Sort
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <ImagePicker
                label="Bundle cover"
                value={form.image}
                onChange={(image) => setField("image", image)}
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setField("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-300">
                Active in user app
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">Movies</p>
                  <p className="text-xs text-gray-500">
                    {form.movieIds.length} selected
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-400">
                    Total: {formatPrice(selectedTotal)} MNT
                  </p>
                  <p className="text-emerald-400">
                    Save: {formatPrice(savings)} MNT
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-white/5">
              {selectableMovies.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No ready active movies available
                </div>
              ) : (
                selectableMovies.map((movie) => {
                  const checked = form.movieIds.includes(movie._id);
                  return (
                    <label
                      key={movie._id}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMovie(movie._id)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {movie.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(movie.effectivePrice)} MNT
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full border ${
                          movie.status === "ready" && movie.isActive
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                            : "text-red-400 border-red-500/20 bg-red-500/10"
                        }`}
                      >
                        {movie.status}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {bundle ? "Update Bundle" : "Create Bundle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoUploadButton({
  movie,
  disabled,
  uploading,
  onUpload,
}: {
  movie: AdminMovie;
  disabled: boolean;
  uploading: boolean;
  onUpload: (movie: AdminMovie, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onUpload(movie, file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        title="Upload video"
      >
        {uploading ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin" />
        ) : (
          <Upload className="w-4.5 h-4.5" />
        )}
      </button>
    </>
  );
}

export default function MoviesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<MovieStatus | "">("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [selectedMovie, setSelectedMovie] = useState<AdminMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<AdminMovieBundle | null>(
    null
  );
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const listParams = useMemo<AdminMovieListParams>(
    () => ({
      page,
      limit: 12,
      search: searchTerm,
      status,
      isActive:
        activeFilter === "all" ? "" : activeFilter === "active",
    }),
    [activeFilter, page, searchTerm, status]
  );

  const { data, isLoading, mutate } = useSWR(
    ["admin-movies", listParams],
    () => movieApi.adminListMovies(listParams),
    {
      refreshInterval: (latestData) =>
        latestData?.data?.some((movie) => movie.status === "processing")
          ? 5000
          : 0,
    }
  );

  const { data: bundleData, mutate: mutateBundles } = useSWR(
    ["admin-movie-bundles"],
    () => movieApi.adminListMovieBundles({ page: 1, limit: 50 })
  );

  const { data: selectableMovieData } = useSWR(
    ["admin-movies-ready-options"],
    () =>
      movieApi.adminListMovies({
        page: 1,
        limit: 100,
        status: "ready",
        isActive: true,
      })
  );

  const movies = data?.data || [];
  const bundles = bundleData?.data || [];
  const selectableMovies = selectableMovieData?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setSelectedMovie(null);
    setIsModalOpen(true);
  };

  const openEdit = (movie: AdminMovie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const openCreateBundle = () => {
    setSelectedBundle(null);
    setIsBundleModalOpen(true);
  };

  const openEditBundle = (bundle: AdminMovieBundle) => {
    setSelectedBundle(bundle);
    setIsBundleModalOpen(true);
  };

  const handleDelete = async (movie: AdminMovie) => {
    if (!window.confirm(`Delete "${movie.title}"?`)) return;
    try {
      await movieApi.adminDeleteMovie(movie._id);
      toast.success("Movie deleted");
      mutate();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to delete movie"));
    }
  };

  const handleDeleteBundle = async (bundle: AdminMovieBundle) => {
    if (!window.confirm(`Delete "${bundle.title}" bundle?`)) return;
    try {
      await movieApi.adminDeleteMovieBundle(bundle._id);
      toast.success("Bundle deleted");
      mutateBundles();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to delete bundle"));
    }
  };

  const toggleActive = async (movie: AdminMovie) => {
    try {
      await movieApi.adminUpdateMovie(movie._id, {
        isActive: !movie.isActive,
      });
      toast.success(movie.isActive ? "Movie deactivated" : "Movie activated");
      mutate();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to update status"));
    }
  };

  const toggleBundleActive = async (bundle: AdminMovieBundle) => {
    try {
      await movieApi.adminUpdateMovieBundle(bundle._id, {
        isActive: !bundle.isActive,
      });
      toast.success(bundle.isActive ? "Bundle deactivated" : "Bundle activated");
      mutateBundles();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to update bundle"));
    }
  };

  const handleVideoUpload = async (movie: AdminMovie, file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    setUploadingId(movie._id);
    try {
      await movieApi.adminUploadMovieVideo(movie._id, file);
      toast.success("Video uploaded. Processing started.");
      mutate();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to upload video"));
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Movies</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage movies, pricing, cover images, and video uploads.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={openCreateBundle}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(147,51,234,0.25)] active:scale-95 whitespace-nowrap"
            >
              <Package className="w-5 h-5" />
              <span>Add Bundle</span>
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Movie</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3">
          <div className="relative group overflow-hidden">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as MovieStatus | "");
              setPage(1);
            }}
            className="rounded-2xl bg-[#111116] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as typeof activeFilter);
              setPage(1);
            }}
            className="rounded-2xl bg-[#111116] border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All visibility</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Movie Bundles</h2>
              <p className="text-xs text-gray-500">
                Group multiple ready movies and sell them at a lower price.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateBundle}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {bundles.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No custom bundles yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Bundle
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Movies
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bundles.map((bundle) => {
                  const movieTotal = bundle.movies.reduce(
                    (sum, movie) => sum + movie.effectivePrice,
                    0
                  );
                  const savings = Math.max(0, movieTotal - bundle.effectivePrice);

                  return (
                    <tr key={bundle._id} className="hover:bg-white/2">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 overflow-hidden shrink-0 relative">
                            {bundle.image?.url ? (
                              <Image
                                src={bundle.image.url}
                                alt={bundle.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <Package className="w-5 h-5 opacity-50" />
                            )}
                          </div>
                          <div className="min-w-[220px]">
                            <p className="font-bold text-white">
                              {bundle.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-sm">
                              {bundle.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-200">
                          {bundle.movieCount} movies
                        </p>
                        <p className="text-xs text-gray-500 max-w-[260px] truncate">
                          {bundle.movies.map((movie) => movie.title).join(", ")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">
                            {formatPrice(bundle.effectivePrice)} MNT
                          </span>
                          {bundle.discountedPrice != null &&
                            bundle.discountedPrice < bundle.price && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(bundle.price)} MNT
                              </span>
                            )}
                          <span className="text-xs text-emerald-400">
                            Save {formatPrice(savings)} MNT
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleBundleActive(bundle)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                            bundle.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {bundle.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditBundle(bundle)}
                            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit bundle"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBundle(bundle)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                            title="Delete bundle"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-gray-500 animate-pulse">
                        Loading movies...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Film className="w-12 h-12 opacity-20" />
                      <p className="italic">No movies found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                movies.map((movie) => {
                  const imageUrl =
                    movie.thumbnailUrl || movie.image?.url || undefined;

                  return (
                    <tr
                      key={movie._id}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 overflow-hidden shrink-0 relative">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={movie.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 opacity-30" />
                            )}
                          </div>
                          <div className="min-w-[220px]">
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                              {movie.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 max-w-sm">
                              {movie.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {movie.releaseYear && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                                  {movie.releaseYear}
                                </span>
                              )}
                              {movie.genres.slice(0, 3).map((genre) => (
                                <span
                                  key={genre}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">
                            {formatPrice(movie.effectivePrice)} MNT
                          </span>
                          {movie.discountedPrice != null &&
                            movie.discountedPrice < movie.price && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(movie.price)} MNT
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="text-gray-300">
                            {formatDuration(movie.duration)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {movie.qualities.length
                              ? movie.qualities.join(", ")
                              : movie.video?.originalName || "Upload required"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusStyles[movie.status]}`}
                          >
                            {movie.status}
                          </span>
                          {movie.failureReason && (
                            <span className="text-xs text-red-300 max-w-[220px]">
                              {movie.failureReason}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleActive(movie)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                              movie.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {movie.isActive ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Calendar className="w-4 h-4" />
                          {new Date(movie.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <VideoUploadButton
                            movie={movie}
                            disabled={
                              uploadingId !== null ||
                              movie.status === "processing"
                            }
                            uploading={uploadingId === movie._id}
                            onUpload={handleVideoUpload}
                          />
                          <button
                            type="button"
                            onClick={() => openEdit(movie)}
                            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(movie)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && movies.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/1">
            <p className="text-sm text-gray-500">
              Page <span className="text-white font-medium">{page}</span> of{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
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
        isOpen={isModalOpen}
        movie={selectedMovie}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => mutate()}
      />
      <BundleModal
        isOpen={isBundleModalOpen}
        bundle={selectedBundle}
        movies={selectableMovies}
        onClose={() => setIsBundleModalOpen(false)}
        onSaved={() => mutateBundles()}
      />
    </div>
  );
}
