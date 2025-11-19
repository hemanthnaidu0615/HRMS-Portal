import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Tag,
  Button,
  Space,
  Select,
  Input,
  message,
  Modal,
  Avatar,
  Spin,
  Typography,
  Statistic,
  Progress,
  Tooltip,
} from 'antd';
import {
  ProjectOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

interface Project {
  id: string;
  name: string;
  code: string;
  client: {
    id: string;
    name: string;
  };
  manager: {
    id: string;
    name: string;
    avatar?: string;
  };
  startDate: string;
  endDate: string;
  budget: number;
  actualSpent: number;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  billable: boolean;
  progress: number;
  teamMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  description?: string;
}

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, statusFilter, clientFilter, searchText]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/projects');
      setProjects(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    if (clientFilter !== 'ALL') {
      filtered = filtered.filter((project) => project.client.name === clientFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchText.toLowerCase()) ||
          project.code.toLowerCase().includes(searchText.toLowerCase()) ||
          project.client.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Project',
      content: 'Are you sure you want to delete this project?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await http.delete(`/api/projects/${id}`);
          message.success('Project deleted successfully');
          fetchProjects();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete project');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      PLANNING: {
        color: 'default',
        icon: <ClockCircleOutlined />,
        label: 'Planning',
      },
      ACTIVE: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Active',
      },
      ON_HOLD: {
        color: 'orange',
        icon: <PauseCircleOutlined />,
        label: 'On Hold',
      },
      COMPLETED: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        label: 'Completed',
      },
      CANCELLED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Cancelled',
      },
    };
    return configs[status] || configs.PLANNING;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#f5222d';
    if (progress < 70) return '#faad14';
    return '#52c41a';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'ACTIVE').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#2f54eb' }}>
                <ProjectOutlined style={{ marginRight: 12 }} />
                Projects
              </Title>
              <Text type="secondary">Manage and track all your projects</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/projects/projects/create')}
              style={{
                background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(47, 84, 235, 0.3)',
              }}
            >
              Create Project
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Projects</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ProjectOutlined />}
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Active Projects</span>}
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
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Budget</span>}
              value={stats.totalBudget}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Completed</span>}
              value={stats.completed}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
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
              placeholder="Search by project name, code, or client..."
              prefix={<SearchOutlined style={{ color: '#2f54eb' }} />}
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
              suffixIcon={<FilterOutlined style={{ color: '#2f54eb' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="PLANNING">Planning</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="ON_HOLD">On Hold</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <PremiumCard>
          <EmptyState
            icon={<ProjectOutlined />}
            title="No Projects"
            subtitle="No projects found matching your criteria"
            action={{
              text: 'Create Project',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/projects/projects/create'),
            }}
          />
        </PremiumCard>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map((project) => {
            const statusConfig = getStatusConfig(project.status);
            const budgetUsed = (project.actualSpent / project.budget) * 100;
            return (
              <Col xs={24} sm={24} md={12} lg={8} key={project.id}>
                <PremiumCard
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {/* Header */}
                    <Row justify="space-between" align="top">
                      <Col flex="auto">
                        <Space direction="vertical" size={4}>
                          <Text strong style={{ fontSize: 18, color: '#262626' }}>
                            {project.name}
                          </Text>
                          <Tag color="blue" style={{ borderRadius: 4 }}>
                            {project.code}
                          </Tag>
                        </Space>
                      </Col>
                      <Col>
                        <Tag
                          color={statusConfig.color}
                          icon={statusConfig.icon}
                          style={{ borderRadius: 4 }}
                        >
                          {statusConfig.label}
                        </Tag>
                      </Col>
                    </Row>

                    {/* Client */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Client
                      </Text>
                      <div>
                        <Text strong>{project.client.name}</Text>
                      </div>
                    </div>

                    {/* Manager */}
                    <Space>
                      <Avatar
                        size={32}
                        src={project.manager.avatar}
                        icon={<UserOutlined />}
                        style={{
                          background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
                        }}
                      />
                      <div>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          Manager
                        </Text>
                        <Text strong style={{ fontSize: 14 }}>
                          {project.manager.name}
                        </Text>
                      </div>
                    </Space>

                    {/* Dates */}
                    <div>
                      <Space size={4} style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ color: '#2f54eb' }} />
                        <Text type="secondary">
                          {dayjs(project.startDate).format('MMM DD, YYYY')} -{' '}
                          {dayjs(project.endDate).format('MMM DD, YYYY')}
                        </Text>
                      </Space>
                    </div>

                    {/* Progress */}
                    <div>
                      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Progress
                        </Text>
                        <Text strong style={{ color: getProgressColor(project.progress) }}>
                          {project.progress}%
                        </Text>
                      </Space>
                      <Progress
                        percent={project.progress}
                        strokeColor={getProgressColor(project.progress)}
                        showInfo={false}
                      />
                    </div>

                    {/* Budget */}
                    <div
                      style={{
                        background: '#f6f8fa',
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                            Budget
                          </Text>
                          <Text strong style={{ color: '#2f54eb' }}>
                            {formatCurrency(project.budget)}
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                            Spent
                          </Text>
                          <Text strong style={{ color: budgetUsed > 90 ? '#f5222d' : '#52c41a' }}>
                            {formatCurrency(project.actualSpent)}
                          </Text>
                        </Col>
                      </Row>
                    </div>

                    {/* Team Members */}
                    {project.teamMembers && project.teamMembers.length > 0 && (
                      <div>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
                          Team
                        </Text>
                        <Avatar.Group maxCount={5}>
                          {project.teamMembers.map((member) => (
                            <Tooltip key={member.id} title={member.name}>
                              <Avatar src={member.avatar} icon={<UserOutlined />} />
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      </div>
                    )}

                    {/* Billable */}
                    {project.billable && (
                      <Tag color="gold" style={{ borderRadius: 4 }}>
                        <DollarOutlined /> Billable
                      </Tag>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: 12,
                        marginTop: 12,
                      }}
                    >
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/admin/projects/projects/${project.id}/edit`)}
                          style={{ padding: 0 }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(project.id)}
                          style={{ padding: 0 }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </PremiumCard>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default ProjectsListPage;
