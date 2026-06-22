import { HttpRequest } from "@/utils/request";
import { siteUrl } from "@/config/site";

const appHttpRequest = new HttpRequest(null, `${siteUrl}`);

export interface FinanceEntry {
    _id: string;
    type: string;
    amount: number;
    note: string;
    source: "membership" | "manual";
    membership?: {
        orderId?: string;
        planTitle?: string;
        price?: number;
        source?: string;
        status?: string;
    };
    user?: {
        _id: string;
        username: string;
        name: string;
    };
    createdBy?: {
        _id: string;
        username: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface FinanceSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    expensesByType: Record<string, { label: string; total: number }>;
}

export interface FinanceListResponse {
    data: FinanceEntry[];
    total: number;
    page: number;
    totalPages: number;
}

export interface FinanceListParams {
    page?: number;
    limit?: number;
    type?: string;
    source?: string;
    from?: string;
    to?: string;
}

export interface FinanceSummaryParams {
    from?: string;
    to?: string;
}

export const getList = (params: FinanceListParams): Promise<FinanceListResponse> => {
    return appHttpRequest.get("/admin/finance/entries", params as Record<string, unknown>);
};

export const getSummary = (params: FinanceSummaryParams): Promise<FinanceSummary> => {
    return appHttpRequest.get("/admin/finance/summary", params as Record<string, unknown>);
};

export const create = (data: { type: string; amount: number; note: string }): Promise<{ data: FinanceEntry }> => {
    return appHttpRequest.post("/admin/finance/entries", data);
};

export const financeApi = {
    getList,
    getSummary,
    create,
};
