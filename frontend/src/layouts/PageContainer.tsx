import React from 'react';
import { Breadcrumb, Typography, Space, Flex } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
  loading?: boolean;
}

/**
 * Premium Page Container Component
 * Consistent page header with breadcrumbs, title, and actions
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  extra,
  loading = false,
}) => {
  const breadcrumbItems = breadcrumbs?.map((item, index) => ({
    title: item.path ? (
      <Link to={item.path}>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </Link>
    ) : (
      <>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </>
    ),
  }));

  return (
    <div
      style={{
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined style={{ marginRight: 4 }} />
                  Home
                </Link>
              ),
            },
            ...breadcrumbItems,
          ]}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Page Header */}
      <Flex
        justify="space-between"
        align="flex-start"
        gap={16}
        wrap="wrap"
        style={{
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size={4}>
          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 600,
              color: '#111111',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                color: '#64748b',
              }}
            >
              {subtitle}
            </Text>
          )}
        </Space>

        {extra && <div>{extra}</div>}
      </Flex>

      {/* Page Content */}
      {loading ? (
        <div
          style={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Space direction="vertical" align="center" size={16}>
            <div className="loading-spinner" />
            <Text type="secondary">Loading...</Text>
          </Space>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default PageContainer;
