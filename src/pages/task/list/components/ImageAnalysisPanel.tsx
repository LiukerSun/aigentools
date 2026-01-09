import React, { useState } from 'react';
import { Card, Space, Input, Button, Typography, Spin, Select, message } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { analyzeImage } from '@/services/api/v1/ai-assistant/api';

const { Paragraph, Text } = Typography;

// Prompt Templates
const PROMPT_TEMPLATES = {
  nsfw: {
    label: '擦边美女 (NSFW)',
  },
  ecommerce: {
    label: '电商带货',
  },
};

const ImageAnalysisPanel: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PROMPT_TEMPLATES>('nsfw');

  const handleAnalyzeImage = async () => {
    if (!imageUrl) {
      message.warning('请先输入图片链接');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult('');

    try {
      const response = await analyzeImage({
        imageUrl,
        template: selectedTemplate,
      });

      if (response && response.data && response.data.result) {
        setAnalysisResult(response.data.result);
        message.success('识别完成');
      } else {
        message.error(response?.message || '识别失败');
      }
    } catch (error) {
      console.error('Network Error:', error);
      message.error('网络请求失败');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card
      size="small"
      title={<Space><RobotOutlined /> AI 灵感助手</Space>}
      style={{ height: '100%', display: 'flex', flexDirection: 'column',width:'100%' }}
      bodyStyle={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          选择场景并输入图片链接，让 AI 帮你生成提示词。
        </Text>
        
        <Select
          style={{ width: '100%' }}
          value={selectedTemplate}
          onChange={setSelectedTemplate}
          options={Object.entries(PROMPT_TEMPLATES).map(([key, value]) => ({
            label: value.label,
            value: key,
          }))}
        />

        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="图片 URL"
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

        {analyzing && <div style={{ textAlign: 'center', padding: 10 }}><Spin tip="AI 正在思考..." /></div>}

        {analysisResult && (
          <div style={{ marginTop: 10, padding: 10, background: '#f5f5f5', borderRadius: 6, border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text strong>识别结果：</Text>
            </div>
            <Paragraph
              copyable
              style={{ marginBottom: 0, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}
            >
              {analysisResult}
            </Paragraph>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageAnalysisPanel;
