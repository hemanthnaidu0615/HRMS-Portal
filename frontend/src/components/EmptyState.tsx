import React from 'react';
import { Empty, Button, Space } from 'antd';
import type { EmptyProps } from 'antd';

interface EmptyStateProps extends EmptyProps {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * Premium Empty State Component
 * Polished empty state with optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No Data',
  subtitle,
  action,
  ...emptyProps
}) => {
  return (
    <div
      style={{
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Icon */}
        {icon ? (
          <div
            style={{
              fontSize: 64,
              color: '#cbd5e1',
            }}
          >
            {icon}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={null}
            {...emptyProps}
          />
        )}

        {/* Text */}
        <Space direction="vertical" size={8}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#64748b',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 14,
                color: '#94a3b8',
              }}
            >
              {subtitle}
            </div>
          )}
        </Space>

        {/* Action */}
        {action && (
          <Button
            type="primary"
            icon={action.icon}
            onClick={action.onClick}
            size="large"
          >
            {action.text}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default EmptyState;
