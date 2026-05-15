import { HttpRequest } from "@/utils/request";
import { siteUrl } from "@/config/site";

const appHttpRequest = new HttpRequest(null, `${siteUrl}/admin`);

export const adminListMovies = async (params?: Record<string, unknown>) => {
    const res = await appHttpRequest.get("/movies", params);
    return res;
};

export const adminGetMovieDetail = async (id: string) => {
    const res = await appHttpRequest.get("/movies/" + id);
    return res;
};

export const adminCreateMovie = async (data: Record<string, unknown>) => {
    const res = await appHttpRequest.post("/movies", data);
    return res;
};

export const adminUpdateMovie = async (id: string, data: Record<string, unknown>) => {
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
    formData.append("video", file);
    const res = await appHttpRequest.post("/movies/" + id + "/video", formData);
    return res;
};
