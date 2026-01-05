import { useModel } from '@umijs/max';
import {
  getModelNames,
  getModelParameters,
} from '@/services/api/v1/models/api';
import type { AIModelConfig } from '@/services/api/v1/models/type';
import {
  ProFormSelect,
  StepsForm,
} from '@ant-design/pro-components';
import { Button, Modal, message } from 'antd';
import { useState } from 'react';

import DynamicApiForm from './DynamicApiForm';

export default function ModelSteps() {
  const [visible, setVisible] = useState(false);
  const [modelId, setModelId] = useState<number>();
  const [modelConfig, setModelConfig] = useState<AIModelConfig>();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return (
    <div style={{ padding: 24 }}>
      <Button type="primary" onClick={() => setVisible(true)}>
        创建任务
      </Button>
      <Modal
        title="创建任务"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        <StepsForm
          onFinish={async (values) => {
            const submitData = {
              body: values,
              user: {
                creatorId: currentUser?.id,
                creatorName: currentUser?.username,
              },
            };
            console.log('Submission Data:', submitData);
            message.success('提交成功');
            setVisible(false);
            return true;
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
              request={async () => {
                try {
                  const res = await getModelNames();
                  if (res.status === 200 && res.data) {
                    return res.data.map((item) => ({
                      label: item.name,
                      value: item.id,
                      key: item.id,
                    }));
                  }
                  return [];
                } catch (error) {
                  message.error('获取模型列表失败');
                  return [];
                }
              }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="config"
            title="配置参数"
          >
            {modelConfig && <DynamicApiForm schema={modelConfig} />}
          </StepsForm.StepForm>


        </StepsForm>
      </Modal>
    </div>
  );
}
