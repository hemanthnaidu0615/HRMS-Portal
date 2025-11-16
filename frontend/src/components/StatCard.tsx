import React from 'react';
import { Card, Statistic, Space } from 'antd';
import type { StatisticProps } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps extends StatisticProps {
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  loading?: boolean;
}

/**
 * Premium Stat Card Component
 * Displays key metrics with icons and trends
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  loading = false,
  ...rest
}) => {
  return (
    <Card
      bordered
      loading={loading}
      style={{
        height: '100%',
        borderRadius: 12,
      }}
      bodyStyle={{
        padding: 24,
      }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Icon & Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {title}
          </div>
          {icon && (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#f0f4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#0a0d54',
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{
            fontSize: 32,
            fontWeight: 600,
            color: '#111111',
            lineHeight: 1.2,
          }}
          {...rest}
        />

        {/* Trend */}
        {trend && trendValue && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              color: trend === 'up' ? '#52c41a' : '#ff4d4f',
              fontWeight: 500,
            }}
          >
            {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{trendValue}</span>
            <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last month</span>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default StatCard;
