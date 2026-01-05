import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, FormInstance } from 'antd';
import React, { useRef } from 'react';
import { getTransactions, exportTransactions } from '@/services/api/v1/admin/api';
import { TransactionItem, TransactionListParams } from '@/services/api/v1/admin/type';
import { DownloadOutlined } from '@ant-design/icons';

const BalanceChange: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<FormInstance>(undefined);

  const handleExport = async () => {
    const hide = message.loading('正在导出...');
    try {
      // 获取当前搜索表单的值
      const values = formRef.current?.getFieldsValue();
      
      // 处理日期范围
      const params: any = {
        ...values,
      };

      // 如果有日期范围，ProTable 的 search.transform 会在 request 中处理，
      // 但在这里我们需要手动处理，或者依赖 getFieldsValue 获取到的值
      // 如果使用了 search.transform，getFieldsValue 获取到的是 transform 之前的值（通常是数组）
      if (params.created_at_range) {
        params.start_time = params.created_at_range[0];
        params.end_time = params.created_at_range[1];
        delete params.created_at_range;
      }

      const blob = await exportTransactions(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      hide();
      message.success('导出成功');
    } catch (error) {
      hide();
      message.error('导出失败，请重试');
      console.error(error);
    }
  };

  const columns: ProColumns<TransactionItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 48,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      width: 80,
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      valueEnum: {
        admin_adjustment: { text: '管理员调整', status: 'Processing' },
        system_auto: { text: '系统自动', status: 'Default' },
        user_consume: { text: '用户消费', status: 'Warning' },
        user_refund: { text: '用户退款', status: 'Success' },
      },
    },
    {
      title: '变动金额',
      dataIndex: 'amount',
      valueType: 'money',
      hideInSearch: true,
      sorter: true,
      render: (_, entity) => {
        const color = (entity.amount || 0) > 0 ? 'green' : 'red';
        return <span style={{ color }}>{entity.amount}</span>;
      },
    },
    {
      title: '变动前余额',
      dataIndex: 'balance_before',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '变动后余额',
      dataIndex: 'balance_after',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '变动原因',
      dataIndex: 'reason',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      hideInSearch: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '时间范围',
      dataIndex: 'created_at_range',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            start_time: value[0],
            end_time: value[1],
          };
        },
      },
    },
    {
      title: '最小金额',
      dataIndex: 'min_amount',
      valueType: 'digit',
      hideInTable: true,
    },
    {
      title: '最大金额',
      dataIndex: 'max_amount',
      valueType: 'digit',
      hideInTable: true,
    },
  ];

  return (
    <ProTable<TransactionItem, TransactionListParams>
      headerTitle="额度记录"
      actionRef={actionRef}
      formRef={formRef}
      rowKey="id"
      search={{
        labelWidth: 100,
      }}
      toolBarRender={() => [
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出记录
        </Button>,
      ]}
      request={async (params, sort, filter) => {
        const msg = await getTransactions({
          page: params.current,
          limit: params.pageSize,
          ...params,
        });
        return {
          data: msg.data.transactions,
          success: true,
          total: msg.data.total,
        };
      }}
      columns={columns}
    />
  );
};

export default BalanceChange;
