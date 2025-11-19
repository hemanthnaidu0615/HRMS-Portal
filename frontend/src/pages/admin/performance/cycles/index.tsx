import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Card,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Input,
  Select,
  message,
  Modal,
  Spin,
  Typography,
  Statistic,
  Progress,
  Alert,
  Badge,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title } = Typography;

interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  description?: string;
}

const CyclesListPage: React.FC = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [filteredCycles, setFilteredCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cycles, searchText, statusFilter]);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/performance/cycles');
      setCycles(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch review cycles');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cycles];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (cycle) =>
          cycle.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (cycle.description && cycle.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((cycle) => cycle.status === statusFilter);
    }

    // Sort by start date (most recent first)
    filtered.sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf());

    setFilteredCycles(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Review Cycle',
      content: 'Are you sure you want to delete this review cycle?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/performance/cycles/${id}`);
          message.success('Review cycle deleted successfully');
          fetchCycles();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete review cycle');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      DRAFT: {
        color: 'default',
        icon: <EditOutlined />,
        label: 'Draft',
        dotColor: '#d9d9d9',
      },
      ACTIVE: {
        color: 'blue',
        icon: <PlayCircleOutlined />,
        label: 'Active',
        dotColor: '#1890ff',
      },
      COMPLETED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Completed',
        dotColor: '#52c41a',
      },
      CANCELLED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Cancelled',
        dotColor: '#f5222d',
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const isDeadlineApproaching = (deadline: string) => {
    const daysUntil = dayjs(deadline).diff(dayjs(), 'day');
    return daysUntil >= 0 && daysUntil <= 7;
  };

  const isOverdue = (deadline: string) => {
    return dayjs(deadline).isBefore(dayjs(), 'day');
  };

  const getDuration = (startDate: string, endDate: string) => {
    return dayjs(endDate).diff(dayjs(startDate), 'day');
  };

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const total = dayjs(endDate).diff(dayjs(startDate), 'day');
    const elapsed = dayjs().diff(dayjs(startDate), 'day');
    const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return Math.round(percentage);
  };

  const stats = {
    total: cycles.length,
    active: cycles.filter((c) => c.status === 'ACTIVE').length,
    completed: cycles.filter((c) => c.status === 'COMPLETED').length,
    draft: cycles.filter((c) => c.status === 'DRAFT').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#eb2f96' }}>
                <TrophyOutlined style={{ marginRight: 12 }} />
                Review Cycles
              </Title>
              <Text type="secondary">Manage performance review cycles and deadlines</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/performance/cycles/create')}
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)',
              }}
            >
              Create Cycle
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Cycles</Text>
            </div>
          </PremiumCard>
        </Col>
        <Col xs={12} sm={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.active}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Active</Text>
            </div>
          </PremiumCard>
        </Col>
        <Col xs={12} sm={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.completed}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Completed</Text>
            </div>
          </PremiumCard>
        </Col>
        <Col xs={12} sm={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.draft}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Draft</Text>
            </div>
          </PremiumCard>
        </Col>
      </Row>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by name or description..."
              prefix={<SearchOutlined style={{ color: '#eb2f96' }} />}
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
              suffixIcon={<FilterOutlined style={{ color: '#eb2f96' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="DRAFT">Draft</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Timeline */}
      <PremiumCard
        style={{
          minHeight: 400,
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredCycles.length === 0 ? (
          <EmptyState
            icon={<TrophyOutlined />}
            title="No Review Cycles"
            subtitle="No review cycles found matching your criteria"
            action={{
              text: 'Create Cycle',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/performance/cycles/create'),
            }}
          />
        ) : (
          <Timeline mode="left">
            {filteredCycles.map((cycle) => {
              const statusConfig = getStatusConfig(cycle.status);
              const duration = getDuration(cycle.startDate, cycle.endDate);
              const progress = cycle.status === 'ACTIVE' ? getProgressPercentage(cycle.startDate, cycle.endDate) : 0;

              return (
                <Timeline.Item
                  key={cycle.id}
                  dot={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${statusConfig.dotColor} 0%, ${statusConfig.dotColor}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: '#fff',
                        boxShadow: `0 4px 12px ${statusConfig.dotColor}40`,
                      }}
                    >
                      {statusConfig.icon}
                    </div>
                  }
                  color={statusConfig.dotColor}
                  label={
                    <div style={{ width: 140, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
                        {dayjs(cycle.startDate).format('MMM DD, YYYY')}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {duration} days
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
                      marginBottom: 16,
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <Space direction="vertical" size={4}>
                            <Title level={4} style={{ margin: 0, color: '#eb2f96' }}>
                              {cycle.name}
                            </Title>
                            <Tag
                              color={statusConfig.color}
                              icon={statusConfig.icon}
                              style={{ borderRadius: 4 }}
                            >
                              {statusConfig.label}
                            </Tag>
                          </Space>
                        </div>
                        <Space>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/performance/cycles/${cycle.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(cycle.id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>

                      {/* Description */}
                      {cycle.description && (
                        <Text type="secondary">{cycle.description}</Text>
                      )}

                      {/* Date Range */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <Space direction="vertical" size={4}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Period
                            </Text>
                            <Space>
                              <CalendarOutlined style={{ color: '#eb2f96' }} />
                              <Text strong>
                                {dayjs(cycle.startDate).format('MMM DD')} - {dayjs(cycle.endDate).format('MMM DD, YYYY')}
                              </Text>
                            </Space>
                          </Space>
                        </Col>
                      </Row>

                      {/* Progress Bar for Active Cycles */}
                      {cycle.status === 'ACTIVE' && (
                        <div>
                          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Cycle Progress
                            </Text>
                            <Text strong style={{ fontSize: 12, color: '#eb2f96' }}>
                              {progress}%
                            </Text>
                          </div>
                          <Progress
                            percent={progress}
                            strokeColor={{
                              '0%': '#eb2f96',
                              '100%': '#f759ab',
                            }}
                            showInfo={false}
                          />
                        </div>
                      )}

                      {/* Deadlines */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <Alert
                            message={
                              <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: 12 }}>
                                  Self Review Deadline
                                </Text>
                                <Space size={4}>
                                  <ClockCircleOutlined />
                                  <Text style={{ fontSize: 12 }}>
                                    {dayjs(cycle.selfReviewDeadline).format('MMM DD, YYYY')}
                                  </Text>
                                </Space>
                              </Space>
                            }
                            type={
                              isOverdue(cycle.selfReviewDeadline) && cycle.status === 'ACTIVE'
                                ? 'error'
                                : isDeadlineApproaching(cycle.selfReviewDeadline) && cycle.status === 'ACTIVE'
                                ? 'warning'
                                : 'info'
                            }
                            showIcon
                            icon={
                              isOverdue(cycle.selfReviewDeadline) && cycle.status === 'ACTIVE' ? (
                                <WarningOutlined />
                              ) : (
                                <ClockCircleOutlined />
                              )
                            }
                            style={{ borderRadius: 8 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Alert
                            message={
                              <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: 12 }}>
                                  Manager Review Deadline
                                </Text>
                                <Space size={4}>
                                  <ClockCircleOutlined />
                                  <Text style={{ fontSize: 12 }}>
                                    {dayjs(cycle.managerReviewDeadline).format('MMM DD, YYYY')}
                                  </Text>
                                </Space>
                              </Space>
                            }
                            type={
                              isOverdue(cycle.managerReviewDeadline) && cycle.status === 'ACTIVE'
                                ? 'error'
                                : isDeadlineApproaching(cycle.managerReviewDeadline) && cycle.status === 'ACTIVE'
                                ? 'warning'
                                : 'info'
                            }
                            showIcon
                            icon={
                              isOverdue(cycle.managerReviewDeadline) && cycle.status === 'ACTIVE' ? (
                                <WarningOutlined />
                              ) : (
                                <ClockCircleOutlined />
                              )
                            }
                            style={{ borderRadius: 8 }}
                          />
                        </Col>
                      </Row>
                    </Space>
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

export default CyclesListPage;
