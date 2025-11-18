import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Avatar,
  Spin,
  Typography,
  Progress,
  Tooltip,
  Badge,
  Dropdown,
  Menu,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Text, Title } = Typography;

interface Goal {
  id: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  description: string;
  targetDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
}

const GoalsListPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [goals, searchText, priorityFilter]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/performance/goals');
      setGoals(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...goals];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (goal) =>
          goal.title.toLowerCase().includes(searchText.toLowerCase()) ||
          goal.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (goal.description && goal.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter((goal) => goal.priority === priorityFilter);
    }

    setFilteredGoals(filtered);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await http.patch(`/api/performance/goals/${id}`, { status: newStatus });
      message.success('Goal status updated successfully');
      fetchGoals();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update goal status');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Goal',
      content: 'Are you sure you want to delete this goal?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/performance/goals/${id}`);
          message.success('Goal deleted successfully');
          fetchGoals();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete goal');
        }
      },
    });
  };

  const getPriorityConfig = (priority: string) => {
    const configs: any = {
      HIGH: {
        color: '#f5222d',
        icon: '🔴',
        label: 'High',
      },
      MEDIUM: {
        color: '#faad14',
        icon: '🟡',
        label: 'Medium',
      },
      LOW: {
        color: '#52c41a',
        icon: '🟢',
        label: 'Low',
      },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      NOT_STARTED: {
        color: '#d9d9d9',
        label: 'Not Started',
        icon: <ClockCircleOutlined />,
      },
      IN_PROGRESS: {
        color: '#1890ff',
        label: 'In Progress',
        icon: <RocketOutlined />,
      },
      COMPLETED: {
        color: '#52c41a',
        label: 'Completed',
        icon: <CheckCircleOutlined />,
      },
    };
    return configs[status] || configs.NOT_STARTED;
  };

  const isOverdue = (targetDate: string) => {
    return dayjs(targetDate).isBefore(dayjs(), 'day');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 25) return '#faad14';
    return '#f5222d';
  };

  const stats = {
    total: goals.length,
    notStarted: goals.filter((g) => g.status === 'NOT_STARTED').length,
    inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
    completed: goals.filter((g) => g.status === 'COMPLETED').length,
  };

  const renderGoalCard = (goal: Goal) => {
    const priorityConfig = getPriorityConfig(goal.priority);
    const statusConfig = getStatusConfig(goal.status);
    const overdue = isOverdue(goal.targetDate);

    const statusMenu = (
      <Menu
        onClick={({ key }) => handleStatusChange(goal.id, key)}
        items={[
          { key: 'NOT_STARTED', label: 'Not Started', icon: <ClockCircleOutlined /> },
          { key: 'IN_PROGRESS', label: 'In Progress', icon: <RocketOutlined /> },
          { key: 'COMPLETED', label: 'Completed', icon: <CheckCircleOutlined /> },
        ]}
      />
    );

    const actionMenu = (
      <Menu
        items={[
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/performance/goals/${goal.id}/edit`),
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(goal.id),
          },
        ]}
      />
    );

    return (
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        bodyStyle={{ padding: 16 }}
        hoverable
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Space>
              <span style={{ fontSize: 18 }}>{priorityConfig.icon}</span>
              <Text strong style={{ fontSize: 15 }}>
                {goal.title}
              </Text>
            </Space>
            <Dropdown overlay={actionMenu} trigger={['click']}>
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>

          {/* Description */}
          {goal.description && (
            <Text type="secondary" style={{ fontSize: 13 }} ellipsis={{ rows: 2 }}>
              {goal.description}
            </Text>
          )}

          {/* Progress */}
          <div>
            <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Progress
              </Text>
              <Text strong style={{ fontSize: 12, color: getProgressColor(goal.progress) }}>
                {goal.progress}%
              </Text>
            </div>
            <Progress
              percent={goal.progress}
              strokeColor={getProgressColor(goal.progress)}
              showInfo={false}
              size="small"
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={4}>
              <Avatar size={24} src={goal.employee.avatar} icon={<UserOutlined />} />
              <Text style={{ fontSize: 12 }}>{goal.employee.name}</Text>
            </Space>
            <Space>
              <Tooltip title={`Due: ${dayjs(goal.targetDate).format('MMM DD, YYYY')}`}>
                <Tag
                  icon={<CalendarOutlined />}
                  color={overdue && goal.status !== 'COMPLETED' ? 'error' : 'default'}
                  style={{ fontSize: 11, margin: 0 }}
                >
                  {dayjs(goal.targetDate).format('MMM DD')}
                </Tag>
              </Tooltip>
              <Dropdown overlay={statusMenu} trigger={['click']}>
                <Tag
                  color={statusConfig.color}
                  icon={statusConfig.icon}
                  style={{ fontSize: 11, margin: 0, cursor: 'pointer' }}
                >
                  {statusConfig.label}
                </Tag>
              </Dropdown>
            </Space>
          </div>

          {goal.category && (
            <Tag color="#eb2f96" style={{ fontSize: 11, width: 'fit-content' }}>
              {goal.category}
            </Tag>
          )}
        </Space>
      </Card>
    );
  };

  const renderColumn = (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED', title: string, icon: React.ReactNode, color: string) => {
    const columnGoals = filteredGoals.filter((g) => g.status === status);
    const statusConfig = getStatusConfig(status);

    return (
      <Col xs={24} lg={8}>
        <PremiumCard
          style={{
            background: '#f9fafb',
            border: `2px solid ${color}20`,
            minHeight: 600,
          }}
          bodyStyle={{ padding: 16 }}
        >
          {/* Column Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <span style={{ fontSize: 20, color: '#fff' }}>{icon}</span>
                <Text strong style={{ color: '#fff', fontSize: 16 }}>
                  {title}
                </Text>
              </Space>
              <Badge
                count={columnGoals.length}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            </Space>
          </div>

          {/* Goals List */}
          <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 8 }}>
            {columnGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Text type="secondary">No goals in this column</Text>
              </div>
            ) : (
              columnGoals.map((goal) => (
                <div key={goal.id}>{renderGoalCard(goal)}</div>
              ))
            )}
          </div>
        </PremiumCard>
      </Col>
    );
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
                Employee Goals
              </Title>
              <Text type="secondary">Track and manage performance goals with Kanban board</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/performance/goals/create')}
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)',
              }}
            >
              Create Goal
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Goals</Text>
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
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.notStarted}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Not Started</Text>
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
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.inProgress}</div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>In Progress</Text>
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
      </Row>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by title, employee, or description..."
              prefix={<SearchOutlined style={{ color: '#eb2f96' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 150, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#eb2f96' }} />}
            >
              <Option value="ALL">All Priority</Option>
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <PremiumCard>
          <EmptyState
            icon={<TrophyOutlined />}
            title="No Goals Found"
            subtitle="No goals match your criteria"
            action={{
              text: 'Create Goal',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/performance/goals/create'),
            }}
          />
        </PremiumCard>
      ) : (
        <Row gutter={[16, 16]}>
          {renderColumn('NOT_STARTED', 'Not Started', <ClockCircleOutlined />, '#d9d9d9')}
          {renderColumn('IN_PROGRESS', 'In Progress', <RocketOutlined />, '#1890ff')}
          {renderColumn('COMPLETED', 'Completed', <CheckCircleOutlined />, '#52c41a')}
        </Row>
      )}
    </div>
  );
};

export default GoalsListPage;
