import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Avatar, List, Calendar, Badge, Segmented, Skeleton, Alert } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { StatisticCard } from '../../components/StatisticCard';
import { DashboardChart } from '../../components/DashboardChart';
import { PremiumCard } from '../../components/PremiumCard';
import { gradients } from '../../theme/premiumTheme';
import { getAdminDashboard, AdminDashboardStats } from '../../api/dashboardApi';
import './EnhancedAdminDashboard.css';

/**
 * Enhanced Admin Dashboard
 * Premium, analytics-rich dashboard with real-time metrics from API
 */
export const EnhancedAdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to component format
  const stats = dashboardData ? {
    totalEmployees: dashboardData.stats.totalEmployees,
    activeEmployees: dashboardData.stats.activeEmployees,
    onLeave: 0,
    newHires: dashboardData.stats.newEmployeesLast30Days,
    pendingApprovals: dashboardData.stats.pendingDocumentRequests,
    attendanceRate: dashboardData.stats.totalEmployees > 0
      ? Math.round((dashboardData.stats.activeEmployees / dashboardData.stats.totalEmployees) * 1000) / 10
      : 0,
  } : {
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    newHires: 0,
    pendingApprovals: 0,
    attendanceRate: 0,
  };

  // Transform department distribution from API
  const departmentData = dashboardData?.stats.departmentDistribution
    ? Object.entries(dashboardData.stats.departmentDistribution)
        .map(([name, count]) => ({
          name,
          employees: count,
          growth: 0,
        }))
        .sort((a, b) => b.employees - a.employees)
        .slice(0, 10)
    : [];

  // Transform employment type distribution for chart
  const leaveData = dashboardData?.stats.employmentTypeDistribution
    ? Object.entries(dashboardData.stats.employmentTypeDistribution).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value,
      }))
    : [];

  // Placeholder attendance data (would need attendance API)
  const attendanceData = [
    { name: 'Mon', present: stats.activeEmployees, absent: stats.totalEmployees - stats.activeEmployees },
    { name: 'Tue', present: stats.activeEmployees, absent: stats.totalEmployees - stats.activeEmployees },
    { name: 'Wed', present: stats.activeEmployees, absent: stats.totalEmployees - stats.activeEmployees },
    { name: 'Thu', present: stats.activeEmployees, absent: stats.totalEmployees - stats.activeEmployees },
    { name: 'Fri', present: stats.activeEmployees, absent: stats.totalEmployees - stats.activeEmployees },
  ];

  // Recent activities from API stats
  const recentActivities = dashboardData ? [
    { type: 'employee', user: 'System', action: `${dashboardData.stats.newEmployeesLast30Days} new employees this month`, time: 'Last 30 days', status: 'approved' },
    { type: 'document', user: 'System', action: `${dashboardData.stats.pendingDocumentRequests} pending document requests`, time: 'Current', status: 'pending' },
    { type: 'document', user: 'System', action: `${dashboardData.stats.approvedDocuments} approved documents`, time: 'Total', status: 'approved' },
    { type: 'document', user: 'System', action: `${dashboardData.stats.newDocumentsLast30Days} new documents this month`, time: 'Last 30 days', status: 'approved' },
  ] : [];

  const upcomingEvents = [
    { date: new Date().toISOString().split('T')[0], title: 'Real-time Dashboard Active', type: 'event' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
        return <SyncOutlined spin style={{ color: '#faad14' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="enhanced-admin-dashboard" style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 15 }} />
      </div>
    );
  }

  return (
    <div className="enhanced-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {dashboardData?.organizationInfo?.name
              ? `${dashboardData.organizationInfo.name} - Real-time overview`
              : "Welcome back! Here's what's happening today."}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Segmented
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
              { label: 'Year', value: 'year' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
          <ReloadOutlined
            onClick={loadDashboardData}
            style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
            title="Refresh data"
          />
        </div>
      </div>

      {error && (
        <Alert
          message="Error loading dashboard"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<TeamOutlined />}
            trend={{ value: 8.2, isPositive: true }}
            gradient={gradients.blue}
            progress={75}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Attendance Rate"
            value={stats.attendanceRate}
            suffix="%"
            icon={<ClockCircleOutlined />}
            trend={{ value: 2.3, isPositive: true }}
            gradient={gradients.success}
            progress={stats.attendanceRate}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="On Leave Today"
            value={stats.onLeave}
            icon={<CalendarOutlined />}
            color="#faad14"
            footer={
              <span>
                <RiseOutlined style={{ marginRight: 4 }} />
                12% from last week
              </span>
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<FileTextOutlined />}
            color="#f5222d"
            footer={
              <span>
                <FallOutlined style={{ marginRight: 4 }} />
                8% from yesterday
              </span>
            }
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <DashboardChart
            title="Weekly Attendance Trend"
            type="bar"
            data={attendanceData}
            dataKey="present"
            xKey="name"
            color="#1890ff"
            height={350}
            extra={
              <Tag color="blue">This Week</Tag>
            }
          />
        </Col>
        <Col xs={24} lg={8}>
          <DashboardChart
            title="Leave Distribution"
            type="pie"
            data={leaveData}
            dataKey="value"
            height={350}
          />
        </Col>
      </Row>

      {/* Department Stats & Recent Activities */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <PremiumCard
            title="Department Overview"
            hoverable
            extra={<a href="/admin/structure/departments">View All</a>}
          >
            <Table
              dataSource={departmentData}
              columns={[
                {
                  title: 'Department',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => <strong>{text}</strong>,
                },
                {
                  title: 'Employees',
                  dataIndex: 'employees',
                  key: 'employees',
                  align: 'right',
                },
                {
                  title: 'Growth',
                  dataIndex: 'growth',
                  key: 'growth',
                  align: 'right',
                  render: (value) => (
                    <span style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {value >= 0 ? <RiseOutlined /> : <FallOutlined />}
                      {Math.abs(value)}%
                    </span>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </PremiumCard>
        </Col>

        <Col xs={24} lg={12}>
          <PremiumCard
            title="Recent Activities"
            hoverable
            extra={<a href="/admin/audit-logs">View All</a>}
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <span>
                        <strong>{item.user}</strong> {item.action}
                      </span>
                    }
                    description={item.time}
                  />
                  {getStatusIcon(item.status)}
                </List.Item>
              )}
              size="small"
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Upcoming Events */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <PremiumCard title="Upcoming Events" hoverable>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
              dataSource={upcomingEvents}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    style={{ borderRadius: '8px' }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {item.date}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>{item.title}</h4>
                    <Tag
                      color={
                        item.type === 'holiday' ? 'green' :
                        item.type === 'deadline' ? 'red' :
                        item.type === 'payroll' ? 'orange' : 'blue'
                      }
                      style={{ marginTop: 8 }}
                    >
                      {item.type}
                    </Tag>
                  </Card>
                </List.Item>
              )}
            />
          </PremiumCard>
        </Col>
      </Row>
    </div>
  );
};

export default EnhancedAdminDashboard;
