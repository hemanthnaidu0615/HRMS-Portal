import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import './StatisticCard.css';

interface StatisticCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  color?: string;
  gradient?: string;
  loading?: boolean;
  progress?: number;
  footer?: React.ReactNode;
}

/**
 * Statistic Card Component
 * Premium card for displaying key metrics and statistics
 */
export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  color = '#1890ff',
  gradient,
  loading = false,
  progress,
  footer,
}) => {
  return (
    <Card
      className="statistic-card"
      loading={loading}
      bodyStyle={{ padding: '24px' }}
      style={{
        background: gradient || 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <div className="statistic-card-header">
            <span
              className="statistic-card-title"
              style={{ color: gradient ? 'white' : 'rgba(0, 0, 0, 0.45)' }}
            >
              {title}
            </span>
            {trend && (
              <span
                className={`statistic-card-trend ${
                  trend.isPositive ? 'positive' : 'negative'
                }`}
                style={{ color: gradient ? 'white' : undefined }}
              >
                {trend.isPositive ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              color: gradient ? 'white' : 'rgba(0, 0, 0, 0.85)',
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: '1.2',
            }}
          />
          {progress !== undefined && (
            <Progress
              percent={progress}
              strokeColor={gradient ? 'white' : color}
              trailColor={gradient ? 'rgba(255,255,255,0.3)' : undefined}
              showInfo={false}
              style={{ marginTop: '12px' }}
            />
          )}
          {footer && (
            <div
              className="statistic-card-footer"
              style={{ color: gradient ? 'rgba(255,255,255,0.8)' : undefined }}
            >
              {footer}
            </div>
          )}
        </Col>
        {icon && (
          <Col>
            <div
              className="statistic-card-icon"
              style={{
                fontSize: '48px',
                color: gradient ? 'rgba(255,255,255,0.8)' : color,
                opacity: 0.8,
              }}
            >
              {icon}
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default StatisticCard;
