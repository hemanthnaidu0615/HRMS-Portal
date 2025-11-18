import React, { useState, useEffect } from 'react';
import {
  Timeline,
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
} from 'antd';
import {
  LaptopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TagOutlined,
  SearchOutlined,
  FilterOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title } = Typography;

interface Assignment {
  id: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    imageUrl?: string;
  };
  employee: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedDate: string;
  returnDate?: string;
  expectedReturnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

const AssetAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, statusFilter, searchText]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/assets/assignments');
      setAssignments(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignments];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (a) =>
          a.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          a.asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
          a.asset.assetTag.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Assignment',
      content: 'Are you sure you want to delete this assignment?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/assets/assignments/${id}`);
          message.success('Assignment deleted successfully');
          fetchAssignments();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete assignment');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      ACTIVE: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        label: 'Active',
      },
      RETURNED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Returned',
      },
      OVERDUE: {
        color: 'red',
        icon: <ClockCircleOutlined />,
        label: 'Overdue',
      },
    };
    return configs[status] || configs.ACTIVE;
  };

  const getConditionColor = (condition: string) => {
    const colors: any = {
      EXCELLENT: 'green',
      GOOD: 'blue',
      FAIR: 'orange',
      POOR: 'red',
    };
    return colors[condition] || 'default';
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => a.status === 'ACTIVE').length,
    returned: assignments.filter((a) => a.status === 'RETURNED').length,
    overdue: assignments.filter((a) => a.status === 'OVERDUE').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                <SwapOutlined style={{ marginRight: 12 }} />
                Asset Assignments
              </Title>
              <Text type="secondary">Track asset assignments and returns</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/assets/assignments/create')}
              style={{
                background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
              }}
            >
              Assign Asset
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
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Assignments</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<SwapOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Active</span>}
              value={stats.active}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Returned</span>}
              value={stats.returned}
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Overdue</span>}
              value={stats.overdue}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
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
              placeholder="Search by employee, asset name, or tag..."
              prefix={<SearchOutlined style={{ color: '#fa8c16' }} />}
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
              suffixIcon={<FilterOutlined style={{ color: '#fa8c16' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="RETURNED">Returned</Option>
              <Option value="OVERDUE">Overdue</Option>
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
        bodyStyle={{ padding: 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            icon={<SwapOutlined />}
            title="No Assignments"
            subtitle="No asset assignments found"
            action={{
              text: 'Assign Asset',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/assets/assignments/create'),
            }}
          />
        ) : (
          <Timeline mode="left">
            {filteredAssignments.map((assignment) => {
              const statusConfig = getStatusConfig(assignment.status);

              return (
                <Timeline.Item
                  key={assignment.id}
                  dot={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
                      }}
                    >
                      <LaptopOutlined />
                    </div>
                  }
                  label={
                    <div style={{ width: 120, textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
                        {dayjs(assignment.assignedDate).format('MMM DD, YYYY')}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {dayjs(assignment.assignedDate).format('hh:mm A')}
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
                    bodyStyle={{ padding: 20 }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Space align="start" size={12} style={{ width: '100%' }}>
                          <Avatar
                            size={48}
                            src={assignment.employee.avatar}
                            icon={<UserOutlined />}
                            style={{
                              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 8 }}>
                              <Space>
                                <Text strong style={{ fontSize: 16 }}>
                                  {assignment.employee.name}
                                </Text>
                                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                  {statusConfig.label}
                                </Tag>
                              </Space>
                            </div>
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Space>
                                <LaptopOutlined style={{ color: '#fa8c16' }} />
                                <Text strong>{assignment.asset.name}</Text>
                                <Tag color="orange">{assignment.asset.assetTag}</Tag>
                              </Space>
                              <Space>
                                <CalendarOutlined />
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  {assignment.returnDate ? (
                                    <>Returned: {dayjs(assignment.returnDate).format('MMM DD, YYYY')}</>
                                  ) : assignment.expectedReturnDate ? (
                                    <>Due: {dayjs(assignment.expectedReturnDate).format('MMM DD, YYYY')}</>
                                  ) : (
                                    'No return date'
                                  )}
                                </Text>
                              </Space>
                              <Space>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  <strong>Condition:</strong>
                                </Text>
                                <Tag color={getConditionColor(assignment.condition)}>
                                  {assignment.condition}
                                </Tag>
                              </Space>
                              {assignment.notes && (
                                <div>
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    <strong>Notes:</strong> {assignment.notes}
                                  </Text>
                                </div>
                              )}
                            </Space>
                          </div>
                        </Space>
                      </Col>
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
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => navigate(`/admin/assets/assignments/${assignment.id}/edit`)}
                              style={{ paddingLeft: 0 }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(assignment.id)}
                            >
                              Delete
                            </Button>
                          </Space>
                        </div>
                      </Col>
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

export default AssetAssignmentsPage;
