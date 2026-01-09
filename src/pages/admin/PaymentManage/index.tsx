import React, { useRef, useState } from 'react';
import { PageContainer, ProTable, ActionType, ProColumns, ModalForm, ProFormText, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getAdminPaymentMethods, createAdminPaymentMethod, updateAdminPaymentMethod, deleteAdminPaymentMethod } from '@/services/api/v1/admin/payment/api';
import type { PaymentConfig } from '@/services/api/v1/admin/payment/type';

const PaymentManage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<PaymentConfig | undefined>(undefined);

  const handleAdd = async (fields: PaymentConfig) => {
    const hide = message.loading('Adding...');
    try {
      await createAdminPaymentMethod({ ...fields });
      hide();
      message.success('Added successfully');
      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('Adding failed, please try again!');
      return false;
    }
  };

  const handleUpdate = async (fields: PaymentConfig) => {
    if (!currentRow?.id) return false;
    const hide = message.loading('Configuring...');
    try {
      await updateAdminPaymentMethod(currentRow.id, fields);
      hide();
      message.success('Configuration successful');
      setModalVisible(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('Configuration failed, please try again!');
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    const hide = message.loading('Deleting...');
    try {
      await deleteAdminPaymentMethod(id);
      hide();
      message.success('Deleted successfully');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('Delete failed, please try again');
      return false;
    }
  };

  const columns: ProColumns<PaymentConfig>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      valueType: 'select',
      valueEnum: {
        epay: { text: 'Epay' },
        alipay: { text: '支付宝' },
        wxpay: { text: '微信支付' },
      },
    },
    {
      title: 'Status',
      dataIndex: 'enable',
      render: (dom, entity) => {
        return entity.enable ? <Tag color="green">Enabled</Tag> : <Tag color="red">Disabled</Tag>;
      },
    },
    {
        title: 'Created At',
        dataIndex: 'created_at',
        valueType: 'dateTime',
        search: false,
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          Edit
        </a>,
        <Popconfirm
            key="delete"
            title="Are you sure to delete this payment method?"
            onConfirm={() => handleDelete(record.id!)}
        >
            <a style={{ color: 'red' }}>Delete</a>
        </Popconfirm>
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<PaymentConfig>
        headerTitle="Payment Configs"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
                setCurrentRow(undefined);
                setModalVisible(true);
            }}
          >
            <PlusOutlined /> New
          </Button>,
        ]}
        request={async (params) => {
            const res = await getAdminPaymentMethods(params);
            return {
                data: res.data,
                success: true,
            };
        }}
        columns={columns}
      />
      
      <ModalForm
        title={currentRow ? 'Edit Payment Config' : 'New Payment Config'}
        width="500px"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (value) => {
            const payload = {
                ...value,
                config: {
                   url: value.url,
                   pid: value.pid,
                   key: value.key,
                }
            } as PaymentConfig;

            if (currentRow) {
                return handleUpdate(payload);
            }
            return handleAdd(payload);
        }}
        initialValues={currentRow ? {
            ...currentRow,
            // Flatten config for form
            url: currentRow.config?.url,
            pid: currentRow.config?.pid,
            key: currentRow.config?.key,
        } : {
            payment_method: 'epay',
            enable: true,
        }}
      >
        <ProFormText
          rules={[{ required: true, message: 'Name is required' }]}
          name="name"
          label="Display Name"
          placeholder="e.g. Primary Epay"
        />
        
        <ProFormSelect
            name="payment_method"
            label="Payment Type"
            valueEnum={{
                epay: 'Epay',
                alipay: '支付宝',
                wxpay: '微信支付',
            }}
            rules={[{ required: true, message: 'Please select a type' }]}
        />

        <ProFormText
            name="url"
            label="Gateway URL"
            rules={[{ required: true, message: 'Gateway URL is required' }]}
            placeholder="e.g. https://pay.example.com"
        />

        <ProFormText
            name="pid"
            label="Merchant ID (PID)"
            rules={[{ required: true, message: 'Merchant ID is required' }]}
        />
        
        <ProFormText.Password
            name="key"
            label="Merchant Key"
            rules={[{ required: true, message: 'Merchant Key is required' }]}
        />

        <ProFormSwitch name="enable" label="Enabled" />
      </ModalForm>
    </PageContainer>
  );
};

export default PaymentManage;
