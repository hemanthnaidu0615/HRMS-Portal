import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Alert,
  Typography,
  Space,
  Skeleton,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Dropdown,
  Empty,
  Switch,
  Badge,
  Tree,
  Tabs
} from 'antd';
import type { MenuProps, TreeDataNode } from 'antd';
import {
  PlusOutlined,
  ApartmentOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { getDepartments, DepartmentResponse, updateDepartment, deleteDepartment } from '../../../api/structureApi';

const { Title, Text } = Typography;

interface DepartmentStats {
  total: number;
  active: number;
  withManager: number;
  totalEmployees: number;
}

export const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load departments. Please try again.');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department: DepartmentResponse) => {
    setEditingDepartment(department);
    form.setFieldsValue({ name: department.name });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await updateDepartment(editingDepartment!.id, values.name);
      message.success('Department updated successfully');
      setEditModalVisible(false);
      loadDepartments();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      message.error(err.response?.data?.message || 'Failed to update department');
      console.error('Error updating department:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Department',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteDepartment(id);
          message.success(`Department "${name}" deleted successfully`);
          loadDepartments();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete department');
          console.error('Error deleting department:', err);
        }
      }
    });
  };

  const getActionMenu = (department: DepartmentResponse): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Edit Department',
        icon: <EditOutlined />,
        onClick: () => handleEdit(department),
      },
      {
        key: 'add-sub',
        label: 'Add Sub-Department',
        icon: <PlusOutlined />,
        onClick: () => navigate('/admin/structure/departments/new'),
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
        onClick: () => handleDelete(department.id, department.name),
      },
    ],
  });

  const calculateStats = (): DepartmentStats => {
    return {
      total: departments.length,
      active: departments.length,
      withManager: 0,
      totalEmployees: 0,
    };
  };

  const stats = calculateStats();

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Build tree data for hierarchical view
  const buildTreeData = (): TreeDataNode[] => {
    return filteredDepartments.map(dept => ({
      key: dept.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined />
          <span style={{ fontWeight: 500 }}>{dept.name}</span>
          <Badge count={0} style={{ backgroundColor: '#52c41a' }} />
        </div>
      ),
    }));
  };

  const renderStatsCards = () => (
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Departments</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.total}</Title>
            <ApartmentOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>With Manager</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.withManager}</Title>
            <UserOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
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
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Employees</Text>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>{stats.totalEmployees}</Title>
            <TeamOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }} />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const renderCardsView = () => (
    <Row gutter={[16, 16]}>
      {filteredDepartments.length === 0 ? (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text>No departments found</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {searchText ? 'Try adjusting your search' : 'Click "Create Department" to add one'}
                </Text>
              </Space>
            }
          >
            {!searchText && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/structure/departments/new')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                }}
              >
                Create Department
              </Button>
            )}
          </Empty>
        </Col>
      ) : (
        filteredDepartments.map(dept => (
          <Col xs={24} sm={12} lg={8} xl={6} key={dept.id}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s',
              }}
              styles={{
                body: { padding: 20 }
              }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Space>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ApartmentOutlined style={{ fontSize: 20, color: '#fff' }} />
                    </div>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>{dept.name}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>Department</Text>
                    </div>
                  </Space>
                  <Dropdown menu={getActionMenu(dept)} trigger={['click']}>
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      style={{ padding: 4 }}
                    />
                  </Dropdown>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Badge
                    count={0}
                    showZero
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>Employees</Text>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Manager:</Text>
                  <br />
                  <Text style={{ fontSize: 13 }}>Not assigned</Text>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Badge status="success" text="Active" />
                </div>
              </Space>
            </Card>
          </Col>
        ))
      )}
    </Row>
  );

  const renderTreeView = () => (
    <Card
      style={{
        borderRadius: 12,
        minHeight: 400,
      }}
    >
      {filteredDepartments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No departments found"
        />
      ) : (
        <Tree
          showLine
          defaultExpandAll
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          treeData={buildTreeData()}
        />
      )}
    </Card>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApartmentOutlined /> Departments
            </Title>
            <Text type="secondary">Manage organizational structure and departments</Text>
          </div>
          <Space wrap>
            <Input
              placeholder="Search departments..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250, borderRadius: 8 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/departments/new')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 8,
              }}
            >
              Create Department
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Departments"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
          />
        )}

        {/* View Mode Toggle */}
        <Card style={{ borderRadius: 12 }}>
          <Tabs
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as 'cards' | 'tree')}
            items={[
              {
                key: 'cards',
                label: (
                  <span>
                    <AppstoreOutlined /> Card View
                  </span>
                ),
              },
              {
                key: 'tree',
                label: (
                  <span>
                    <TableOutlined /> Tree View
                  </span>
                ),
              },
            ]}
          />
        </Card>

        {/* Content */}
        {loading ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          viewMode === 'cards' ? renderCardsView() : renderTreeView()
        )}
      </Space>

      {/* Edit Modal */}
      <Modal
        title="Edit Department"
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
            label="Department Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter department name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must not exceed 100 characters' }
            ]}
          >
            <Input placeholder="e.g., Engineering, Marketing, Sales" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
