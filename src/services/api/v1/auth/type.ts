
export interface LoginParams {
    username?: string;
    password?: string;
}

export interface RegisterParams {
    username?: string;
    password?: string;
}

export interface Credit {
    available: number;
    total: number;
    usagePercentage: number;
    used: number;
}

export interface RegisterResult {
    activated_at: string;
    credit: Credit;
    creditLimit: number;
    deactivated_at: string;
    id: number;
    is_active: boolean;
    role: string;
    token: string;
    username: string;
}

export interface LoginResult {
    token?: string;
    username?: string;
    role?: string;
    id?: number;
    is_active?: boolean;
    credit?: Credit;
}