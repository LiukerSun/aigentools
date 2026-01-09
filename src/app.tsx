import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import { Footer, Question, SelectLang } from '@/components';
import defaultSettings from '../config/defaultSettings';
import {
  AvatarDropdown,
  AvatarName,
} from './components/RightContent/AvatarDropdown';
import PageLoading from './loading';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';
import { currentUser as getUserInfo } from '@/services/api/v1/user/api';
import { clearAuthInfo, getAuthInfo, setAuthInfo } from '@/utils/auth';
import type { UserInfo } from '@/services/api/v1/user/type';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const NO_LOGIN_WHITE_LIST = [loginPath, '/user/register'];

/**
 * ## getInitialState
 *
 * This function is now **synchronous** and its role is to quickly load the "stale" user data
 * from localStorage to achieve an instant initial render. It does not perform any async operations.
 *
 * The "revalidation" of this data happens in the `layout` config below.
 *
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 */
import { App } from 'antd';

export function rootContainer(container: React.ReactElement) {
  return <App>{container}</App>;
}

export function getInitialState(): {
  settings?: Partial<LayoutSettings>;
  currentUser?: UserInfo;
  loading?: boolean;
} {
  const authInfo = getAuthInfo();
  if (authInfo) {
    return {
      currentUser: authInfo.currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  return {
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

/**
 * ## layout
 *
 * This is where the "Revalidate" part of our "Stale-While-Revalidate" strategy is implemented.
 *
 * @see https://umijs.org/docs/api/runtime-config#layout
 */
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  // Effect hook to revalidate user info in the background
  React.useEffect(() => {
    const revalidateUserInfo = async () => {
      try {
        const authInfo = getAuthInfo();
        // Only revalidate if there's a token, otherwise it's a pointless request.
        if (!authInfo?.token) {
          // If not on a public page, redirect to login. This handles cases where
          // localStorage is cleared manually.
          if (!NO_LOGIN_WHITE_LIST.includes(history.location.pathname)) {
            history.push(loginPath);
          }
          return;
        }

        const freshUserInfo = await getUserInfo();

        if (freshUserInfo && freshUserInfo.data) {
          // Update localStorage with the fresh data
          setAuthInfo(authInfo.token, freshUserInfo.data);
          // Update the global state so the UI reflects the changes
          setInitialState((s) => ({ ...s, currentUser: freshUserInfo.data }));
        } else {
          // This case might happen if the backend returns a 200 but with empty data.
          // Treat it as a failure.
          throw new Error('Invalid user info response');
        }
      } catch (error) {
        // The request interceptor in requestErrorConfig.ts should handle 401 errors
        // by redirecting to login. We can add a fallback here for safety.
        console.error('Failed to revalidate user info:', error);
        clearAuthInfo();
        history.push(loginPath);
      }
    };

    revalidateUserInfo();
  }, [history.location.pathname]); // Re-run when the page path changes

  return {
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      const authInfo = getAuthInfo();
      // If there's no user info and the page is not in the whitelist, redirect to login.
      // This is a crucial check after the initial render and on every route change.
      if (
        !authInfo?.currentUser &&
        !NO_LOGIN_WHITE_LIST.includes(location.pathname)
      ) {
        history.push(loginPath);
      }
    },
    itemRender: (route, params, routes, paths) => {
      const isLast = routes.indexOf(route) === routes.length - 1;
      if (isLast || route.path === '/admin' || !route.path) {
        return <span>{route.breadcrumbName}</span>;
      }
      return <Link to={route.path}>{route.breadcrumbName}</Link>;
    },
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      // If there's no currentUser, and we are not on a public page, show a loading spinner
      // to avoid showing a half-rendered page before the redirect in onPageChange kicks in.
      if (
        !initialState?.currentUser &&
        !NO_LOGIN_WHITE_LIST.includes(history.location.pathname)
      ) {
        return <PageLoading />;
      }
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  baseURL: "https://ai.api.liukersun.com",
  ...errorConfig,
  requestInterceptors: [
    (config: any) => {
      const token = getAuthInfo()?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
};
