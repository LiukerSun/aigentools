
export interface LoginParams {
    username?: string;
    password?: string;
}

export interface RegisterParams {
    username?: string;
    password?: string;
}

export interface LoginResult {
    token?: string;
    username?: string;
    role?: string;
    id?: number;
    is_active?: boolean;
    credit?: any;
}