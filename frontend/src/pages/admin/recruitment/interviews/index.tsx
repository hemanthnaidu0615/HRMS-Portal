import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Badge,
  Card,
  Button,
  Space,
  message,
  Modal,
  Select,
  Tag,
  List,
  Avatar,
  Drawer,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import dayjs, { Dayjs } from 'dayjs';

interface Interview {
  id: string;
  candidateName: string;
  jobPosting: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  status: string;
  interviewers?: string[];
  meetingLink?: string;
  notes?: string;
}

const InterviewsListPage: React.FC = () => {
  const [data, setData] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/interviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Interview',
      content: 'Are you sure you want to delete this interview? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(
            `${API_BASE_URL}/recruitment/interviews/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success('Interview deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete interview');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'blue',
      'In Progress': 'orange',
      'Completed': 'green',
      'Cancelled': 'red',
      'Rescheduled': 'purple',
    };
    return colors[status] || 'default';
  };

  const getInterviewTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      'Video': <VideoCameraOutlined style={{ color: '#1890ff' }} />,
      'Phone': <PhoneOutlined style={{ color: '#52c41a' }} />,
      'In-person': <EnvironmentOutlined style={{ color: '#722ed1' }} />,
      'Technical': <CheckCircleOutlined style={{ color: '#fa8c16' }} />,
      'HR': <UserOutlined style={{ color: '#13c2c2' }} />,
    };
    return icons[type] || <CalendarOutlined />;
  };

  const getInterviewsForDate = (date: Dayjs) => {
    return data.filter(interview =>
      dayjs(interview.interviewDate).isSame(date, 'day')
    );
  };

  const getFilteredInterviews = () => {
    let filtered = getInterviewsForDate(selectedDate);
    if (selectedStatus) {
      filtered = filtered.filter(interview => interview.status === selectedStatus);
    }
    return filtered.sort((a, b) => {
      const timeA = a.interviewTime || '00:00';
      const timeB = b.interviewTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const dateCellRender = (value: Dayjs) => {
    const interviews = getInterviewsForDate(value);
    if (interviews.length === 0) return null;

    return (
      <div style={{ fontSize: 12 }}>
        {interviews.slice(0, 2).map((interview, idx) => (
          <div key={idx} style={{ marginBottom: 2 }}>
            <Badge
              status={interview.status === 'Completed' ? 'success' : interview.status === 'Cancelled' ? 'error' : 'processing'}
              text={
                <span style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {interview.interviewTime} - {interview.candidateName}
                </span>
              }
            />
          </div>
        ))}
        {interviews.length > 2 && (
          <div style={{ color: '#1890ff', fontSize: 11 }}>+{interviews.length - 2} more</div>
        )}
      </div>
    );
  };

  const stats = {
    total: data.length,
    today: data.filter(i => dayjs(i.interviewDate).isSame(dayjs(), 'day')).length,
    scheduled: data.filter(i => i.status === 'Scheduled').length,
    completed: data.filter(i => i.status === 'Completed').length,
  };

  const openDrawer = (interview: Interview) => {
    setSelectedInterview(interview);
    setDrawerVisible(true);
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#13c2c2' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Interview Schedules
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              Manage and track all interview appointments
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/recruitment/interviews/create')}
            style={{
              background: '#13c2c2',
              borderColor: '#13c2c2',
              borderRadius: 8,
              height: 44,
              fontWeight: 600,
            }}
          >
            Schedule Interview
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Total Interviews</span>}
                value={stats.total}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 28 }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #13c2c2 0%, #0e9c9c 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Today</span>}
                value={stats.today}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 28 }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Scheduled</span>}
                value={stats.scheduled}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 28 }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Completed</span>}
                value={stats.completed}
                valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 28 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={16}>
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Calendar
              cellRender={dateCellRender}
              onSelect={setSelectedDate}
              style={{ borderRadius: 12 }}
            />
          </Card>
        </Col>

        {/* Interviews List for Selected Date */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            title={
              <Space direction="vertical" size={0}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  {selectedDate.format('MMMM D, YYYY')}
                </span>
                <span style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>
                  {getFilteredInterviews().length} interview(s)
                </span>
              </Space>
            }
            extra={
              <Select
                placeholder="Filter Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
                size="small"
                style={{ width: 130 }}
              >
                <Select.Option value="Scheduled">Scheduled</Select.Option>
                <Select.Option value="In Progress">In Progress</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
                <Select.Option value="Cancelled">Cancelled</Select.Option>
                <Select.Option value="Rescheduled">Rescheduled</Select.Option>
              </Select>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxHeight: 'calc(100vh - 400px)',
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: 0, maxHeight: 'calc(100vh - 470px)', overflow: 'auto' }}
          >
            {getFilteredInterviews().length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>
                No interviews scheduled for this date
              </div>
            ) : (
              <List
                dataSource={getFilteredInterviews()}
                renderItem={(interview) => (
                  <List.Item
                    key={interview.id}
                    style={{
                      padding: '16px 24px',
                      cursor: 'pointer',
                      transition: 'background 0.3s',
                    }}
                    onClick={() => openDrawer(interview)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={48}
                          style={{
                            background: 'linear-gradient(135deg, #13c2c2 0%, #0e9c9c 100%)',
                            fontWeight: 600,
                          }}
                        >
                          {interview.candidateName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      }
                      title={
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>
                            {interview.candidateName}
                          </span>
                          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {interview.jobPosting}
                          </span>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space size="small">
                            <ClockCircleOutlined style={{ fontSize: 12 }} />
                            <span style={{ fontSize: 12 }}>{interview.interviewTime}</span>
                          </Space>
                          <Space size="small" wrap>
                            {getInterviewTypeIcon(interview.interviewType)}
                            <span style={{ fontSize: 12 }}>{interview.interviewType}</span>
                            <Tag color={getStatusColor(interview.status)} style={{ fontSize: 11, marginLeft: 4 }}>
                              {interview.status}
                            </Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Interview Details Drawer */}
      <Drawer
        title={
          <Space>
            <CalendarOutlined style={{ color: '#13c2c2' }} />
            <span>Interview Details</span>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={450}
      >
        {selectedInterview && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              bordered={false}
              style={{ background: '#fafafa', borderRadius: 12 }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Candidate</div>
                  <Space>
                    <Avatar
                      size={40}
                      style={{ background: 'linear-gradient(135deg, #13c2c2 0%, #0e9c9c 100%)' }}
                    >
                      {selectedInterview.candidateName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 500 }}>{selectedInterview.candidateName}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{selectedInterview.jobPosting}</div>
                    </div>
                  </Space>
                </div>

                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Date & Time</div>
                  <div style={{ fontWeight: 500 }}>
                    {dayjs(selectedInterview.interviewDate).format('MMMM D, YYYY')} at {selectedInterview.interviewTime}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Interview Type</div>
                  <Space>
                    {getInterviewTypeIcon(selectedInterview.interviewType)}
                    <span style={{ fontWeight: 500 }}>{selectedInterview.interviewType}</span>
                  </Space>
                </div>

                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Status</div>
                  <Tag color={getStatusColor(selectedInterview.status)} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {selectedInterview.status}
                  </Tag>
                </div>

                {selectedInterview.meetingLink && (
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Meeting Link</div>
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ wordBreak: 'break-all' }}
                    >
                      {selectedInterview.meetingLink}
                    </a>
                  </div>
                )}

                {selectedInterview.interviewers && selectedInterview.interviewers.length > 0 && (
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>Interviewers</div>
                    <Space wrap>
                      {selectedInterview.interviewers.map((interviewer, idx) => (
                        <Tag key={idx} icon={<UserOutlined />} style={{ padding: '4px 12px' }}>
                          {interviewer}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {selectedInterview.notes && (
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Notes</div>
                    <div style={{ fontSize: 13, lineHeight: '1.6' }}>{selectedInterview.notes}</div>
                  </div>
                )}
              </Space>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerVisible(false);
                  navigate(`/admin/recruitment/interviews/${selectedInterview.id}/edit`);
                }}
                style={{ borderRadius: 8 }}
              >
                Edit
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerVisible(false);
                  handleDelete(selectedInterview.id);
                }}
                style={{ borderRadius: 8 }}
              >
                Delete
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default InterviewsListPage;
