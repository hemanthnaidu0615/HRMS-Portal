import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Space, List, Avatar, Tag, Typography } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RightOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../layouts/PageContainer';
import { StatCard } from '../../components/StatCard';
import { Section } from '../../components/Section';
import { useAuth } from '../../auth/useAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

/**
 * Premium Employee Dashboard
 * Modern, widget-based dashboard with quick actions
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    myDocuments: 12,
    pendingRequests: 3,
    teamMembers: 8,
    upcomingEvents: 2,
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'document',
      title: 'Employment Contract uploaded',
      description: 'Uploaded by HR Department',
      time: dayjs().subtract(2, 'hours').toISOString(),
      icon: <FileTextOutlined style={{ color: '#0a0d54' }} />,
    },
    {
      id: '2',
      type: 'request',
      title: 'Document request from colleague',
      description: 'Requesting Tax Declaration',
      time: dayjs().subtract(5, 'hours').toISOString(),
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    },
    {
      id: '3',
      type: 'team',
      title: 'New team member joined',
      description: 'Sarah Johnson joined Engineering',
      time: dayjs().subtract(1, 'day').toISOString(),
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Request Document',
      description: 'Request a document from colleague',
      icon: <FileTextOutlined />,
      onClick: () => navigate('/document-requests/create'),
      color: '#667eea',
    },
    {
      title: 'Upload Document',
      description: 'Add a new document to your profile',
      icon: <PlusOutlined />,
      onClick: () => navigate('/documents/upload'),
      color: '#0a0d54',
    },
    {
      title: 'View My Documents',
      description: 'Access all your documents',
      icon: <EyeOutlined />,
      onClick: () => navigate('/documents/me'),
      color: '#1890ff',
    },
    {
      title: 'Incoming Requests',
      description: 'View document requests you received',
      icon: <ClockCircleOutlined />,
      onClick: () => navigate('/document-requests/incoming'),
      color: '#52c41a',
    },
  ];

  return (
    <PageContainer
      title={`Welcome back, ${user?.email?.split('@')[0] || 'User'}!`}
      subtitle="Here's what's happening with your account today."
      loading={loading}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Stats Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="My Documents"
              value={stats.myDocuments}
              icon={<FileTextOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon={<ClockCircleOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Team Members"
              value={stats.teamMembers}
              icon={<TeamOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Upcoming Events"
              value={stats.upcomingEvents}
              icon={<CalendarOutlined />}
              loading={loading}
            />
          </Col>
        </Row>

        {/* Quick Actions */}
        <Section title="Quick Actions" bordered>
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  onClick={action.onClick}
                  style={{
                    height: '100%',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  bodyStyle={{
                    padding: 20,
                  }}
                  className="card-hover"
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: `${action.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#111111',
                          marginBottom: 4,
                        }}
                      >
                        {action.title}
                      </div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {action.description}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Section>

        {/* Two Column Layout */}
        <Row gutter={[16, 16]}>
          {/* Recent Activity */}
          <Col xs={24} lg={14}>
            <Section
              title="Recent Activity"
              subtitle="Latest updates and notifications"
              extra={
                <Button type="link" icon={<RightOutlined />} iconPosition="end">
                  View All
                </Button>
              }
              bordered
            >
              <List
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item style={{ padding: '16px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          style={{
                            background: '#f0f4ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.icon}
                        </Avatar>
                      }
                      title={
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>
                          {item.title}
                        </span>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {item.description}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.time).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Section>
          </Col>

          {/* Pending Tasks */}
          <Col xs={24} lg={10}>
            <Section
              title="Pending Tasks"
              subtitle="Action items requiring attention"
              bordered
            >
              <List
                dataSource={[
                  {
                    id: '1',
                    title: 'Review document request',
                    tag: 'Urgent',
                    tagColor: 'error',
                  },
                  {
                    id: '2',
                    title: 'Update profile information',
                    tag: 'Important',
                    tagColor: 'warning',
                  },
                  {
                    id: '3',
                    title: 'Complete onboarding checklist',
                    tag: 'Pending',
                    tagColor: 'default',
                  },
                ]}
                renderItem={(item) => (
                  <List.Item
                    extra={
                      <Button type="link" size="small">
                        View
                      </Button>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span style={{ fontSize: 14, color: '#111111' }}>{item.title}</span>
                          <Tag color={item.tagColor} style={{ fontSize: 11 }}>
                            {item.tag}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Section>
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
};

export default DashboardPage;
