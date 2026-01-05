// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

// ================= 用户管理接口 =================

/** 获取用户列表 GET /api/v1/admin/users */
export async function getUsers(params: API.UserListParams, options?: { [key: string]: any }) {
    return request<{
        data: { users: API.AdminUserItem[]; total: number; page: number; limit: number };
    }>('/api/v1/admin/users', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

/** 更新用户 PATCH /api/v1/admin/users/{id} */
export async function updateUser(
    id: number,
    body: API.UpdateUserParams,
    options?: { [key: string]: any },
) {
    return request<{ data: API.AdminUserItem }>(`/api/v1/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 删除用户 DELETE /api/v1/admin/users/{id} */
export async function deleteUser(id: number, options?: { [key: string]: any }) {
    return request<any>(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        ...(options || {}),
    });
}

/** 调整用户余额 POST /api/v1/admin/users/{id}/balance */
export async function adjustUserBalance(
    id: number,
    body: API.BalanceAdjustParams,
    options?: { [key: string]: any },
) {
    return request<{ data: API.AdminUserItem }>(`/api/v1/admin/users/${id}/balance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// ================= 交易管理接口 =================

/** 获取交易列表 GET /api/v1/admin/transactions */
export async function getTransactions(
    params: API.TransactionListParams,
    options?: { [key: string]: any },
) {
    return request<{
        data: { transactions: API.TransactionItem[]; total: number; page: number; limit: number };
    }>('/api/v1/admin/transactions', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

/** 导出交易记录 GET /api/v1/admin/transactions/export */
export async function exportTransactions(
    params: API.TransactionListParams,
    options?: { [key: string]: any },
) {
    return request<Blob>('/api/v1/admin/transactions/export', {
        method: 'GET',
        params: {
            ...params,
        },
        responseType: 'blob', // 关键：处理文件下载
        ...(options || {}),
    });
}