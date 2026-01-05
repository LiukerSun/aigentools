import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row, Spin, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { currentUser as getUserInfo } from '@/services/api/v1/user/api';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

const Welcome: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await getUserInfo();
        // Handle both cases where response might be the data itself or wrapped in { data: ... }
        const userInfo = response?.data || response;

        if (userInfo) {
          setInitialState((s) => ({ ...s, currentUser: userInfo }));
        }
      } catch (error) {
        console.error('Failed to fetch user info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const { currentUser } = initialState || {};

  if (!currentUser && loading) {
    return (
      <PageContainer>
        <Spin size="large" />
      </PageContainer>
    );
  }

  if (!currentUser) {
    return (
      <PageContainer>
        <div>Please log in to view this page.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
          marginBottom: 24,
        }}
        styles={{
          body: {
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          },
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color:
                initialState?.settings?.navTheme === 'realDark'
                  ? '#ffffff'
                  : '#1A1B1F',
              fontWeight: 500,
            }}
          >
            Welcome back, {currentUser.username}!
          </div>
          <div
            style={{
              marginTop: 8,
              color:
                initialState?.settings?.navTheme === 'realDark'
                  ? '#rgba(255,255,255,0.65)'
                  : '#666',
            }}
          >
            Role: {currentUser.role}
          </div>
        </div>
      </Card>

      <Card title="Test OSS Upload" style={{ marginBottom: 24 }}>
        <p>You can click to upload or paste an image here.</p>
        <AliyunOSSUpload onChange={(url) => console.log('Uploaded URL:', url)} />
      </Card>

      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Credit Limit"
              value={currentUser.creditLimit}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Available Credit"
              value={currentUser.credit?.available}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Used Credit"
              value={currentUser.credit?.used}
              precision={2}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Welcome;
