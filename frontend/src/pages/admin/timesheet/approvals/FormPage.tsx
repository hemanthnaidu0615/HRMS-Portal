import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  Tag,
  Badge,
  Avatar,
  Input,
  Radio,
  Timeline,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  DollarOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface TimesheetEntry {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  billable: boolean;
  description: string;
}

interface TimesheetDetail {
  id: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
    department: string;
    email: string;
  };
  weekEnding: string;
  weekStarting: string;
  totalHours: number;
  billableHours: number;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  entries: TimesheetEntry[];
  projectBreakdown: {
    projectName: string;
    hours: number;
    billable: boolean;
  }[];
  comments?: string;
  approver?: {
    name: string;
    date: string;
  };
}

const TimesheetApprovalFormPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timesheet, setTimesheet] = useState<TimesheetDetail | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'>('APPROVE');
  const [comments, setComments] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchTimesheet();
    }
  }, [id]);

  const fetchTimesheet = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/timesheet/approvals/${id}`);
      setTimesheet(response.data);
      if (response.data.comments) {
        setComments(response.data.comments);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch timesheet details');
      navigate('/admin/timesheet/approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!timesheet) return;

    setSubmitting(true);
    try {
      let endpoint = '';
      let successMsg = '';

      switch (decision) {
        case 'APPROVE':
          endpoint = `/api/timesheet/approvals/${id}/approve`;
          successMsg = 'Timesheet approved successfully';
          break;
        case 'REJECT':
          endpoint = `/api/timesheet/approvals/${id}/reject`;
          successMsg = 'Timesheet rejected successfully';
          break;
        case 'REQUEST_CHANGES':
          endpoint = `/api/timesheet/approvals/${id}/request-changes`;
          successMsg = 'Changes requested successfully';
          break;
      }

      await http.patch(endpoint, { comments });
      message.success(successMsg);
      navigate('/admin/timesheet/approvals');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to process timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('ddd, MMM DD'),
      width: 120,
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      render: (text: string) => (
        <Space>
          <ProjectOutlined style={{ color: '#722ed1' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      align: 'center' as const,
      render: (hours: number) => (
        <Tag color="purple" style={{ fontSize: 14, fontWeight: 600 }}>
          {hours}h
        </Tag>
      ),
      width: 80,
    },
    {
      title: 'Type',
      dataIndex: 'billable',
      key: 'billable',
      align: 'center' as const,
      render: (billable: boolean) =>
        billable ? (
          <Badge count="Billable" style={{ background: '#52c41a' }} />
        ) : (
          <Badge count="Non-Billable" style={{ background: '#8c8c8c' }} />
        ),
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!timesheet) {
    return null;
  }

  const billablePercentage = timesheet.totalHours > 0
    ? Math.round((timesheet.billableHours / timesheet.totalHours) * 100)
    : 0;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
          <FieldTimeOutlined style={{ marginRight: 12 }} />
          Review Timesheet
        </Title>
        <Text type="secondary">Review and approve or reject timesheet submission</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Employee Info */}
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              border: 'none',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size={16}>
                <Avatar
                  size={72}
                  src={timesheet.employee.avatar}
                  icon={<UserOutlined />}
                  style={{ border: '4px solid rgba(255,255,255,0.3)' }}
                />
                <div>
                  <Title level={3} style={{ color: '#fff', margin: 0 }}>
                    {timesheet.employee.name}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                    {timesheet.employee.department}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                      {timesheet.employee.email}
                    </Text>
                  </div>
                </div>
              </Space>
              <Tag
                color={timesheet.status === 'PENDING' ? 'orange' : timesheet.status === 'APPROVED' ? 'green' : 'red'}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontSize: 14,
                }}
              >
                {timesheet.status}
              </Tag>
            </Space>
          </PremiumCard>

          {/* Week Details */}
          <PremiumCard
            style={{ marginBottom: 24 }}
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Week Details
              </span>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Week Starting</Text>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                    {dayjs(timesheet.weekStarting).format('MMM DD, YYYY')}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Week Ending</Text>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                    {dayjs(timesheet.weekEnding).format('MMM DD, YYYY')}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Submitted On</Text>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                    {dayjs(timesheet.submittedDate).format('MMM DD, YYYY')}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total Hours</Text>
                  <div style={{ fontWeight: 600, fontSize: 20, marginTop: 4, color: '#722ed1' }}>
                    {timesheet.totalHours}h
                  </div>
                </div>
              </Col>
            </Row>
          </PremiumCard>

          {/* Project Breakdown */}
          <PremiumCard
            style={{ marginBottom: 24 }}
            title={
              <span>
                <ProjectOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Project Breakdown
              </span>
            }
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {timesheet.projectBreakdown.map((project, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    background: project.billable ? '#f6ffed' : '#fafafa',
                    border: `1px solid ${project.billable ? '#b7eb8f' : '#d9d9d9'}`,
                    borderRadius: 8,
                  }}
                >
                  <Space>
                    <Text strong>{project.projectName}</Text>
                    {project.billable && (
                      <Badge count={<DollarOutlined />} style={{ background: '#52c41a' }} />
                    )}
                  </Space>
                  <Text strong style={{ fontSize: 16, color: '#722ed1' }}>
                    {project.hours}h
                  </Text>
                </div>
              ))}
            </Space>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    textAlign: 'center',
                  }}
                >
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <DollarOutlined /> Billable Hours
                    </Text>
                    <Text strong style={{ color: '#52c41a', fontSize: 20 }}>
                      {timesheet.billableHours}h
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {billablePercentage}% of total
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
                    textAlign: 'center',
                  }}
                >
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Non-Billable Hours
                    </Text>
                    <Text strong style={{ fontSize: 20 }}>
                      {timesheet.totalHours - timesheet.billableHours}h
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {100 - billablePercentage}% of total
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </PremiumCard>

          {/* Detailed Entries */}
          <PremiumCard
            title={
              <span>
                <FileTextOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Detailed Time Entries
              </span>
            }
          >
            <Table
              columns={columns}
              dataSource={timesheet.entries}
              pagination={false}
              rowKey="id"
              bordered
              size="middle"
            />
          </PremiumCard>
        </Col>

        {/* Approval Sidebar */}
        <Col xs={24} lg={8}>
          <PremiumCard
            style={{
              position: 'sticky',
              top: 24,
            }}
            title={
              <span>
                <EditOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Approval Decision
              </span>
            }
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                  Select Decision
                </Text>
                <Radio.Group
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="APPROVE" style={{ width: '100%' }}>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>Approve</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Accept and approve this timesheet
                          </Text>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="REQUEST_CHANGES" style={{ width: '100%' }}>
                      <Space>
                        <EditOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>Request Changes</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Ask employee to make corrections
                          </Text>
                        </div>
                      </Space>
                    </Radio>
                    <Radio value="REJECT" style={{ width: '100%' }}>
                      <Space>
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>Reject</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Reject this timesheet submission
                          </Text>
                        </div>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>

              <Divider style={{ margin: 0 }} />

              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                  Comments {decision !== 'APPROVE' && <Text type="danger">*</Text>}
                </Text>
                <TextArea
                  rows={6}
                  placeholder={
                    decision === 'APPROVE'
                      ? 'Add optional comments...'
                      : 'Provide feedback or reasons for your decision...'
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ borderRadius: 8 }}
                  showCount
                  maxLength={500}
                />
              </div>

              <Divider style={{ margin: 0 }} />

              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSubmit}
                  disabled={decision !== 'APPROVE' && !comments}
                  style={{
                    background:
                      decision === 'APPROVE'
                        ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                        : decision === 'REJECT'
                        ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)'
                        : 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                    border: 'none',
                    borderRadius: 8,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  {decision === 'APPROVE' && <CheckCircleOutlined />}
                  {decision === 'REJECT' && <CloseCircleOutlined />}
                  {decision === 'REQUEST_CHANGES' && <EditOutlined />}
                  <span style={{ marginLeft: 8 }}>
                    {decision === 'APPROVE'
                      ? 'Approve Timesheet'
                      : decision === 'REJECT'
                      ? 'Reject Timesheet'
                      : 'Request Changes'}
                  </span>
                </Button>
                <Button
                  size="large"
                  block
                  onClick={() => navigate('/admin/timesheet/approvals')}
                  style={{ borderRadius: 8, height: 44 }}
                >
                  Cancel
                </Button>
              </Space>

              {timesheet.approver && (
                <>
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{
                      background: '#f0f2f5',
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Previously reviewed by
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>{timesheet.approver.name}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(timesheet.approver.date).format('MMM DD, YYYY HH:mm')}
                    </Text>
                  </div>
                </>
              )}
            </Space>
          </PremiumCard>
        </Col>
      </Row>
    </div>
  );
};

export default TimesheetApprovalFormPage;
