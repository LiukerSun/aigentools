import { request } from '@umijs/max';
import * as API from './type';

/** AI 图片分析 POST /ai-assistant/analyze */
export async function analyzeImage(body: API.AnalyzeImageParams, options?: { [key: string]: any }) {
  return request<{
    data: API.AnalyzeImageResponse;
    message: string;
    status: number;
  }>('/api/v1/ai-assistant/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
