import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Space,
  Select,
  Input,
  message,
  Avatar,
  Spin,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge,
} from 'antd';
import {
  ProjectOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

interface Task {
  id: string;
  project: {
    id: string;
    name: string;
  };
  title: string;
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  startDate: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  estimatedHours: number;
  description?: string;
}

const TasksListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, projectFilter, searchText]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/projects/tasks');
      setTasks(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (projectFilter !== 'ALL') {
      filtered = filtered.filter((task) => task.project.name === projectFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          task.project.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const getPriorityConfig = (priority: string) => {
    const configs: any = {
      LOW: {
        color: 'default',
        label: 'Low',
      },
      MEDIUM: {
        color: 'orange',
        label: 'Medium',
      },
      HIGH: {
        color: 'red',
        label: 'High',
      },
    };
    return configs[priority] || configs.LOW;
  };

  const isOverdue = (dueDate: string) => {
    return dayjs(dueDate).isBefore(dayjs(), 'day');
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');

    try {
      await http.patch(`/api/projects/tasks/${taskId}`, { status: newStatus });
      message.success('Task status updated successfully');
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const renderTaskCard = (task: Task) => {
    const priorityConfig = getPriorityConfig(task.priority);
    const overdue = isOverdue(task.dueDate);

    return (
      <Card
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        hoverable
        style={{
          marginBottom: 12,
          borderRadius: 8,
          border: overdue ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
          cursor: 'move',
        }}
        bodyStyle={{ padding: 16 }}
        onClick={() => navigate(`/admin/projects/tasks/${task.id}/edit`)}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {/* Title */}
          <Text strong style={{ fontSize: 14, display: 'block' }}>
            {task.title}
          </Text>

          {/* Project */}
          <Tag color="blue" style={{ borderRadius: 4 }}>
            <ProjectOutlined /> {task.project.name}
          </Tag>

          {/* Priority */}
          <Tag color={priorityConfig.color} style={{ borderRadius: 4 }}>
            {priorityConfig.label} Priority
          </Tag>

          {/* Assignee */}
          <Space>
            <Avatar
              size={24}
              src={task.assignee.avatar}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
              }}
            />
            <Text style={{ fontSize: 12 }}>{task.assignee.name}</Text>
          </Space>

          {/* Due Date */}
          <Space style={{ fontSize: 12 }}>
            <CalendarOutlined style={{ color: overdue ? '#ff4d4f' : '#2f54eb' }} />
            <Text type={overdue ? 'danger' : 'secondary'}>
              {dayjs(task.dueDate).format('MMM DD, YYYY')}
            </Text>
            {overdue && (
              <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ marginLeft: 4 }}>
                Overdue
              </Tag>
            )}
          </Space>

          {/* Estimated Hours */}
          <Space style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ color: '#2f54eb' }} />
            <Text type="secondary">{task.estimatedHours}h estimated</Text>
          </Space>
        </Space>
      </Card>
    );
  };

  const columns = [
    { key: 'TODO', title: 'To Do', color: '#f0f0f0', icon: <ClockCircleOutlined /> },
    { key: 'IN_PROGRESS', title: 'In Progress', color: '#1890ff', icon: <ClockCircleOutlined /> },
    { key: 'REVIEW', title: 'Review', color: '#faad14', icon: <ExclamationCircleOutlined /> },
    { key: 'DONE', title: 'Done', color: '#52c41a', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#2f54eb' }}>
                <ProjectOutlined style={{ marginRight: 12 }} />
                Project Tasks
              </Title>
              <Text type="secondary">Manage tasks using Kanban board</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/projects/tasks/create')}
              style={{
                background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(47, 84, 235, 0.3)',
              }}
            >
              Create Task
            </Button>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by task title or project..."
              prefix={<SearchOutlined style={{ color: '#2f54eb' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={projectFilter}
              onChange={setProjectFilter}
              style={{ width: 200, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#2f54eb' }} />}
            >
              <Option value="ALL">All Projects</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <PremiumCard>
          <EmptyState
            icon={<ProjectOutlined />}
            title="No Tasks"
            subtitle="No tasks found matching your criteria"
            action={{
              text: 'Create Task',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/projects/tasks/create'),
            }}
          />
        </PremiumCard>
      ) : (
        <Row gutter={[16, 16]}>
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.key);
            return (
              <Col xs={24} sm={12} md={6} key={column.key}>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.key)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 500,
                  }}
                >
                  {/* Column Header */}
                  <Space
                    style={{
                      width: '100%',
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: `3px solid ${column.color}`,
                    }}
                  >
                    <Badge
                      count={columnTasks.length}
                      style={{
                        background: column.color,
                      }}
                    />
                    <Text strong style={{ fontSize: 16 }}>
                      {column.icon} {column.title}
                    </Text>
                  </Space>

                  {/* Tasks */}
                  <div>
                    {columnTasks.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '32px 16px',
                          color: '#8c8c8c',
                        }}
                      >
                        <Text type="secondary">No tasks</Text>
                      </div>
                    ) : (
                      columnTasks.map((task) => renderTaskCard(task))
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default TasksListPage;
