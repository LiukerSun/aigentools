import React, { useEffect, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, InputNumber, Radio, message, Space } from 'antd';
import { getPaymentMethods, createPayment } from '@/services/api/v1/payment/api';
import type { PaymentMethod } from '@/services/api/v1/payment/type';

const RechargePage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await getPaymentMethods();
      // Adjust checking based on actual API response structure
      if (res && res.data) {
        setMethods(res.data);
        if (res.data.length > 0) {
          setSelectedMethod(res.data[0].uuid);
        }
      } else {
        // Fallback or specific error handling if needed
        // Sometimes pro-request handles errors globally
      }
    } catch (error) {
      console.error('Failed to load payment methods', error);
      message.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!amount || amount <= 0) {
      message.warning('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      message.warning('Please select a payment method');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPayment({
        amount: amount,
        payment_method_uuid: selectedMethod,
        return_url: window.location.href,
      });

      if (res && res.data && res.data.jump_url) {
        window.location.href = res.data.jump_url;
      } else {
        message.error(res.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error', error);
      message.error('Failed to create payment order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Recharge Account">
      <ProCard direction="column" ghost gutter={[0, 16]} style={{ maxWidth: 800, margin: '0 auto' }}>
        <ProCard title="Select Payment Method" loading={loading} bordered headerBordered>
             {methods.length > 0 ? (
                <Radio.Group 
                  value={selectedMethod} 
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {methods.map((method) => (
                      <ProCard key={method.uuid} bordered style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                        <Radio value={method.uuid} style={{ width: '100%' }}>
                           <span style={{ fontWeight: 500 }}>{method.name}</span> 
                           <span style={{ color: '#888', marginLeft: 8 }}>({method.type})</span>
                        </Radio>
                      </ProCard>
                    ))}
                  </Space>
                </Radio.Group>
             ) : (
               <div>No payment methods available</div>
             )}
        </ProCard>

        <ProCard title="Recharge Amount" bordered headerBordered>
           <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8, color: '#666' }}>Amount (USD)</div>
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  value={amount}
                  onChange={setAmount}
                  precision={2}
                  min={0.01}
                  placeholder="Enter amount to recharge"
                  size="large"
                />
              </div>
              <Button 
                type="primary" 
                onClick={handleRecharge} 
                loading={submitting}
                disabled={loading || methods.length === 0}
                size="large"
                block
              >
                Recharge Now
              </Button>
           </Space>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default RechargePage;
