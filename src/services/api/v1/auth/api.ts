// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

/** 登录 POST /api/v1/auth/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
    return request<{ data: API.LoginResult }>('/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 注册 POST /api/v1/auth/register */
export async function register(body: API.RegisterParams, options?: { [key: string]: any }) {
    return request<{ data: API.LoginResult }>('/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 退出登录 POST /api/v1/auth/logout */
export async function logout(options?: { [key: string]: any }) {
    return request<any>('/api/v1/auth/logout', {
        method: 'POST',
        ...(options || {}),
    });
}