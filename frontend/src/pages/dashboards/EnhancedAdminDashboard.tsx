import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Avatar, List, Calendar, Badge, Segmented } from 'antd';
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
} from '@ant-design/icons';
import { StatisticCard } from '../../components/StatisticCard';
import { DashboardChart } from '../../components/DashboardChart';
import { PremiumCard } from '../../components/PremiumCard';
import { gradients } from '../../theme/premiumTheme';
import './EnhancedAdminDashboard.css';

/**
 * Enhanced Admin Dashboard
 * Premium, analytics-rich dashboard with real-time metrics
 */
export const EnhancedAdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with real API calls
  const stats = {
    totalEmployees: 1247,
    activeEmployees: 1189,
    onLeave: 42,
    newHires: 16,
    pendingApprovals: 28,
    attendanceRate: 94.5,
  };

  const attendanceData = [
    { name: 'Mon', present: 1180, absent: 67 },
    { name: 'Tue', present: 1165, absent: 82 },
    { name: 'Wed', present: 1192, absent: 55 },
    { name: 'Thu', present: 1175, absent: 72 },
    { name: 'Fri', present: 1188, absent: 59 },
  ];

  const leaveData = [
    { name: 'Sick', value: 145 },
    { name: 'Casual', value: 89 },
    { name: 'Earned', value: 67 },
    { name: 'Comp Off', value: 34 },
    { name: 'Maternity', value: 12 },
  ];

  const departmentData = [
    { name: 'Engineering', employees: 487, growth: 8.2 },
    { name: 'Sales', employees: 234, growth: 12.5 },
    { name: 'Marketing', employees: 156, growth: -2.1 },
    { name: 'HR', employees: 89, growth: 5.3 },
    { name: 'Finance', employees: 67, growth: 3.7 },
    { name: 'Operations', employees: 214, growth: 6.8 },
  ];

  const recentActivities = [
    { type: 'leave', user: 'John Doe', action: 'applied for sick leave', time: '2 min ago', status: 'pending' },
    { type: 'attendance', user: 'Jane Smith', action: 'requested attendance regularization', time: '15 min ago', status: 'approved' },
    { type: 'timesheet', user: 'Mike Johnson', action: 'submitted weekly timesheet', time: '32 min ago', status: 'pending' },
    { type: 'document', user: 'Sarah Williams', action: 'uploaded offer letter', time: '1 hour ago', status: 'approved' },
    { type: 'expense', user: 'Tom Brown', action: 'claimed travel expenses', time: '2 hours ago', status: 'pending' },
  ];

  const upcomingEvents = [
    { date: '2025-11-20', title: 'Team Building Event', type: 'event' },
    { date: '2025-11-22', title: 'Performance Review Deadline', type: 'deadline' },
    { date: '2025-11-25', title: 'Payroll Processing', type: 'payroll' },
    { date: '2025-11-28', title: 'Thanksgiving Holiday', type: 'holiday' },
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

  return (
    <div className="enhanced-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
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
      </div>

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
