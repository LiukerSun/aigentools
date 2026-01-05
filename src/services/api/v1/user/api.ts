// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

/** 获取当前用户信息 GET /api/v1/auth/user */
export async function currentUser(options?: { [key: string]: any }) {
    return request<{ data: API.UserInfo }>('/api/v1/auth/user', {
        method: 'GET',
        ...(options || {}),
    });
}