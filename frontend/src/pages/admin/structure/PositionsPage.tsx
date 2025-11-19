import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Alert,
  Typography,
  Space,
  Skeleton,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Select,
  Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { getPositions, PositionResponse, updatePosition, deletePosition } from '../../../api/structureApi';

const { Title, Text } = Typography;

interface PositionStats {
  total: number;
  active: number;
  openPositions: number;
  filled: number;
}

const levelLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Entry Level', color: 'green' },
  2: { label: 'Entry Level', color: 'green' },
  3: { label: 'Mid Level', color: 'blue' },
  4: { label: 'Mid Level', color: 'blue' },
  5: { label: 'Mid Level', color: 'blue' },
  6: { label: 'Senior Level', color: 'purple' },
  7: { label: 'Senior Level', color: 'purple' },
  8: { label: 'Executive', color: 'red' },
  9: { label: 'Executive', color: 'red' },
  10: { label: 'Executive', color: 'red' },
};

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPositions();
      setPositions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load positions. Please try again.');
      console.error('Error loading positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (position: PositionResponse) => {
    setEditingPosition(position);
    form.setFieldsValue({ name: position.name, seniorityLevel: position.seniorityLevel });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await updatePosition(editingPosition!.id, values.name, values.seniorityLevel);
      message.success('Position updated successfully');
      setEditModalVisible(false);
      loadPositions();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      message.error(err.response?.data?.message || 'Failed to update position');
      console.error('Error updating position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Position',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deletePosition(id);
          message.success(`Position "${name}" deleted successfully`);
          loadPositions();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete position');
          console.error('Error deleting position:', err);
        }
      }
    });
  };

  const getLevelInfo = (level: number) => {
    return levelLabels[level] || { label: `Level ${level}`, color: 'default' };
  };

  const getActionMenu = (position: PositionResponse): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Edit Position',
        icon: <EditOutlined />,
        onClick: () => handleEdit(position),
      },
      {
        key: 'view-employees',
        label: 'View Employees',
        icon: <TeamOutlined />,
        onClick: () => navigate('/admin/employees'),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(position.id, position.name),
      },
    ],
  });

  const calculateStats = (): PositionStats => {
    return {
      total: positions.length,
      active: positions.length,
      openPositions: 0,
      filled: 0,
    };
  };

  const stats = calculateStats();

  const filteredPositions = positions.filter(pos => {
    const matchesSearch = pos.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = !filterLevel || getLevelInfo(pos.seniorityLevel).label === filterLevel;
    const matchesStatus = !filterStatus || filterStatus === 'active'; // All positions are active for now
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const clearFilters = () => {
    setSearchText('');
    setFilterLevel(undefined);
    setFilterStatus(undefined);
  };

  const columns = [
    {
      title: 'Position Title',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: PositionResponse, b: PositionResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: () => (
        <Tag color="cyan" style={{ borderRadius: 6 }}>
          Not Assigned
        </Tag>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'seniorityLevel',
      key: 'seniorityLevel',
      sorter: (a: PositionResponse, b: PositionResponse) => a.seniorityLevel - b.seniorityLevel,
      render: (level: number) => {
        const info = getLevelInfo(level);
        return (
          <Tag color={info.color} style={{ borderRadius: 6 }}>
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Employee Count',
      key: 'employeeCount',
      render: () => (
        <Space>
          <TeamOutlined />
          <span>0</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green" icon={<CheckCircleOutlined />} style={{ borderRadius: 6 }}>
          Active
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record: PositionResponse) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ padding: 4 }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <TrophyOutlined /> Positions
            </Title>
            <Text type="secondary">Manage job positions and roles</Text>
          </div>
          <Space wrap>
            <Input
              placeholder="Search positions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250, borderRadius: 8 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/positions/new')}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: 8,
              }}
            >
              Create Position
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                border: 'none',
              }}
            >
              <Space direction="vertical" size={4}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Positions</Text>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.total}</Title>
                <TrophyOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 12,
                border: 'none',
              }}
            >
              <Space direction="vertical" size={4}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Active</Text>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.active}</Title>
                <CheckCircleOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: 12,
                border: 'none',
              }}
            >
              <Space direction="vertical" size={4}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Open Positions</Text>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.openPositions}</Title>
                <UserAddOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 12,
                border: 'none',
              }}
            >
              <Space direction="vertical" size={4}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Filled</Text>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.filled}</Title>
                <TeamOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ borderRadius: 12 }}>
          <Space wrap size="middle">
            <Text strong><FilterOutlined /> Filters:</Text>
            <Select
              placeholder="Filter by Level"
              value={filterLevel}
              onChange={setFilterLevel}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="Entry Level">Entry Level</Select.Option>
              <Select.Option value="Mid Level">Mid Level</Select.Option>
              <Select.Option value="Senior Level">Senior Level</Select.Option>
              <Select.Option value="Executive">Executive</Select.Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            {(searchText || filterLevel || filterStatus) && (
              <Button onClick={clearFilters}>Clear All Filters</Button>
            )}
            <Text type="secondary" style={{ marginLeft: 'auto' }}>
              Showing {filteredPositions.length} of {positions.length} positions
            </Text>
          </Space>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Positions"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
          />
        )}

        {/* Table */}
        <Card style={{ borderRadius: 12 }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredPositions}
              rowKey="id"
              locale={{
                emptyText: searchText || filterLevel || filterStatus
                  ? 'No positions match your filters'
                  : 'No positions found. Click "Create Position" to add one.'
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} positions`,
              }}
            />
          )}
        </Card>
      </Space>

      {/* Edit Modal */}
      <Modal
        title="Edit Position"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Position Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter position name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must not exceed 100 characters' }
            ]}
          >
            <Input placeholder="e.g., Software Engineer, Marketing Manager" />
          </Form.Item>
          <Form.Item
            label="Seniority Level"
            name="seniorityLevel"
            rules={[
              { required: true, message: 'Please enter seniority level' },
              { type: 'number', min: 1, max: 10, message: 'Level must be between 1 and 10' }
            ]}
          >
            <InputNumber
              min={1}
              max={10}
              placeholder="1-10"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
