import {
  ActionType,
  ProColumns,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import ReactJson from 'react-json-view';
import { getModelList, createModel, updateModel, updateModelStatus } from '@/services/api/v1/models/api';
import { AIModelItem, CreateModelParams, UpdateModelParams } from '@/services/api/v1/models/type';

const ModelManage: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<AIModelItem>();
  const [jsonModalVisible, setJsonModalVisible] = useState<boolean>(false);
  const [currentJson, setCurrentJson] = useState<Record<string, any>>({});

  const handleCreate = async (values: CreateModelParams & { parameters?: string }) => {
    const hide = message.loading('正在创建...');
    try {
      let params = values.parameters;
      if (typeof values.parameters === 'string' && values.parameters.trim()) {
        try {
          params = JSON.parse(values.parameters);
        } catch (e) {
          hide();
          message.error('参数格式错误，请输入有效的 JSON');
          return false;
        }
      } else {
        params = undefined;
      }

      await createModel({ ...values, parameters: params as Record<string, any> });
      hide();
      message.success('创建成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('创建失败，请重试！');
      return false;
    }
  };

  const handleUpdate = async (values: UpdateModelParams & { parameters?: string }) => {
    const hide = message.loading('正在更新...');
    try {
      if (!currentRow?.id) return false;

      let params = values.parameters;
      if (typeof values.parameters === 'string' && values.parameters.trim()) {
        try {
          params = JSON.parse(values.parameters);
        } catch (e) {
          hide();
          message.error('参数格式错误，请输入有效的 JSON');
          return false;
        }
      } else if (typeof values.parameters === 'string') {
        params = undefined;
      }

      await updateModel(currentRow.id, { ...values, parameters: params as Record<string, any> });
      hide();
      message.success('更新成功');
      setUpdateModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('更新失败，请重试！');
      return false;
    }
  };

  const handleStatusChange = async (record: AIModelItem, status: 'open' | 'closed' | 'draft') => {
    if (!record.id) return;
    const hide = message.loading('正在更新状态...');
    try {
      await updateModelStatus(record.id, { status });
      hide();
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch (error) {
      hide();
      message.error('状态更新失败');
    }
  };

  const columns: ProColumns<AIModelItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 48,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        open: { text: '开启', status: 'Success' },
        closed: { text: '关闭', status: 'Error' },
        draft: { text: '草稿', status: 'Default' },
      },
    },
    {
      title: '接口地址',
      dataIndex: 'url',
      copyable: true,
    },
    {
      title: '参数',
      dataIndex: 'parameters',
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrentJson(record.parameters || {});
              setJsonModalVisible(true);
            }}
          >
            查看参数
          </a>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
        record.status !== 'open' && (
          <a key="open" onClick={() => handleStatusChange(record, 'open')}>
            开启
          </a>
        ),
        record.status === 'open' && (
          <a key="close" onClick={() => handleStatusChange(record, 'closed')}>
            关闭
          </a>
        ),
      ],
    },
  ];

  return (
    <div style={{ backgroundColor: '#fff', padding: 20 }}>
      <ProTable<AIModelItem>
        headerTitle="模型列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const msg = await getModelList({
            page: params.current,
            limit: params.pageSize,
            name: params.name,
            status: params.status,
          });
          return {
            data: msg.data.models,
            success: true,
            total: msg.data.total,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="新建模型"
        width="600px"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleCreate}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '模型名称为必填项',
            },
          ]}
          name="name"
          label="模型名称"
          placeholder="请输入模型名称"
        />
        <ProFormSelect
          name="status"
          label="状态"
          initialValue="draft"
          options={[
            { label: '草稿', value: 'draft' },
            { label: '开启', value: 'open' },
            { label: '关闭', value: 'closed' },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
        />
        <ProFormText
          name="url"
          label="接口地址"
          placeholder="请输入模型接口地址"
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模型描述"
        />
        <ProFormTextArea
          name="parameters"
          label="参数配置 (JSON)"
          placeholder='{"temperature": 0.7, "max_tokens": 1024}'
          rules={[
            {
              validator: (_: any, value: string) => {
                if (!value) return Promise.resolve();
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch (err) {
                  return Promise.reject(new Error('请输入有效的 JSON 格式'));
                }
              },
            },
          ]}
          fieldProps={{
            autoSize: { minRows: 3, maxRows: 10 },
          }}
        />
      </ModalForm>

      <ModalForm
        title="编辑模型"
        width="600px"
        open={updateModalVisible}
        onOpenChange={setUpdateModalVisible}
        onFinish={handleUpdate}
        initialValues={{
          ...currentRow,
          parameters: currentRow?.parameters ? JSON.stringify(currentRow.parameters, null, 2) : '',
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => setCurrentRow(undefined),
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '模型名称为必填项',
            },
          ]}
          name="name"
          label="模型名称"
          placeholder="请输入模型名称"
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '草稿', value: 'draft' },
            { label: '开启', value: 'open' },
            { label: '关闭', value: 'closed' },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
        />
        <ProFormText
          name="url"
          label="接口地址"
          placeholder="请输入模型接口地址"
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模型描述"
        />
        <ProFormTextArea
          name="parameters"
          label="参数配置 (JSON)"
          rules={[
            {
              validator: (_: any, value: string) => {
                if (!value) return Promise.resolve();
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch (err) {
                  return Promise.reject(new Error('请输入有效的 JSON 格式'));
                }
              },
            },
          ]}
          fieldProps={{
            autoSize: { minRows: 3, maxRows: 10 },
          }}
        />
      </ModalForm>

      <Modal
        title="模型参数"
        open={jsonModalVisible}
        onCancel={() => setJsonModalVisible(false)}
        footer={null}
        width={600}
      >
        <ReactJson
          src={currentJson}
          name={false}
          displayDataTypes={false}
          enableClipboard={true}
        />
      </Modal>
    </div>
  );
};

export default ModelManage;
