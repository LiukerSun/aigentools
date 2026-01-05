export interface APIResponse<T = any> {
    data: T;
    message?: string;
    status?: number;
}