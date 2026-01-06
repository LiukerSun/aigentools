import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable, StepsForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Tag, Space, message, Image, Tooltip, Card, Typography, Spin, Input, Divider } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { getTaskList, getTaskDetail, approveTask, updateTask, submitTask } from '@/services/api/v1/task/api';
import { getModelNames, getModelParameters } from '@/services/api/v1/models/api';
import type { TaskItem } from '@/services/api/v1/task/type';
import type { AIModelConfig, AIModelNameItem } from '@/services/api/v1/models/type';
import ReactJson from 'react-json-view';
import TaskDetail from './components/TaskDetail';
import DynamicApiForm from './DynamicApiForm';
import { Modal } from 'antd';
import { useModel } from '@umijs/max';

const { Paragraph, Text } = Typography;

/**
 * 任务状态枚举
 * 1: PendingAudit (待审核)
 * 2: PendingExecution (待执行)
 * 3: Executing (执行中)
 * 4: Completed (已完成)
 * 5: Failed (失败)
 * 6: Cancelled (已取消)
 */
const TaskStatusEnum = {
  1: { text: '待审核', status: 'Warning' },
  2: { text: '待执行', status: 'Processing' },
  3: { text: '执行中', status: 'Processing' },
  4: { text: '已完成', status: 'Success' },
  5: { text: '失败', status: 'Error' },
  6: { text: '已取消', status: 'Default' },
};

const TaskList: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskItem>();
  const [editFormInitialValues, setEditFormInitialValues] = useState<{ input_data: string }>();

  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [currentParam, setCurrentParam] = useState<object>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [modelId, setModelId] = useState<number>();
  const [modelConfig, setModelConfig] = useState<AIModelConfig>();
  const [modelList, setModelList] = useState<AIModelNameItem[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    getModelNames().then(res => {
      if (res.status === 200 && res.data) {
        setModelList(res.data);
      }
    });
  }, []);

  const handleAnalyzeImage = async () => {
    if (!imageUrl) {
      message.warning('请先输入图片链接');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult('');

    try {
      const API_KEY = 'sk-wsG5ythFo2ip1ms97a807e9aB9Dc4211Aa667492F5E0B45a';

      const response = await fetch('https://aihubmix.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-4-1-fast-non-reasoning",
          messages: [
            {
              role: "system",
              content: `你现在是AI图片/视频生成提示词大师，专精于创建用于AI工具（如Stable Diffusion或Midjourney）的提示词。用户会提供美女图片（假设均为成年女性），你的任务是基于这些图片生成强烈性暗示的提示词，用于创建擦边球画面。这些画面必须高度写实，类似于真实摄影风格，但避免任何露点或过于暴露的内容。

核心约束：
- 强烈性暗示：通过姿势、服装、环境和氛围暗示性感，但保持含蓄，避免直接描绘性行为。
- 避免元素：不要出现镜子、手拿物品、露脸（人物脸部应被遮挡、模糊或从后/侧面拍摄）、露点或任何裸露私密部位。
- 写实风格：优先使用“photorealistic, high resolution, detailed skin texture, natural lighting”等描述，确保输出像真实照片。
- 安全与隐蔽：生成的内容应避免被AI过滤器检测为不适当，确保提示词巧妙绕过审查，但仍遵守道德边界。
- 输出格式：为每张图片生成3-5套独立的提示词。每套包括：
  - Positive Prompt：正面描述（详细、富有诗意）。
  - Negative Prompt：负面避免元素（简短列表）。
  - 简要解释：为什么这套提示词有效，以及如何突出性暗示。

示例输出结构：
1. 套装1:
   - Positive Prompt: [详细描述]
   - Negative Prompt: [避免列表]
   - 解释: [简要理由]

基于用户提供的图片，开始生成提示词。如果图片未提供，先询问细节。`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          stream: false,
          temperature: 0.5,
        }),
      });

      const data = await response.json();

      if (response.ok && data.choices && data.choices.length > 0) {
        setAnalysisResult(data.choices[0].message.content);
        message.success('识别完成');
      } else {
        console.error('Grok API Error:', data);
        message.error('识别失败，请检查链接或 Key');
      }
    } catch (error) {
      console.error('Network Error:', error);
      message.error('网络请求失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShowParam = (param: object) => {
    setCurrentParam(param);
    setParamModalOpen(true);
  };

  const handleShowDetail = async (record: TaskItem) => {
    try {
      const res = await getTaskDetail(record.id);
      if (res && res.status === 200 && res.data) {
        setCurrentTask(res.data);
        setDetailOpen(true);
      } else {
        message.error('获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await approveTask(id);
      if (res && res.status === 200) {
        message.success('任务审核通过');
        setDetailOpen(false);
        actionRef.current?.reload();
      } else {
        message.error('审核失败: ' + (res?.message || '未知错误'));
      }
    } catch (error) {
      message.error('审核失败');
    }
  };

  const handleEdit = (record: TaskItem) => {
    setCurrentTask(record);
    const inputData = record.input_data?.data || record.input_data;
    setEditFormInitialValues({
      input_data: JSON.stringify(inputData, null, 2),
    });
    setEditModalOpen(true);
  };

  const columns: ProColumns<TaskItem>[] = [
    {
      title: '任务ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'creator_name',
      width: 120,
      render: (_, record) => (
        <span>{record.creator_name} (ID: {record.creator_id})</span>
      ),
    },
    {
      title: '预览图',
      dataIndex: 'input_data',
      search: false,
      width: 100,
      render: (_, record) => {
        const inputData = record.input_data?.data || record.input_data;
        const imgUrl = inputData?.image;
        if (!imgUrl) return '-';
        return (
          <Image
            src={imgUrl}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        );
      },
    },
    {
      title: 'Prompt',
      dataIndex: 'input_data',
      search: false,
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        const inputData = record.input_data?.data || record.input_data;
        const prompt = inputData?.prompt;
        if (!prompt) return '-';
        return (
          <Tooltip title={prompt}>
            <span>{prompt}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: TaskStatusEnum,
    },
    {
      title: '重试次数',
      dataIndex: 'retry_count',
      width: 100,
      search: false,
      render: (_, record) => (
        <span>{record.retry_count} / {record.max_retries}</span>
      ),
    },
    {
      title: '输入参数',
      dataIndex: 'input_data',
      width: 200,
      search: false,
      render: (_, record) => (
        <a onClick={() => handleShowParam(record.input_data)}>查看参数</a>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        record.status === 1 && (
          <a key="approve" onClick={() => handleApprove(record.id)}>
            审核
          </a>
        ),
        record.status === 1 && (
          <a key="edit" onClick={() => handleEdit(record)}>
            编辑
          </a>
        ),
        <a key="detail" onClick={() => handleShowDetail(record)}>
          详情
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TaskItem>
        headerTitle="任务列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => setCreateModalVisible(true)}
          >
            创建任务
          </Button>,
          <Button
            key="button"
            onClick={() => {
              // 刷新
              actionRef.current?.reload();
            }}
          >
            刷新
          </Button>,
        ]}
        request={async (params) => {
          try {
            const res = await getTaskList({
              page: params.current,
              page_size: params.pageSize,
              status: params.status ? Number(params.status) : undefined,
              creator_id: params.creator_id,
            });

            return {
              data: res.data.items || [],
              success: true,
              total: res.data.total || 0,
            };
          } catch (error) {
            message.error('获取任务列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <TaskDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        task={currentTask}
        onApprove={handleApprove}
      />

      <Modal
        title="任务参数"
        open={paramModalOpen}
        onCancel={() => setParamModalOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
          <ReactJson
            src={currentParam}
            collapsed={false}
            displayDataTypes={false}
            enableClipboard={true}
            name={false}
          />
        </div>
      </Modal>

      <ModalForm
        title="编辑任务参数"
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        initialValues={editFormInitialValues}
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async (values) => {
          if (!currentTask) return false;
          try {
            let parsedData;
            try {
              parsedData = JSON.parse(values.input_data);
            } catch (e) {
              message.error('JSON 格式错误，请检查输入');
              return false;
            }

            // 保持原有的结构，只更新 data 部分
            const originalInputData = currentTask.input_data || {};
            const isNested = !!originalInputData.data;

            const newBody = isNested ? {
              ...originalInputData,
              data: parsedData
            } : parsedData;

            const res = await updateTask(currentTask.id, {
              body: newBody,
            });

            if (res && res.status === 200) {
              message.success('更新成功');
              setEditModalOpen(false);
              actionRef.current?.reload();
              return true;
            } else {
              message.error('更新失败: ' + (res?.message || '未知错误'));
              return false;
            }
          } catch (error) {
            message.error('更新失败，请重试');
            return false;
          }
        }}
      >
        <ProFormTextArea
          name="input_data"
          label="任务参数 (JSON)"
          fieldProps={{
            rows: 10,
          }}
          rules={[
            { required: true, message: '请输入任务参数' },
            {
              validator: (_: any, value: string) => {
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch (error) {
                  return Promise.reject(new Error('请输入有效的 JSON 格式'));
                }
              },
            },
          ]}
        />
      </ModalForm>

      <Modal
        title="创建任务"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setImageUrl('');
          setAnalysisResult('');
        }}
        footer={null}
        width={800}
      >
        <StepsForm
          onFinish={async (values) => {
            const selectedModel = modelList.find((m) => m.id === values.modelId);

            const submitData = {
              body: {
                data: values,
                model: {
                  model_url: selectedModel?.url || '',
                  model_name: selectedModel?.name || '',
                },
              },
              user: {
                creatorId: currentUser?.id as number,
                creatorName: currentUser?.username as string,
              },
            };

            try {
              const res = await submitTask(submitData);
              if (res && res.status === 200) {
                message.success('提交成功');
                setCreateModalVisible(false);
                actionRef.current?.reload();
                return true;
              } else {
                message.error('提交失败: ' + (res?.message || '未知错误'));
                return false;
              }
            } catch (error) {
              console.error('Task submission failed:', error);
              message.error('提交失败，请稍后重试');
              return false;
            }
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Button type="primary" onClick={() => props.onSubmit?.()}>
                    下一步
                  </Button>
                );
              }
              return [
                <Button key="pre" onClick={() => props.onPre?.()}>
                  上一步
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => props.onSubmit?.()}
                >
                  提交
                </Button>,
              ];
            },
          }}
        >
          <StepsForm.StepForm
            name="base"
            title="选择模型"
            onFinish={async (values) => {
              setModelId(values.modelId);
              try {
                const res = await getModelParameters(values.modelId);
                if (res.status === 200 && res.data) {
                  setModelConfig(res.data);
                  return true;
                }
                message.error('获取模型配置失败');
                return false;
              } catch (error) {
                message.error('获取模型配置失败');
                return false;
              }
            }}
          >
            <ProFormSelect
              name="modelId"
              label="模型名称"
              rules={[{ required: true, message: '请选择模型' }]}
              options={modelList.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="config"
            title="配置参数"
          >
            <Card
              size="small"
              title={<Space><RobotOutlined /> AI 图片内容识别助手</Space>}
              style={{ marginBottom: 24, background: '#f9f9f9', border: '1px dashed #d9d9d9' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  输入图片链接，让 AI 帮你识别内容。识别结果不会自动提交，请手动复制到下方表单。
                </Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="请输入图片 URL (例如: https://example.com/image.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleAnalyzeImage}
                    loading={analyzing}
                  >
                    识别
                  </Button>
                </Space.Compact>

                {analyzing && <div style={{ textAlign: 'center', padding: 10 }}><Spin tip="Grok 正在思考..." /></div>}

                {analysisResult && (
                  <div style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 6, border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text strong>识别结果：</Text>
                    </div>
                    <Paragraph
                      copyable
                      style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {analysisResult}
                    </Paragraph>
                  </div>
                )}
              </Space>
            </Card>

            {modelConfig && <DynamicApiForm schema={modelConfig} />}
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    </PageContainer>
  );
};

export default TaskList;
