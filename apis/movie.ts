import { HttpRequest } from "@/utils/request";
import { siteUrl } from "@/config/site";

const appHttpRequest = new HttpRequest(null, `${siteUrl}/admin`);

export type MovieStatus = "draft" | "processing" | "ready" | "failed";

export interface AdminMovieImage {
    _id: string;
    url: string;
    blurHash?: string | null;
}

export interface AdminMovieVideo {
    duration: number;
    qualities: string[];
    thumbnailUrl?: string | null;
    originalName?: string | null;
    originalSize?: number | null;
}

export interface AdminMovie {
    _id: string;
    title: string;
    description?: string | null;
    image: AdminMovieImage | null;
    price: number;
    discountedPrice?: number | null;
    effectivePrice: number;
    releaseYear?: number | null;
    genres: string[];
    duration: number;
    thumbnailUrl?: string | null;
    qualities: string[];
    status: MovieStatus;
    failureReason?: string | null;
    isActive: boolean;
    sortOrder: number;
    video: AdminMovieVideo | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminMovieBundle {
    _id: string;
    kind: "all" | "custom";
    title: string;
    description?: string | null;
    image: AdminMovieImage | null;
    movies: AdminMovie[];
    movieIds: string[];
    movieCount: number;
    price: number;
    discountedPrice?: number | null;
    effectivePrice: number;
    isActive: boolean;
    sortOrder: number;
    owned?: boolean;
    totalMovies?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminMovieListParams extends Record<string, unknown> {
    page?: number;
    limit?: number;
    search?: string;
    status?: MovieStatus | "";
    isActive?: boolean | "";
}

export interface AdminMovieBundleListParams extends Record<string, unknown> {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean | "";
}

export interface AdminMoviePayload {
    title: string;
    description?: string | null;
    image?: string | null;
    price: number;
    discountedPrice?: number | null;
    releaseYear?: number | null;
    genres?: string[];
    isActive?: boolean;
    sortOrder?: number;
}

export interface AdminMovieBundlePayload {
    title: string;
    description?: string | null;
    image?: string | null;
    movieIds: string[];
    price: number;
    discountedPrice?: number | null;
    isActive?: boolean;
    sortOrder?: number;
}

export const adminListMovies = async (params?: AdminMovieListParams) => {
    const res = await appHttpRequest.get("/movies", params);
    return res as {
        data: AdminMovie[];
        total: number;
        page: number;
        totalPages: number;
    };
};

export const adminGetMovieDetail = async (id: string) => {
    const res = await appHttpRequest.get("/movies/" + id);
    return res as { data: AdminMovie };
};

export const adminCreateMovie = async (data: AdminMoviePayload) => {
    const res = await appHttpRequest.post("/movies", data);
    return res;
};

export const adminUpdateMovie = async (id: string, data: Partial<AdminMoviePayload>) => {
    const res = await appHttpRequest.put("/movies/" + id, data);
    return res;
};

export const adminDeleteMovie = async (id: string) => {
    const res = await appHttpRequest.del("/movies/" + id);
    return res;
};

export const adminGetBundle = async () => {
    const res = await appHttpRequest.get("/movies/bundle");
    return res;
};

export const adminUpsertBundle = async (data: Record<string, unknown>) => {
    const res = await appHttpRequest.put("/movies/bundle", data);
    return res;
};

export const adminListMovieBundles = async (params?: AdminMovieBundleListParams) => {
    const res = await appHttpRequest.get("/movies/bundles", params);
    return res as {
        data: AdminMovieBundle[];
        total: number;
        page: number;
        totalPages: number;
    };
};

export const adminCreateMovieBundle = async (data: AdminMovieBundlePayload) => {
    const res = await appHttpRequest.post("/movies/bundles", data);
    return res;
};

export const adminUpdateMovieBundle = async (id: string, data: Partial<AdminMovieBundlePayload>) => {
    const res = await appHttpRequest.put("/movies/bundles/" + id, data);
    return res;
};

export const adminDeleteMovieBundle = async (id: string) => {
    const res = await appHttpRequest.del("/movies/bundles/" + id);
    return res;
};

export const adminListMoviePurchases = async (params?: Record<string, unknown>) => {
    const res = await appHttpRequest.get("/movies/purchases", params);
    return res;
};

export const adminGrantMoviePurchase = async (data: Record<string, unknown>) => {
    const res = await appHttpRequest.post("/movies/purchases/grant", data);
    return res;
};

export const adminUploadMovieVideo = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await appHttpRequest.post("/movies/" + id + "/video", formData);
    return res;
};
