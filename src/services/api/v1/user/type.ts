export interface CreditInfo {
    available?: number;
    total?: number;
    usagePercentage?: number;
    used?: number;
}

export interface UserInfo {
    id?: number;
    username?: string;
    role?: 'admin' | 'user' | string;
    is_active?: boolean;
    token?: string;
    credit?: CreditInfo;
    creditLimit?: number;
    activated_at?: string;
    deactivated_at?: string;
}