import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message, notification } from 'antd';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  status: number;
  message: string;
  data: any;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res: ResponseStructure) => {
      // 后端返回的业务错误
      if (res.status !== 200) {
        const error: any = new Error(res.message);
        error.name = 'BizError';
        error.info = {
          errorCode: res.status,
          errorMessage: res.message,
          showType: res.showType,
          data: res.data,
        };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      // 全局处理 401 Unauthorized 错误
      if (error.response?.status === 401) {
        // remove local storage token
        localStorage.removeItem('token');
        // 也可以选择移除 currentUser
        // localStorage.removeItem('currentUser'); 

        history.push('/user/login');
        message.error('会话已过期，请重新登录。');
        return; // 终止后续错误处理
      }

      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo:
          | {
            errorMessage: string;
            errorCode: number;
            showType?: ErrorShowType;
          }
          | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const backendMessage = error.response?.data?.message;
        message.error(
          backendMessage || `服务器响应错误: ${error.response.status}`,
        );
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (url: string, options: any) => {
      const token = localStorage.getItem('token');
      // 如果 token 存在，且请求 headers 中没有自定义 Authorization，则注入 Token
      if (token) {
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
        return { url, options: { ...options, headers } };
      }
      return { url, options };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      // 如果后端返回的不是 json 或者是 blob 文件流，直接返回
      if (!data) {
        return response;
      }

      // 这里可以根据后端的数据结构进行解包
      // 例如：如果你的后端把数据包在 data.data 里，也可以在这里做处理
      // 目前保持原样返回即可，交给 errorThrower 处理业务错误
      return response;
    },
  ],
};