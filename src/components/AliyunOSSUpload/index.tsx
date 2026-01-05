import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Upload, App, Modal, message as globalMessage } from 'antd';
import { LoadingOutlined, PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import OSS from 'ali-oss';
import { getOssStsToken } from '@/services/api/v1/common/api';

// --- 类型定义 ---
interface STSTokenResponse {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  stsToken?: string;
  securityToken?: string;
  bucket: string;
  endpoint?: string;
}

interface AliyunOSSUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  width?: number | string;
  height?: number | string;
  disabled?: boolean;
  /** 限制文件大小 (MB)，默认 5MB */
  maxSize?: number;
  /** 上传目录前缀，例如 'avatars/' */
  dir?: string;
  /** Bucket 类型：'public' (公共读，生成永久链接) | 'private' (私有，生成带签名链接) */
  bucketType?: 'public' | 'private';
}

const AliyunOSSUpload: React.FC<AliyunOSSUploadProps> = ({
  value,
  onChange,
  width = 104,
  height = 104,
  disabled,
  maxSize = 5,
  dir = 'uploads/',
  bucketType = 'public', // 默认公共读，方便展示
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);
  const [isFocused, setIsFocused] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 使用 Antd v5 的 App hook，如果不在 App 上下文外使用，保留 globalMessage 兜底
  const { message } = App.useApp ? App.useApp() : { message: globalMessage };

  // 同步外部 value 变化
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  /**
   * 核心上传逻辑
   */
  const uploadToOSS = async (file: File | RcFile) => {
    try {
      setLoading(true);

      // 1. 获取 STS Token
      const res = await getOssStsToken();
      // 适配不同的后端返回结构 (data.data 或 直接 data)
      const stsConfig: STSTokenResponse = (res as any)?.data || res;

      if (!stsConfig?.accessKeyId || !stsConfig?.accessKeySecret) {
        throw new Error('获取上传凭证失败: 凭证无效');
      }

      // 2. 初始化 OSS Client
      const client = new OSS({
        region: stsConfig.region,
        accessKeyId: stsConfig.accessKeyId,
        accessKeySecret: stsConfig.accessKeySecret,
        stsToken: stsConfig.securityToken || stsConfig.stsToken,
        bucket: stsConfig.bucket,
        endpoint: stsConfig.endpoint,
        secure: true,
      });

      // 3. 生成唯一文件名
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).slice(2, 8);
      // 确保 dir 以 / 结尾，且不以 / 开头（视 OSS 习惯而定，通常 path 不带前导 /）
      const normalizedDir = dir.endsWith('/') ? dir : `${dir}/`;
      const objectName = `${normalizedDir}${timestamp}_${randomStr}.${ext}`;

      // 4. 执行上传
      const result = await client.put(objectName, file);

      // 5. 生成最终 URL
      let finalUrl = '';

      if (bucketType === 'private') {
        // 私有 Bucket：必须使用签名 URL (注意：此处过期时间较短，业务需考虑是否只存 Path)
        finalUrl = client.signatureUrl(result.name, { expires: 3600 });
      } else {
        // 公共 Bucket：拼接永久 URL
        // 优先使用 result.url，如果 result.url 包含签名参数则手动剔除或手动拼接
        // 手动拼接最稳妥： https://bucket-name.endpoint/object-name
        if (result.url) {
          // 简单处理：如果是公共读，ali-oss 返回的 url 有时也会带签名，或者直接是 url
          // 这里建议手动拼接以确保干净
          const urlObj = new URL(result.url);
          finalUrl = `${urlObj.origin}${urlObj.pathname}`;
        } else {
          // 降级拼接
          finalUrl = `https://${stsConfig.bucket}.${stsConfig.region}.aliyuncs.com/${objectName}`;
        }
      }

      // 强制 HTTPS
      if (finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace('http://', 'https://');
      }

      setImageUrl(finalUrl);
      onChange?.(finalUrl);
      message.success('上传成功');
    } catch (error) {
      console.error('Upload failed:', error);
      message.error(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 上传前校验
   */
  const beforeUpload = (file: RcFile) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const isValidType = validTypes.includes(file.type);

    if (!isValidType) {
      message.error('只支持 JPG/PNG/GIF/WEBP 格式图片!');
      return Upload.LIST_IGNORE;
    }

    const isLtSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtSize) {
      message.error(`图片大小不能超过 ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }

    // 手动接管上传
    uploadToOSS(file);
    return false; // 阻止 Antd 默认上传行为
  };

  /**
   * 粘贴处理
   */
  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled || loading) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          event.preventDefault();
          uploadToOSS(file as RcFile); // 类型断言适配
          break;
        }
      }
    }
  }, [disabled, loading, dir]); // 添加依赖

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(undefined);
    onChange?.('');
  };

  // --- 样式对象 (避免内联样式过于混乱) ---
  const styles = {
    wrapper: {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      width,
      height,
      border: `1px dashed ${isFocused ? '#40a9ff' : '#d9d9d9'}`,
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s',
      backgroundColor: disabled ? '#f5f5f5' : '#fff',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    previewOverlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      transition: 'opacity 0.3s',
      opacity: 0, // 默认隐藏，通过 CSS hover 类或内联 hover 处理
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      display: 'block',
    }
  };

  const uploadButton = (
    <div style={{ textAlign: 'center', color: disabled ? 'rgba(0,0,0,0.25)' : 'inherit' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {loading ? '上传中' : '上传/粘贴'}
      </div>
    </div>
  );

  return (
    <>
      <div
        className="aliyun-oss-upload-container" // 方便外部覆盖样式
        onPaste={handlePaste}
        tabIndex={disabled ? -1 : 0}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.wrapper}
      >
        <Upload
          name="file"
          listType="picture-card" // 保持样式结构但不使用默认列表
          showUploadList={false}
          beforeUpload={beforeUpload}
          disabled={disabled || loading}
          // 覆盖 Antd 默认样式以填满容器
          style={{ width: '100%', height: '100%' }}
        >
          {imageUrl && !loading ? (
            <div className="custom-image-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img src={imageUrl} alt="uploaded" style={styles.img} />

              {/* 遮罩层 */}
              {!disabled && (
                <div
                  className="actions-mask"
                  style={styles.previewOverlay}
                  // 使用简单的 DOM 事件处理 hover，或者推荐使用 CSS Module 的 :hover
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <EyeOutlined
                    style={{ color: '#fff', fontSize: '18px' }}
                    onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
                  />
                  <DeleteOutlined
                    style={{ color: '#fff', fontSize: '18px' }}
                    onClick={handleRemove}
                  />
                </div>
              )}
            </div>
          ) : (
            uploadButton
          )}
        </Upload>
      </div>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={600}
      >
        <img alt="preview" style={{ width: '100%' }} src={imageUrl} />
      </Modal>

      {/* 补充一点全局样式修正，用于清除 Antd Upload 默认的内边距导致的对齐问题 */}
      <style>{`
        .aliyun-oss-upload-container .ant-upload-select {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          border: none !important;
          background: transparent !important;
        }
        .aliyun-oss-upload-container .ant-upload {
          color: inherit;
        }
      `}</style>
    </>
  );
};

export default AliyunOSSUpload;