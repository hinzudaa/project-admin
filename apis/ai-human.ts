import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const appHttpRequest = new HttpRequest(null, siteUrl);

export interface AIHumanListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface AIHuman {
  _id: string;
  image?: {
    _id: string;
    id?: string;
    url: string;
    blurHash?: string;
  };
  name: string;
  age?: number;
  gender: "male" | "female" | "other";
  shortBio: string;
  prompt: string;
  greeting?: string;
  model: string;
  isActive: boolean;
  sortOrder: number;
  badge?: string[];
  createdAt: string;
  updatedAt: string;
}

export const listAIHumans = async (query: AIHumanListQuery) => {
  const res = await appHttpRequest.get("/admin/ai-humans", query);
  return res as {
    data: AIHuman[];
    total: number;
    page: number;
    totalPages: number;
  };
};

export const getAIHuman = async (id: string) => {
  const res = await appHttpRequest.get(`/admin/ai-humans/${id}`);
  return res as { data: AIHuman };
};

export const createAIHuman = async (data: Record<string, unknown>) => {
  const res = await appHttpRequest.post("/admin/ai-humans", data);
  return res;
};

export const updateAIHuman = async (id: string, data: Record<string, unknown>) => {
  const res = await appHttpRequest.put(`/admin/ai-humans/${id}`, data);
  return res;
};

export const deleteAIHuman = async (id: string) => {
  const res = await appHttpRequest.del(`/admin/ai-humans/${id}`);
  return res;
};
