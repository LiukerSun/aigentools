// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import * as API from './type';

/** Get payment methods GET /api/v1/payment/methods */
export async function getPaymentMethods(options?: { [key: string]: any }) {
  return request<API.PaymentMethodResponse>('/api/v1/payment/methods', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create payment order POST /api/v1/payment/create */
export async function createPayment(body: API.CreatePaymentRequest, options?: { [key: string]: any }) {
  return request<API.CreatePaymentResponse>('/api/v1/payment/create', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}
