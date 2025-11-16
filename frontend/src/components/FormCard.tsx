import React from 'react';
import { Card, Form, Space, Button, Divider } from 'antd';
import type { FormProps } from 'antd';

interface FormCardProps extends FormProps {
  title?: string;
  subtitle?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Premium Form Card Component
 * Consistent form layout with submit/cancel actions
 */
export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  footer,
  children,
  ...formProps
}) => {
  return (
    <Card
      bordered
      style={{
        borderRadius: 12,
        maxWidth: 800,
      }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <>
          <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
            {title && (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#111111',
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontSize: 14,
                  color: '#64748b',
                }}
              >
                {subtitle}
              </div>
            )}
          </Space>
        </>
      )}

      {/* Form */}
      <Form
        layout="vertical"
        requiredMark="optional"
        {...formProps}
      >
        {children}

        {/* Footer */}
        {footer !== null && (
          <>
            <Divider style={{ margin: '24px 0' }} />
            {footer || (
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  {submitText}
                </Button>
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    disabled={loading}
                    size="large"
                  >
                    {cancelText}
                  </Button>
                )}
              </Space>
            )}
          </>
        )}
      </Form>
    </Card>
  );
};

export default FormCard;
