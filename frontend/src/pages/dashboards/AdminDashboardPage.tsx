import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Skeleton, Alert, Tag, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  RiseOutlined,
  ApartmentOutlined,
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
        <Skeleton active paragraph={{ rows: 6 }} />
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
          action={<a onClick={loadDashboard}>Retry</a>}
        />
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, organizationInfo } = dashboardData;

  // Process department distribution
  const departmentStats: DepartmentStat[] = Object.entries(stats.departmentDistribution || {})
    .map(([name, count]) => ({
      name,
      count: Number(count),
      percentage: (Number(count) / stats.totalEmployees) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 only

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

  const StatCard = ({ title, value, icon, color, suffix, trend }: any) => (
    <Card
      bordered={false}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            {title}
          </Text>
          <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
            {value}
            {suffix && <span style={{ fontSize: 14, color: '#999', marginLeft: 4 }}>{suffix}</span>}
          </div>
          {trend && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
              <RiseOutlined /> {trend}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 32,
          color: color + '40',
          lineHeight: 1,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, marginBottom: 4 }}>{organizationInfo.name}</Title>
        <Text type="secondary">Organization Dashboard</Text>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Key Metrics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<UserOutlined />}
              color="#1890ff"
              trend={stats.newEmployeesLast30Days > 0 ? `+${stats.newEmployeesLast30Days} this month` : null}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Departments"
              value={stats.departmentCount}
              icon={<ApartmentOutlined />}
              color="#52c41a"
              suffix={stats.departmentCount > 0 ? `· ${(stats.totalEmployees / stats.departmentCount).toFixed(0)} avg` : null}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="On Probation"
              value={stats.onProbation}
              icon={<ClockCircleOutlined />}
              color="#fa8c16"
              suffix={stats.totalEmployees > 0 ? `· ${((stats.onProbation / stats.totalEmployees) * 100).toFixed(0)}%` : null}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments}
              icon={<FileTextOutlined />}
              color="#722ed1"
              trend={stats.newDocumentsLast30Days > 0 ? `+${stats.newDocumentsLast30Days} this month` : null}
            />
          </Col>
        </Row>

        {/* Document & Request Stats */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="Pending Docs"
                value={stats.pendingDocuments}
                prefix={<InboxOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 20, color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="Approved"
                value={stats.approvedDocuments}
                prefix={<CheckCircleOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 20, color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="Pending Requests"
                value={stats.pendingDocumentRequests}
                prefix={<ClockCircleOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 20, color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="Completed"
                value={stats.completedDocumentRequests}
                prefix={<CheckCircleOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 20, color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Distribution Charts */}
        <Row gutter={16}>
          {/* Department Distribution */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span>Top Departments</span>
                </Space>
              }
              bordered={false}
              size="small"
            >
              {departmentStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <TeamOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                  <div style={{ fontSize: 13 }}>No departments yet</div>
                </div>
              ) : (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {departmentStats.map(dept => (
                    <div key={dept.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13 }}>{dept.name}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {dept.count} · {dept.percentage.toFixed(0)}%
                        </Text>
                      </div>
                      <Progress
                        percent={dept.percentage}
                        showInfo={false}
                        strokeColor="#1890ff"
                        strokeWidth={6}
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
              title={
                <Space>
                  <UserOutlined />
                  <span>Employment Types</span>
                </Space>
              }
              bordered={false}
              size="small"
            >
              {employmentTypeStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <UserOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                  <div style={{ fontSize: 13 }}>No data available</div>
                </div>
              ) : (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {employmentTypeStats.map(type => (
                    <div key={type.type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#fafafa',
                      borderRadius: 6,
                    }}>
                      <Space size="small">
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: type.color,
                        }} />
                        <Text style={{ fontSize: 13, textTransform: 'capitalize' }}>
                          {type.type}
                        </Text>
                      </Space>
                      <Space size="small">
                        <Tag color={type.color} style={{ margin: 0, fontSize: 12 }}>
                          {type.count}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 13, minWidth: 40, textAlign: 'right' }}>
                          {((type.count / stats.totalEmployees) * 100).toFixed(0)}%
                        </Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};
