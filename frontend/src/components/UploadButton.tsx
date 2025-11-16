import React from 'react';
import { Upload, Button, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface UploadButtonProps extends UploadProps {
  text?: string;
  hint?: string;
  dragger?: boolean;
  icon?: React.ReactNode;
}

/**
 * Premium Upload Button Component
 * Styled upload with drag-and-drop support
 */
export const UploadButton: React.FC<UploadButtonProps> = ({
  text = 'Upload File',
  hint = 'Click or drag file to this area to upload',
  dragger = false,
  icon,
  ...uploadProps
}) => {
  const defaultProps: UploadProps = {
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload
    },
    ...uploadProps,
  };

  if (dragger) {
    return (
      <Dragger
        {...defaultProps}
        style={{
          borderRadius: 8,
          borderColor: '#d8dfe6',
          background: '#fafafa',
          ...uploadProps.style,
        }}
      >
        <p className="ant-upload-drag-icon">
          {icon || <InboxOutlined style={{ color: '#0a0d54' }} />}
        </p>
        <p
          className="ant-upload-text"
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#111111',
          }}
        >
          {text}
        </p>
        <p
          className="ant-upload-hint"
          style={{
            fontSize: 14,
            color: '#64748b',
          }}
        >
          {hint}
        </p>
      </Dragger>
    );
  }

  return (
    <Upload {...defaultProps}>
      <Button icon={icon || <UploadOutlined />} size="large">
        {text}
      </Button>
    </Upload>
  );
};

export default UploadButton;
