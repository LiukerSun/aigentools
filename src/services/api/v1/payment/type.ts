export interface PaymentMethod {
  uuid: string;
  type: string;
  name: string;
}

export interface PaymentMethodResponse {
  status: number;
  message: string;
  data: PaymentMethod[];
}

export interface CreatePaymentRequest {
  amount: number;
  payment_method_uuid: string;
  payment_channel: 'alipay' | 'wxpay';
  return_url: string;
}

export interface CreatePaymentResult {
  jump_url: string;
  order_id: string;
}

export interface CreatePaymentResponse {
  status: number;
  message: string;
  data: CreatePaymentResult;
}
