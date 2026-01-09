export interface PaymentConfig {
  id?: number;
  uuid?: string;
  payment_method: string;
  name: string;
  config: {
    url?: string;
    pid?: string;
    key?: string;
    [key: string]: any;
  };
  enable: boolean;
  created_at?: string;
}

export interface PaymentConfigListResponse {
  status: number;
  message: string;
  data: PaymentConfig[];
}

export interface UpdatePaymentConfigParams {
  name?: string;
  config?: any;
  enable?: boolean;
  payment_method?: string;
}
