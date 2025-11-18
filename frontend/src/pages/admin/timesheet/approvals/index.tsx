import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Select,
  Input,
  Typography,
  Spin,
  Badge,
  Avatar,
  Statistic,
  Tooltip,
  Progress,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  ProjectOutlined,
  DollarOutlined,
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

interface TimesheetSubmission {
  id: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
    department: string;
  };
  weekEnding: string;
  totalHours: number;
  billableHours: number;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  projectBreakdown: {
    projectName: string;
    hours: number;
    billable: boolean;
  }[];
  comments?: string;
}

const TimesheetApprovalsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<TimesheetSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, statusFilter, searchText]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/timesheet/approvals');
      setSubmissions(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch timesheet submissions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (sub) =>
          sub.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          sub.employee.department.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleApprove = async (id: string) => {
    Modal.confirm({
      title: 'Approve Timesheet',
      content: 'Are you sure you want to approve this timesheet?',
      okText: 'Approve',
      okType: 'primary',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/timesheet/approvals/${id}/approve`);
          message.success('Timesheet approved successfully');
          fetchSubmissions();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve timesheet');
        }
      },
    });
  };

  const handleReject = async (id: string) => {
    Modal.confirm({
      title: 'Reject Timesheet',
      content: 'Are you sure you want to reject this timesheet?',
      okText: 'Reject',
      okType: 'danger',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/timesheet/approvals/${id}/reject`);
          message.success('Timesheet rejected successfully');
          fetchSubmissions();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to reject timesheet');
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
        gradient: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
      },
      APPROVED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
        gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      },
      REJECTED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
        gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
      },
      CHANGES_REQUESTED: {
        color: 'purple',
        icon: <FileTextOutlined />,
        label: 'Changes Requested',
        gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      },
    };
    return configs[status] || configs.PENDING;
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'PENDING').length,
    approved: submissions.filter((s) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s) => s.status === 'REJECTED').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                <FieldTimeOutlined style={{ marginRight: 12 }} />
                Timesheet Approvals
              </Title>
              <Text type="secondary">Review and approve employee timesheet submissions</Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Submissions</span>}
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
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
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
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
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
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
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
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by employee or department..."
              prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
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
              style={{ width: 200, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#722ed1' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="CHANGES_REQUESTED">Changes Requested</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Submissions Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState
          icon={<FieldTimeOutlined />}
          title="No Timesheet Submissions"
          subtitle="No timesheet submissions found matching your criteria"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredSubmissions.map((submission) => {
            const statusConfig = getStatusConfig(submission.status);
            const billablePercentage = submission.totalHours > 0
              ? Math.round((submission.billableHours / submission.totalHours) * 100)
              : 0;

            return (
              <Col xs={24} lg={12} xl={8} key={submission.id}>
                <PremiumCard
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      background: statusConfig.gradient,
                      padding: 20,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  >
                    <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <Avatar
                          size={56}
                          src={submission.employee.avatar}
                          icon={<UserOutlined />}
                          style={{ border: '3px solid rgba(255,255,255,0.3)' }}
                        />
                        <div>
                          <Title level={5} style={{ color: '#fff', margin: 0 }}>
                            {submission.employee.name}
                          </Title>
                          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                            {submission.employee.department}
                          </Text>
                        </div>
                      </Space>
                      <Tag
                        color={statusConfig.color}
                        icon={statusConfig.icon}
                        style={{
                          background: 'rgba(255,255,255,0.25)',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 12px',
                        }}
                      >
                        {statusConfig.label}
                      </Tag>
                    </Space>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: 20 }}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {/* Week Info */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <CalendarOutlined style={{ marginRight: 4 }} />
                              Week Ending
                            </Text>
                            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>
                              {dayjs(submission.weekEnding).format('MMM DD, YYYY')}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              Submitted
                            </Text>
                            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>
                              {dayjs(submission.submittedDate).format('MMM DD, YYYY')}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Divider style={{ margin: 0 }} />

                      {/* Hours Breakdown */}
                      <div>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ fontSize: 16 }}>
                              <FieldTimeOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                              Total Hours
                            </Text>
                            <Text strong style={{ fontSize: 20, color: '#722ed1' }}>
                              {submission.totalHours}h
                            </Text>
                          </div>

                          <Row gutter={8}>
                            <Col span={12}>
                              <Card
                                size="small"
                                style={{
                                  background: '#f6ffed',
                                  border: '1px solid #b7eb8f',
                                  borderRadius: 6,
                                }}
                              >
                                <Space direction="vertical" size={0}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    <DollarOutlined /> Billable
                                  </Text>
                                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    {submission.billableHours}h
                                  </Text>
                                </Space>
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card
                                size="small"
                                style={{
                                  background: '#fafafa',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: 6,
                                }}
                              >
                                <Space direction="vertical" size={0}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Non-Billable
                                  </Text>
                                  <Text strong style={{ fontSize: 16 }}>
                                    {submission.totalHours - submission.billableHours}h
                                  </Text>
                                </Space>
                              </Card>
                            </Col>
                          </Row>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Billable Percentage
                              </Text>
                              <Text strong style={{ fontSize: 12 }}>
                                {billablePercentage}%
                              </Text>
                            </div>
                            <Progress
                              percent={billablePercentage}
                              strokeColor={{
                                '0%': '#52c41a',
                                '100%': '#73d13d',
                              }}
                              showInfo={false}
                            />
                          </div>
                        </Space>
                      </div>

                      {/* Project Breakdown */}
                      {submission.projectBreakdown && submission.projectBreakdown.length > 0 && (
                        <>
                          <Divider style={{ margin: 0 }} />
                          <div>
                            <Text strong style={{ fontSize: 13 }}>
                              <ProjectOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                              Project Breakdown
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              {submission.projectBreakdown.slice(0, 3).map((project, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none',
                                  }}
                                >
                                  <Space size={4}>
                                    <Text style={{ fontSize: 13 }}>{project.projectName}</Text>
                                    {project.billable && (
                                      <Badge
                                        count="B"
                                        style={{
                                          background: '#52c41a',
                                          fontSize: 10,
                                        }}
                                      />
                                    )}
                                  </Space>
                                  <Text strong style={{ fontSize: 13 }}>
                                    {project.hours}h
                                  </Text>
                                </div>
                              ))}
                              {submission.projectBreakdown.length > 3 && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  +{submission.projectBreakdown.length - 3} more projects
                                </Text>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Comments */}
                      {submission.comments && (
                        <>
                          <Divider style={{ margin: 0 }} />
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Comments:
                            </Text>
                            <Paragraph
                              ellipsis={{ rows: 2, expandable: true }}
                              style={{ marginTop: 4, marginBottom: 0, fontSize: 13 }}
                            >
                              {submission.comments}
                            </Paragraph>
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      <Divider style={{ margin: 0 }} />
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/admin/timesheet/approvals/${submission.id}`)}
                          style={{ paddingLeft: 0 }}
                        >
                          View Details
                        </Button>
                        {submission.status === 'PENDING' && (
                          <Space size={8}>
                            <Tooltip title="Approve">
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(submission.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                  border: 'none',
                                  borderRadius: 6,
                                }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(submission.id)}
                                style={{ borderRadius: 6 }}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </Space>
                        )}
                      </Space>
                    </Space>
                  </div>
                </PremiumCard>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default TimesheetApprovalsPage;
