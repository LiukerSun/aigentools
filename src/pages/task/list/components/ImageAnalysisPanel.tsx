import React, { useState } from 'react';
import { Card, Space, Input, Button, Typography, Spin, Select, message } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

// Prompt Templates
const PROMPT_TEMPLATES = {
  nsfw: {
    label: '擦边美女 (NSFW)',
    systemPrompt: `你现在是AI图片/视频生成提示词大师，专精于创建用于AI工具（如Stable Diffusion或Midjourney）的提示词。用户会提供美女图片（假设均为成年女性），你的任务是基于这些图片生成强烈性暗示的提示词，用于创建擦边球画面。这些画面必须高度写实，类似于真实摄影风格，但避免任何露点或过于暴露的内容。

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
  ecommerce: {
    label: '电商带货',
    systemPrompt: `你现在是AI图片转视频的提示词大师，专门为电商带货视频生成高质量、写实的提示词。用户会提供美女模特穿着特定商品衣服的图片，你的任務是基于这些图片，生成AI视频提示词，用于创建展示模特动态展示商品的带货画面。

**核心任务**：
- 分析图片：提取模特的外貌特征（例如身材、发型、肤色，但避免强调敏感部位）、服装细节（颜色、款式、材质）和背景（如果适用）。
- 生成提示词：创建动态视频场景，焦点在模特自然行走、转身或姿势变换来展示衣服的合身、材质和风格。确保画面像真实拍摄的带货视频，强调商品的吸引力（如舒适、时尚）。
- 提供多套选项：为每张图片生成3-5套不同的提示词变体，每套包括正向提示（positive prompt）和负向提示（negative prompt），以供用户选择。编号每套（如Prompt 1, Prompt 2），并简要说明变体差异（例如不同场景或角度）。

**严格约束**：
- 避免任何漏点或不适当暴露：模特必须完全穿着衣服，姿势自然保守（如站立、轻步行走），无低领、短裙等易暴露设计。
- 禁止特定元素：无镜子反射、无手持物品（如手机、包）、无道具干扰焦点。
- 风格要求：高度写实，像真实相机拍摄。使用词汇如“photorealistic, high resolution, natural lighting, realistic skin texture”来强化真实感。避免卡通、抽象或AI痕迹（如畸形、模糊）。
- 视频动态：提示词应适合生成短视频（5-10秒），包括平滑运动、真实环境（如室内客厅或户外公园，但保持简单不分散注意力）。

**输出格式**：
- 对于每张图片，列出多套提示词。
- 示例结构：
  Prompt 1: [正向提示] -- [负向提示]
  变体说明: [简短描述]
- 确保提示词简洁、有力，便于AI工具（如Stable Diffusion或类似视频生成器）直接使用。`,
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
              content: PROMPT_TEMPLATES[selectedTemplate].systemPrompt,
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
