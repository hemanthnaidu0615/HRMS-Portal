import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Skeleton, Alert, Tag, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { getAdminDashboard, AdminDashboardStats } from '../../api/dashboardApi';

const { Title, Text } = Typography;

interface DepartmentStat {
  name: string;
  count: number;
  percentage: number;
}

interface EmploymentTypeStat {
  type: string;
  count: number;
  color: string;
}

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      setDashboardData(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={loadDashboard}>Retry</a>
          }
        />
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, organizationInfo } = dashboardData;

  // Process department distribution
  const departmentStats: DepartmentStat[] = Object.entries(stats.departmentDistribution || {})
    .map(([name, count]) => ({
      name,
      count: Number(count),
      percentage: (Number(count) / stats.totalEmployees) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Process employment type distribution
  const employmentTypeColors: Record<string, string> = {
    internal: '#52c41a',
    client: '#1890ff',
    contract: '#fa8c16',
    bench: '#f5222d',
    'Not Set': '#d9d9d9',
  };

  const employmentTypeStats: EmploymentTypeStat[] = Object.entries(stats.employmentTypeDistribution || {})
    .map(([type, count]) => ({
      type,
      count: Number(count),
      color: employmentTypeColors[type] || '#d9d9d9',
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">{organizationInfo.name} • Overview & Analytics</Text>
        </div>

        {/* Key Metrics - Row 1 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
              <Statistic
                title="Total Employees"
                value={stats.totalEmployees}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontWeight: 600 }}
              />
              {stats.newEmployeesLast30Days > 0 && (
                <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
                  <RiseOutlined /> +{stats.newEmployeesLast30Days} this month
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16' }}>
              <Statistic
                title="On Probation"
                value={stats.onProbation}
                prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16', fontWeight: 600 }}
                suffix={<span style={{ fontSize: 14, color: '#666' }}>/ {stats.totalEmployees}</span>}
              />
              {stats.totalEmployees > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {((stats.onProbation / stats.totalEmployees) * 100).toFixed(1)}% of workforce
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
              <Statistic
                title="Departments"
                value={stats.departmentCount}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 600 }}
              />
              {stats.departmentCount > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  Avg: {(stats.totalEmployees / stats.departmentCount).toFixed(1)} per dept
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12, borderLeft: '4px solid #722ed1' }}>
              <Statistic
                title="Total Documents"
                value={stats.totalDocuments}
                prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: 600 }}
              />
              {stats.newDocumentsLast30Days > 0 && (
                <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
                  <RiseOutlined /> +{stats.newDocumentsLast30Days} this month
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Document Stats - Row 2 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12 }}>
              <Statistic
                title="Pending Approval"
                value={stats.pendingDocuments}
                prefix={<InboxOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12 }}>
              <Statistic
                title="Approved Documents"
                value={stats.approvedDocuments}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12 }}>
              <Statistic
                title="Pending Requests"
                value={stats.pendingDocumentRequests}
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: 12 }}>
              <Statistic
                title="Completed Requests"
                value={stats.completedDocumentRequests}
                prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Distribution Charts */}
        <Row gutter={[16, 16]}>
          {/* Department Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={<span><TeamOutlined /> Employees by Department</span>}
              style={{ borderRadius: 12, height: '100%' }}
            >
              {departmentStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                  <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>No departments created yet</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    Create departments to organize your team
                  </div>
                </div>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {departmentStats.map(dept => (
                    <div key={dept.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>{dept.name}</Text>
                        <Text type="secondary">
                          {dept.count} ({dept.percentage.toFixed(1)}%)
                        </Text>
                      </div>
                      <Progress
                        percent={dept.percentage}
                        showInfo={false}
                        strokeColor={{
                          '0%': '#1890ff',
                          '100%': '#52c41a',
                        }}
                        strokeWidth={12}
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>

          {/* Employment Type Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={<span><UserOutlined /> Employment Type Distribution</span>}
              style={{ borderRadius: 12, height: '100%' }}
            >
              {employmentTypeStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                  <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>No employment types set</div>
                </div>
              ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {employmentTypeStats.map(type => (
                    <div key={type.type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#fafafa',
                      borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: type.color,
                          }}
                        />
                        <Text strong style={{ textTransform: 'capitalize' }}>
                          {type.type}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Tag color={type.color} style={{ margin: 0, fontSize: 14, padding: '4px 12px' }}>
                          {type.count}
                        </Tag>
                        <Text type="secondary" style={{ minWidth: '60px', textAlign: 'right', fontSize: 16 }}>
                          {((type.count / stats.totalEmployees) * 100).toFixed(1)}%
                        </Text>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* Probation Alert */}
        {stats.onProbation > 0 && (
          <Card style={{ borderRadius: 12, borderLeft: '4px solid #fa8c16' }}>
            <Row gutter={16} align="middle">
              <Col>
                <ClockCircleOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
              </Col>
              <Col flex="auto">
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  Probation Period Active
                </div>
                <Text type="secondary">
                  {stats.onProbation} {stats.onProbation === 1 ? 'employee is' : 'employees are'} currently on probation period.
                  Monitor their progress and complete evaluations on time.
                </Text>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};
