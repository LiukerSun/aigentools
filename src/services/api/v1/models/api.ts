// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

/** 获取模型列表 GET /api/v1/models */
export async function getModelList(
    params: API.AIModelListParams,
    options?: { [key: string]: any },
) {
    return request<{
        data: { models: API.AIModelItem[]; total: number; page: number; limit: number };
    }>('/api/v1/models', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

/** 创建模型 POST /api/v1/models/create */
export async function createModel(body: API.CreateModelParams, options?: { [key: string]: any }) {
    return request<{ data: API.AIModelItem }>('/api/v1/models/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 更新模型信息 PUT /api/v1/models/{id} */
export async function updateModel(
    id: number,
    body: API.UpdateModelParams,
    options?: { [key: string]: any },
) {
    return request<{ data: API.AIModelItem }>(`/api/v1/models/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 更新模型状态 PATCH /api/v1/models/{id}/status */
export async function updateModelStatus(
    id: number,
    body: API.UpdateStatusParams,
    options?: { [key: string]: any },
) {
    return request<any>(`/api/v1/models/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}