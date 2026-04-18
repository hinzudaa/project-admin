import { HttpRequest } from "@/utils/request";
import { siteUrl } from "@/config/site";

const appHttpRequest = new HttpRequest(null, `${siteUrl}/admin`);

export interface GameZone {
    _id: string;
    image?: {
        _id: string;
        url: string;
        blurHash?: string;
    };
    title: string;
    description?: string;
    type: string;
    level: string;
    responseMode: string;
    systemPrompt: string;
    userPromptTemplate: string;
    model: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface GameZoneListResponse {
    data: GameZone[];
    total: number;
    page: number;
    totalPages: number;
}

export const gameZoneApi = {
    listGameZones: async (params: { page?: number; limit?: number; search?: string; isActive?: boolean; type?: string; level?: string }) => {
        const response = await appHttpRequest.get('/game-zones', params);
        return response;
    },
    getGameZoneDetail: async (id: string) => {
        const response = await appHttpRequest.get(`/game-zones/${id}`);
        return response;
    },
    createGameZone: async (payload: Partial<GameZone> & { imageId?: string; model?: string }) => {
        const response = await appHttpRequest.post('/game-zones', payload);
        return response;
    },
    updateGameZone: async (id: string, payload: Partial<GameZone> & { imageId?: string; model?: string }) => {
        const response = await appHttpRequest.put(`/game-zones/${id}`, payload);
        return response;
    },
    deleteGameZone: async (id: string) => {
        const response = await appHttpRequest.del(`/game-zones/${id}`);
        return response;
    },
};
