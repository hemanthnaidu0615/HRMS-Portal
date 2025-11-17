import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Spin, Alert } from 'antd';
import { FileTextOutlined, InboxOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { getEmployeeDashboard, EmployeeDashboardStats } from '../../api/dashboardApi';

const { Title, Text } = Typography;

export const EmployeeDashboardPage = () => {
  const [data, setData] = useState<EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeDashboard();
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
            <Title level={2}>Employee Dashboard</Title>
            <Text type="secondary">Welcome back, {data.employeeInfo.email}</Text>
          </div>

          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Department</Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {data.employeeInfo.department}
                </Title>
              </Col>
              <Col span={8}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Position</Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {data.employeeInfo.position}
                </Title>
              </Col>
              <Col span={8}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>Email</Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {data.employeeInfo.email}
                </Title>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="My Documents"
                  value={data.stats.totalDocuments}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Pending Requests"
                  value={data.stats.pendingDocumentRequests}
                  prefix={<InboxOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Completed Requests"
                  value={data.stats.completedDocumentRequests}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="My Pending Requests"
                  value={data.stats.myPendingRequests}
                  prefix={<SendOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};
