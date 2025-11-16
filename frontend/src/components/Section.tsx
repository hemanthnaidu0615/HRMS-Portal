import React from 'react';
import { Card, Space, Divider } from 'antd';

interface SectionProps {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  bordered?: boolean;
  padding?: number | string;
}

/**
 * Premium Section Component
 * Grouped content with optional title and actions
 */
export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  extra,
  children,
  bordered = true,
  padding = 24,
}) => {
  const content = (
    <>
      {/* Header */}
      {(title || subtitle || extra) && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Space direction="vertical" size={4}>
              {title && (
                <div
                  style={{
                    fontSize: 16,
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
            {extra && <div>{extra}</div>}
          </div>
          <Divider style={{ margin: '16px 0 24px' }} />
        </>
      )}

      {/* Content */}
      {children}
    </>
  );

  if (bordered) {
    return (
      <Card
        bordered
        style={{
          borderRadius: 12,
        }}
        bodyStyle={{
          padding,
        }}
      >
        {content}
      </Card>
    );
  }

  return <div style={{ padding }}>{content}</div>;
};

export default Section;
