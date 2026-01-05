import { request } from '@umijs/max';
import { OssStsToken } from './type';

/** 获取 OSS STS Token */
export async function getOssStsToken() {
  // 注意：这里应该是调用后端接口获取 STS Token
  // 为了演示，这里暂时返回模拟数据或者调用一个假设的接口
  // 请确保后端实现了 /api/v1/common/upload/token 接口
  return request<OssStsToken>('/api/v1/common/upload/token', {
    method: 'GET',
  });
}
