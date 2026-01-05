import React from 'react';
import {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  ProFormField,
} from '@ant-design/pro-components';
import { Collapse } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { AIModelConfig, ModelParameter } from '@/services/api/v1/models/type';

interface DynamicApiFormProps {
  schema: AIModelConfig;
}

const renderField = (param: ModelParameter) => {
  const key = param.name;
  const commonProps = {
    name: param.name,
    label: param.name,
    tooltip: param.description,
    placeholder: param.example ? `Example: ${param.example}` : undefined,
    rules: [{ required: param.required, message: `Please enter ${param.name}` }],
  };

  // If type is select or options are provided, use ProFormSelect
  if (param.type === 'select' || (param.options && param.options.length > 0)) {
    return (
      <ProFormSelect
        key={key}
        {...commonProps}
        options={param.options?.map((opt) => ({ label: String(opt), value: opt })) || []}
      />
    );
  }

  switch (param.type) {
    case 'boolean':
      return <ProFormSwitch key={key} {...commonProps} />;
    case 'integer':
    case 'number':
    case 'uint32':
      return <ProFormDigit key={key} {...commonProps} />;
    case 'textarea':
      return <ProFormTextArea key={key} {...commonProps} />;
    case 'string':
      if (
        param.name.toLowerCase().includes('image') ||
        param.name.toLowerCase().includes('avatar') ||
        param.name.toLowerCase().includes('logo') ||
        param.name.toLowerCase().includes('icon')
      ) {
        return (
          <ProFormField key={key} {...commonProps}>
            <AliyunOSSUpload />
          </ProFormField>
        );
      }
      // If the description implies a long text, we might want TextArea, but generally Text is safer
      return <ProFormText key={key} {...commonProps} />;
    case 'array':
      // For array, if it's simple array of strings/numbers, maybe a select with mode tags?
      // Or just a text input for now.
      // User example didn't show array input details, but config parser had it.
      return <ProFormSelect key={key} {...commonProps} mode="tags" />;
    case 'object':
      // Object is complex. For now, use TextArea to input JSON?
      return <ProFormTextArea key={key} {...commonProps} fieldProps={{ rows: 4 }} placeholder="Enter JSON object" />;
    default:
      return <ProFormText key={key} {...commonProps} />;
  }
};

const DynamicApiForm: React.FC<DynamicApiFormProps> = (props) => {
  const { schema } = props || {};
  if (!schema) return null;

  const renderSection = (params: ModelParameter[], title?: string) => {
    if (!params || params.length === 0) return null;

    const required = params.filter((p) => p.required);
    const optional = params.filter((p) => !p.required);

    return (
      <div style={{ marginBottom: 24 }}>
        {title && <h3>{title}</h3>}
        {required.map(renderField)}
        {optional.length > 0 && (
          <Collapse
            ghost
            items={[
              {
                key: 'advanced',
                label: '高级设置',
                children: optional.map(renderField),
              },
            ]}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {renderSection(schema.request_body)}
    </>
  );
};

export default DynamicApiForm;
