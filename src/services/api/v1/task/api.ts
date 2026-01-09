import { request } from '@umijs/max';
import { TaskSubmitBody, TaskItem, TaskListParams, TaskListResponse } from './type';

/** 提交任务 */
export async function submitTask(data: TaskSubmitBody) {
  return request<{ status: number; message: string; data: TaskItem }>('/api/v1/tasks', {
    method: 'POST',
    data,
  });
}

/** 获取任务列表 */
export async function getTaskList(params: TaskListParams) {
  return request<TaskListResponse>('/api/v1/tasks', {
    method: 'GET',
    params,
  });
}

/** 获取任务详情 */
export async function getTaskDetail(id: number) {
  return request<{ status: number; message: string; data: TaskItem }>(`/api/v1/tasks/${id}`, {
    method: 'GET',
  });
}

/** 审核任务 */
export async function approveTask(id: number) {
  return request<{ status: number; message: string; data: TaskItem }>(`/api/v1/tasks/${id}/approve`, {
    method: 'PATCH',
  });
}

/** 取消任务 */
export async function cancelTask(id: number) {
  return request<{ status: number; message: string; data: TaskItem }>(`/api/v1/tasks/${id}/cancel`, {
    method: 'POST',
  });
}

/** 修改任务 */
export async function updateTask(id: number, data: Record<string, any>) {
  return request<{ status: number; message: string; data: TaskItem }>(`/api/v1/tasks/${id}`, {
    method: 'PUT',
    data,
  });
}

