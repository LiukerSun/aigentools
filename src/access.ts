import type { UserInfo } from '@/services/api/v1/user/type';

/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: UserInfo } | undefined,
) {
  const { currentUser } = initialState ?? {};
  console.log('access.ts - initialState:', initialState);
  return {
    canAdmin: currentUser && currentUser.role === 'admin',
  };
}
