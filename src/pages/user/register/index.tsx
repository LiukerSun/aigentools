import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, Link, SelectLang, useIntl } from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { Footer } from '@/components';
import { register } from '@/services/api/v1/auth/api';
import Settings from '../../../../config/defaultSettings';
import type { RegisterParams } from '@/services/api/v1/auth/type';

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const RegisterMessage: React.FC<{
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

const Register: React.FC = () => {
  const [userRegisterState, setUserRegisterState] = useState<{
    status?: string;
  }>({});
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const handleSubmit = async (
    values: RegisterParams & { confirm: string },
  ) => {
    const { password, confirm } = values;
    if (password !== confirm) {
      setUserRegisterState({
        status: 'error',
      });
      message.error(
        intl.formatMessage({
          id: 'pages.register.confirmPassword.errorMessage',
          defaultMessage: '两次输入的密码不一致！',
        }),
      );
      return;
    }

    try {
      // 注册
      const msg = await register(values);
      if (msg.data && msg.data.id) {
        const defaultRegisterSuccessMessage = intl.formatMessage({
          id: 'pages.register.success',
          defaultMessage: '注册成功！',
        });
        message.success(defaultRegisterSuccessMessage);
        window.location.href = '/user/login'; // Redirect to login page
        return;
      }
      // 如果失败去设置用户错误信息
      setUserRegisterState({
        status: 'error',
      });
    } catch (error) {
      const defaultRegisterFailureMessage = intl.formatMessage({
        id: 'pages.register.failure',
        defaultMessage: '注册失败，请重试！',
      });
      console.log(error);
      message.error(defaultRegisterFailureMessage);
    }
  };
  const { status } = userRegisterState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.register',
            defaultMessage: '注册页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({
                id: 'pages.register.submit',
                defaultMessage: '注册',
              }),
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(
              values as RegisterParams & { confirm: string },
            );
          }}
        >
          {status === 'error' && (
            <RegisterMessage
              content={intl.formatMessage({
                id: 'pages.register.errorMessage',
                defaultMessage: '注册失败，请检查填写信息！',
              })}
            />
          )}
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.username.placeholder',
              defaultMessage: '用户名',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.password.placeholder',
              defaultMessage: '密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="confirm"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.confirmPassword.placeholder',
              defaultMessage: '确认密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.confirmPassword.required"
                    defaultMessage="请确认密码！"
                  />
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({
                        id: 'pages.register.confirmPassword.errorMessage',
                        defaultMessage: '两次输入的密码不一致！',
                      }),
                    ),
                  );
                },
              }),
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Link
              style={{
                float: 'right',
              }}
              to="/user/login"
            >
              <FormattedMessage
                id="pages.register.goToLogin"
                defaultMessage="使用已有账户登录"
              />
            </Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};


export default Register;
