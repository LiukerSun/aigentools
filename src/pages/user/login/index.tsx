import { setAuthInfo } from '@/utils/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, Link, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/api/v1/auth/api';
import type { LoginParams } from '@/services/api/v1/auth/type';
import { currentUser as queryCurrentUser } from '@/services/api/v1/user/api';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<{
    status?: string;
    type?: string;
  }>({});
  const [type, setType] = useState<string>('account');
  const { setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const userInfo = await queryCurrentUser();
    if (userInfo && userInfo.data) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };

  const handleSubmit = async (values: LoginParams) => {
    try {
      // 登录
      const msg = await login({ ...values });

      if (msg.data && msg.data.token) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);

        // 保存 token 和用户信息
        setAuthInfo(msg.data.token, msg.data as any);

        // 获取详细用户信息并更新全局状态
        await fetchUserInfo();

        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }

      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState({ status: 'error', type: 'account' });
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      // message.error(defaultLoginFailureMessage);
      setUserLoginState({ status: 'error', type: 'account' });
    }
  };


  const { status } = userLoginState;

  return (
    <div style={{ backgroundColor: 'white', height: '100vh' }}>
      <LoginForm
        title="AI Gen Tools"
        subTitle="高效的 AI 模型与用户管理系统"
        initialValues={{
          autoLogin: true,
        }}
        onFinish={async (values) => {
          await handleSubmit(values as LoginParams);
        }}
      >
        {status === 'error' && (
          <LoginMessage content="账户或密码错误" />
        )}


        <>
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入用户名'}
            rules={[
              {
                required: true,
                message: '用户名是必填项！',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder={'请输入密码'}
            rules={[
              {
                required: true,
                message: '密码是必填项！',
              },
              {
                min: 6,
                message: '密码长度不能少于 6 位',
              }
            ]}
          />
        </>

        <div
          style={{
            marginBottom: 24,
            textAlign: 'right',
          }}
        >
          <Link to="/user/register">注册账户</Link>
        </div>
      </LoginForm>
    </div>
  );
};

export default Login;