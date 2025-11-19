import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Card,
  Tag,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  Input,
  message,
  Modal,
  Tooltip,
  Avatar,
  Spin,
  Typography,
  Statistic,
  Badge,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

interface LeaveApplication {
  id: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
  };
  leaveType: {
    id: string;
    name: string;
    code: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approver?: {
    id: string;
    name: string;
  };
  appliedDate: string;
  remarks?: string;
}

const LeaveApplicationsListPage: React.FC = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter, dateRange, searchText]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/leave/applications');
      setApplications(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Date range filter
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((app) => {
        const startDate = dayjs(app.startDate);
        return startDate.isAfter(dateRange[0]) && startDate.isBefore(dateRange[1]);
      });
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (app) =>
          app.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          app.leaveType.name.toLowerCase().includes(searchText.toLowerCase()) ||
          app.reason.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = async (id: string) => {
    Modal.confirm({
      title: 'Approve Leave Application',
      content: 'Are you sure you want to approve this leave application?',
      okText: 'Approve',
      okType: 'primary',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/leave/applications/${id}/approve`);
          message.success('Leave application approved successfully');
          fetchApplications();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve leave application');
        }
      },
    });
  };

  const handleReject = async (id: string) => {
    Modal.confirm({
      title: 'Reject Leave Application',
      content: 'Are you sure you want to reject this leave application?',
      okText: 'Reject',
      okType: 'danger',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/leave/applications/${id}/reject`);
          message.success('Leave application rejected successfully');
          fetchApplications();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to reject leave application');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      PENDING: {
        color: 'orange',
        icon: <ClockCircleOutlined />,
        label: 'Pending',
      },
      APPROVED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
      },
      REJECTED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
      },
      CANCELLED: {
        color: 'default',
        icon: <CloseCircleOutlined />,
        label: 'Cancelled',
      },
    };
    return configs[status] || configs.PENDING;
  };

  const getTimelineDotColor = (status: string) => {
    const colors: any = {
      PENDING: 'orange',
      APPROVED: 'green',
      REJECTED: 'red',
      CANCELLED: 'gray',
    };
    return colors[status] || 'blue';
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                <CalendarOutlined style={{ marginRight: 12 }} />
                Leave Applications
              </Title>
              <Text type="secondary">Manage and review employee leave requests</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/leave/applications/create')}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
              }}
            >
              Apply for Leave
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Applications</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<FileTextOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Pending</span>}
              value={stats.pending}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Approved</span>}
              value={stats.approved}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Rejected</span>}
              value={stats.rejected}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CloseCircleOutlined />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Filters */}
      <PremiumCard
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by employee, leave type, or reason..."
              prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              size="large"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>
      </PremiumCard>

      {/* Timeline */}
      <PremiumCard
        style={{
          minHeight: 400,
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={<CalendarOutlined />}
            title="No Leave Applications"
            subtitle="No leave applications found matching your criteria"
            action={{
              text: 'Apply for Leave',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/leave/applications/create'),
            }}
          />
        ) : (
          <Timeline mode="left">
            {filteredApplications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              return (
                <Timeline.Item
                  key={app.id}
                  dot={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${statusConfig.color} 0%, ${statusConfig.color} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: '#fff',
                        boxShadow: `0 4px 12px rgba(82, 196, 26, 0.3)`,
                      }}
                    >
                      {statusConfig.icon}
                    </div>
                  }
                  color={getTimelineDotColor(app.status)}
                  label={
                    <div style={{ width: 120, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
                        {dayjs(app.appliedDate).format('MMM DD, YYYY')}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {dayjs(app.appliedDate).format('hh:mm A')}
                      </div>
                    </div>
                  }
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      marginBottom: 16,
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Space align="start" size={12}>
                          <Avatar
                            size={48}
                            src={app.employee.avatar}
                            icon={<UserOutlined />}
                            style={{
                              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong style={{ fontSize: 16, color: '#262626' }}>
                                {app.employee.name}
                              </Text>
                              <Tag
                                color={statusConfig.color}
                                icon={statusConfig.icon}
                                style={{ marginLeft: 8, borderRadius: 4 }}
                              >
                                {statusConfig.label}
                              </Tag>
                              <Tag
                                color="blue"
                                style={{ marginLeft: 4, borderRadius: 4 }}
                              >
                                {app.leaveType.name}
                              </Tag>
                            </div>
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Space>
                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary">
                                  {dayjs(app.startDate).format('MMM DD, YYYY')} -{' '}
                                  {dayjs(app.endDate).format('MMM DD, YYYY')}
                                </Text>
                                <Badge
                                  count={`${app.days} day${app.days > 1 ? 's' : ''}`}
                                  style={{
                                    background: '#52c41a',
                                    borderRadius: 4,
                                  }}
                                />
                              </Space>
                              <div>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  <strong>Reason:</strong> {app.reason}
                                </Text>
                              </div>
                              {app.approver && (
                                <div>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    <strong>Approver:</strong> {app.approver.name}
                                  </Text>
                                </div>
                              )}
                              {app.remarks && (
                                <div>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    <strong>Remarks:</strong> {app.remarks}
                                  </Text>
                                </div>
                              )}
                            </Space>
                          </div>
                        </Space>
                      </Col>
                      {app.status === 'PENDING' && (
                        <Col span={24}>
                          <div
                            style={{
                              borderTop: '1px solid #f0f0f0',
                              paddingTop: 12,
                              marginTop: 12,
                            }}
                          >
                            <Space>
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(app.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                  border: 'none',
                                  borderRadius: 6,
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(app.id)}
                                style={{ borderRadius: 6 }}
                              >
                                Reject
                              </Button>
                            </Space>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </PremiumCard>
    </div>
  );
};

export default LeaveApplicationsListPage;
