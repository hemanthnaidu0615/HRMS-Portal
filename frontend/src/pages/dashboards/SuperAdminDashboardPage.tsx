import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Spin, Alert } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { getSuperAdminDashboard, SuperAdminDashboardStats } from '../../api/dashboardApi';

const { Title, Text } = Typography;

export const SuperAdminDashboardPage = () => {
  const [data, setData] = useState<SuperAdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getSuperAdminDashboard();
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Super Admin Dashboard</Title>
            <Text type="secondary">System Overview</Text>
          </div>

          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col span={24}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  HRMS Platform Statistics
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Complete system overview and metrics
                </Text>
              </Col>
            </Row>
          </Card>

          <Title level={4}>Organization Statistics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Organizations"
                  value={data.stats.totalOrganizations}
                  prefix={<BankOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Active Organizations"
                  value={data.stats.activeOrganizations}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Inactive Organizations"
                  value={data.stats.inactiveOrganizations}
                  prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="New (Last 30 Days)"
                  value={data.stats.newOrganizationsLast30Days}
                  prefix={<PlusCircleOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Title level={4}>Employee Statistics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Employees (All Organizations)"
                  value={data.stats.totalEmployees}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};
