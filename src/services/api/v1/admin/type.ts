// --- User Management Types ---
export interface AdminUserItem {
    id?: number;
    username?: string;
    role?: string;
    is_active?: boolean;
    balance?: number;
    creditLimit?: number;
    created_at?: string;
    updated_at?: string;
    activated_at?: string;
    deactivated_at?: string;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    is_active?: boolean;
    created_after?: string;
    created_before?: string;
}

export interface UpdateUserParams {
    username?: string;
    password?: string;
    role?: 'admin' | 'user';
    is_active?: boolean;
    creditLimit?: number;
}

export interface BalanceAdjustParams {
    amount: number;
    type: 'credit' | 'debit';
    reason?: string;
}

// --- Transaction Management Types ---
export interface TransactionItem {
    id?: number;
    user_id?: number;
    type?: 'admin_adjustment' | 'system_auto' | 'user_consume' | 'user_refund';
    amount?: number;
    balance_before?: number;
    balance_after?: number;
    reason?: string;
    operator?: string;
    created_at?: string;
    ip_address?: string;
    device_info?: string;
    hash?: string;
}

export interface TransactionListParams {
    page?: number;
    limit?: number;
    user_id?: number;
    type?: string;
    start_time?: string;
    end_time?: string;
    min_amount?: number;
    max_amount?: number;
}