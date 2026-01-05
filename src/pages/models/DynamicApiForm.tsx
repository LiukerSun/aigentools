import React from 'react';
import {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Collapse } from 'antd';
import { AIModelConfig, ModelParameter } from '@/services/api/v1/models/type';

interface DynamicApiFormProps {
  schema: AIModelConfig;
}

const renderField = (param: ModelParameter) => {
  const commonProps = {
    key: param.name,
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
        {...commonProps}
        options={param.options?.map((opt) => ({ label: String(opt), value: opt })) || []}
      />
    );
  }

  switch (param.type) {
    case 'boolean':
      return <ProFormSwitch {...commonProps} />;
    case 'integer':
    case 'number':
    case 'uint32':
      return <ProFormDigit {...commonProps} />;
    case 'textarea':
      return <ProFormTextArea {...commonProps} />;
    case 'string':
      // If the description implies a long text, we might want TextArea, but generally Text is safer
      return <ProFormText {...commonProps} />;
    case 'array':
      // For array, if it's simple array of strings/numbers, maybe a select with mode tags?
      // Or just a text input for now.
      // User example didn't show array input details, but config parser had it.
      return <ProFormSelect {...commonProps} mode="tags" />;
    case 'object':
      // Object is complex. For now, use TextArea to input JSON?
      return <ProFormTextArea {...commonProps} fieldProps={{ rows: 4 }} placeholder="Enter JSON object" />;
    default:
      return <ProFormText {...commonProps} />;
  }
};

const DynamicApiForm: React.FC<DynamicApiFormProps> = ({ schema }) => {
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
          <Collapse ghost>
            <Collapse.Panel header="高级设置" key="advanced">
              {optional.map(renderField)}
            </Collapse.Panel>
          </Collapse>
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
