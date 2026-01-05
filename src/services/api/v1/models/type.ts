export interface AIModelItem {
    id?: number;
    name?: string;
    description?: string;
    status?: 'open' | 'closed' | 'draft';
    url?: string;
    parameters?: Record<string, any>; // JSON
    created_at?: string;
    updated_at?: string;
}

export interface AIModelListParams {
    page?: number;
    limit?: number;
    name?: string;
    status?: string;
}

export interface CreateModelParams {
    name: string;
    status: 'open' | 'closed' | 'draft';
    url?: string;
    description?: string;
    parameters?: Record<string, any>;
}

export interface UpdateModelParams {
    name?: string;
    description?: string;
    status?: 'open' | 'closed' | 'draft';
    url?: string;
    parameters?: Record<string, any>;
}

export interface UpdateStatusParams {
    status: 'open' | 'closed' | 'draft';
}