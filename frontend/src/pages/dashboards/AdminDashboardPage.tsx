import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Spin, Alert } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  UserOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { getAdminDashboard, AdminDashboardStats } from '../../api/dashboardApi';

const { Title, Text } = Typography;

export const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
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
            <Title level={2}>Admin Dashboard</Title>
            <Text type="secondary">{data.organizationInfo.name}</Text>
          </div>

          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Organization</Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {data.organizationInfo.name}
                </Title>
              </Col>
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Created</Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {new Date(data.organizationInfo.createdAt).toLocaleDateString()}
                </Title>
              </Col>
            </Row>
          </Card>

          <Title level={4}>Employee Statistics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Employees"
                  value={data.stats.totalEmployees}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Active Employees"
                  value={data.stats.activeEmployees}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Inactive Employees"
                  value={data.stats.inactiveEmployees}
                  prefix={<UserDeleteOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="New (Last 30 Days)"
                  value={data.stats.newEmployeesLast30Days}
                  prefix={<UserAddOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Title level={4}>Document Statistics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Documents"
                  value={data.stats.totalDocuments}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Pending Requests"
                  value={data.stats.pendingDocumentRequests}
                  prefix={<InboxOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Completed Requests"
                  value={data.stats.completedDocumentRequests}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};
