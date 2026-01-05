import {
  ActionType,
  ProColumns,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { getUsers, updateUser, deleteUser, adjustUserBalance } from '@/services/api/v1/admin/api';
import { AdminUserItem, UpdateUserParams, BalanceAdjustParams, UserListParams } from '@/services/api/v1/admin/type';


const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<AdminUserItem>();

  const handleUpdate = async (fields: UpdateUserParams) => {
    const hide = message.loading('正在更新...');
    try {
      if (!currentRow?.id) return false;
      await updateUser(currentRow.id, fields);
      hide();
      message.success('更新成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('更新失败请重试！');
      return false;
    }
  };

  const handleBalanceAdjust = async (fields: BalanceAdjustParams) => {
    const hide = message.loading('正在调整余额...');
    try {
      if (!currentRow?.id) return false;
      await adjustUserBalance(currentRow.id, fields);
      hide();
      message.success('余额调整成功');
      setBalanceModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('余额调整失败请重试！');
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    const hide = message.loading('正在删除...');
    try {
      await deleteUser(id);
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('删除失败请重试！');
      return false;
    }
  };

  const columns: ProColumns<AdminUserItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 48,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      valueEnum: {
        user: { text: '普通用户', status: 'Default' },
        admin: { text: '管理员', status: 'Success' },
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '禁用', status: 'Error' },
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      valueType: 'money',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '信用额度',
      dataIndex: 'creditLimit',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间范围',
      dataIndex: 'created_at_range',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            created_after: value[0],
            created_before: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a
            key="edit"
            onClick={() => {
              setCurrentRow(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </a>
          <a
            key="balance"
            onClick={() => {
              setCurrentRow(record);
              setBalanceModalVisible(true);
            }}
          >
            调额
          </a>
          <Popconfirm
            key="delete"
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id!)}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<AdminUserItem, UserListParams>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params, sort, filter) => {
          const msg = await getUsers({
            page: params.current,
            limit: params.pageSize,
            ...params,
          });
          return {
            data: msg.data.users,
            success: true,
            total: msg.data.total,
          };
        }}
        columns={columns}
      />

      {/* 编辑用户弹窗 */}
      <ModalForm
        title="编辑用户"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={currentRow}
        modalProps={{
          destroyOnHidden: true,
        }}
        onFinish={async (value) => {
          return handleUpdate(value as UpdateUserParams);
        }}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        />
        <ProFormSelect
          name="role"
          label="角色"
          valueEnum={{
            user: '普通用户',
            admin: '管理员',
          }}
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormSelect
          name="is_active"
          label="状态"
          valueEnum={{
            true: '启用',
            false: '禁用',
          }}
          rules={[{ required: true, message: '请选择状态' }]}
          // 注意：ProFormSelect 的 valueEnum key 是 string，API 可能返回 boolean
          // initialValues 会处理，但在提交时需要注意类型转换，如果 API 需要 boolean
          transform={(value) => ({ is_active: value === 'true' || value === true })}
        />
        <ProFormDigit
          name="creditLimit"
          label="信用额度"
          placeholder="请输入信用额度"
          min={0}
        />
        <ProFormText.Password
          name="password"
          label="重置密码"
          placeholder="不修改请留空"
        />
      </ModalForm>

      {/* 余额调整弹窗 */}
      <ModalForm
        title={`余额调整 - ${currentRow?.username}`}
        open={balanceModalVisible}
        onOpenChange={setBalanceModalVisible}
        modalProps={{
          destroyOnHidden: true,
        }}
        onFinish={async (value) => {
          return handleBalanceAdjust(value as BalanceAdjustParams);
        }}
      >
        <ProFormSelect
          name="type"
          label="调整类型"
          valueEnum={{
            credit: '充值 (增加余额)',
            debit: '扣款 (减少余额)',
          }}
          rules={[{ required: true, message: '请选择调整类型' }]}
        />
        <ProFormDigit
          name="amount"
          label="金额"
          placeholder="请输入金额"
          min={0.01}
          precision={2}
          rules={[{ required: true, message: '请输入金额' }]}
        />
        <ProFormTextArea
          name="reason"
          label="调整原因"
          placeholder="请输入调整原因"
        />
      </ModalForm>
    </>
  );
};

export default UserList;
