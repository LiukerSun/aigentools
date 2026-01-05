import { UserInfo } from '@/services/api/v1/user/type';

const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

export function getAuthInfo() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userInfoStr = localStorage.getItem(USER_INFO_KEY);
  let currentUser: UserInfo | undefined;

  try {
    currentUser = userInfoStr ? JSON.parse(userInfoStr) : undefined;
  } catch (e) {
    console.error('Failed to parse user info', e);
  }

  return {
    token,
    currentUser,
  };
}

export function setAuthInfo(token: string, currentUser: UserInfo) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (currentUser) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(currentUser));
  }
}

export function clearAuthInfo() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}
