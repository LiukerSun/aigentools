import { Drawer, Descriptions, Tag, Space, Button, Image } from 'antd';
import React from 'react';
import type { TaskItem } from '@/services/api/v1/task/type';
import ReactJson from 'react-json-view';

interface TaskDetailProps {
  open: boolean;
  onClose: () => void;
  task?: TaskItem;
  onApprove?: (id: number) => void;
}

const TaskStatusEnum: Record<number, { text: string; color: string }> = {
  1: { text: '待审核', color: 'warning' },
  2: { text: '待执行', color: 'processing' },
  3: { text: '执行中', color: 'processing' },
  4: { text: '已完成', color: 'success' },
  5: { text: '失败', color: 'error' },
  6: { text: '已取消', color: 'default' },
};

const TaskDetail: React.FC<TaskDetailProps> = ({ open, onClose, task, onApprove }) => {
  if (!task) return null;

  const renderItems = () => {
    const items = [
      { label: '任务ID', children: task.ID },
      { label: '创建人', children: `${task.creator_name} (ID: ${task.creator_id})` },
      {
        label: '状态',
        children: (
          <Tag color={TaskStatusEnum[task.status]?.color}>
            {TaskStatusEnum[task.status]?.text || '未知'}
          </Tag>
        ),
      },
      { label: '重试次数', children: `${task.retry_count} / ${task.max_retries}` },
      { label: '创建时间', children: task.CreatedAt },
      { label: '更新时间', children: task.UpdatedAt },
    ];

    if (task.result_url) {
      items.push({
        label: '执行结果',
        children: task.result_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
          <Image src={task.result_url} width={200} />
        ) : (
          <a href={task.result_url} target="_blank" rel="noopener noreferrer">
            {task.result_url}
          </a>
        ),
      });
    }

    if (task.error_log) {
      items.push({
        label: '错误日志',
        children: (
          <div style={{ color: 'red', maxHeight: 200, overflow: 'auto' }}>
            {task.error_log}
          </div>
        ),
      });
    }

    items.push({
      label: '输入参数',
      children: (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <ReactJson
            src={task.input_data}
            collapsed={false}
            displayDataTypes={false}
            enableClipboard={true}
            name={false}
          />
        </div>
      ),
    });

    return items.map((item, index) => (
      <Descriptions.Item key={index} label={item.label}>
        {item.children}
      </Descriptions.Item>
    ));
  };

  return (
    <Drawer
      title={`任务详情 #${task.ID}`}
      width={600}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          {task.status === 1 && (
            <Button type="primary" onClick={() => onApprove?.(task.ID)}>
              审核通过
            </Button>
          )}
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
    >
      <Descriptions column={1} bordered>
        {renderItems()}
      </Descriptions>
    </Drawer>
  );
};

export default TaskDetail;
