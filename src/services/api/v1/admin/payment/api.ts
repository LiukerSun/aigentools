// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

/** Get all payment configs (Admin) GET /api/v1/admin/payment/config */
export async function getAdminPaymentMethods(options?: { [key: string]: any }) {
  return request<API.PaymentConfigListResponse>('/api/v1/admin/payment/config', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create payment config (Admin) POST /api/v1/admin/payment/config */
export async function createAdminPaymentMethod(body: API.PaymentConfig, options?: { [key: string]: any }) {
  return request<any>('/api/v1/admin/payment/config', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** Update payment config (Admin) PUT /api/v1/admin/payment/config/{id} */
export async function updateAdminPaymentMethod(
  id: number,
  body: API.UpdatePaymentConfigParams,
  options?: { [key: string]: any },
) {
  return request<any>(`/api/v1/admin/payment/config/${id}`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}

/** Delete payment config (Admin) DELETE /api/v1/admin/payment/config/{id} */
export async function deleteAdminPaymentMethod(id: number, options?: { [key: string]: any }) {
  return request<any>(`/api/v1/admin/payment/config/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
