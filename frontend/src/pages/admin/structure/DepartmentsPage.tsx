import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, ApartmentOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDepartments, DepartmentResponse, updateDepartment, deleteDepartment } from '../../../api/structureApi';

const { Title } = Typography;

export const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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
        return; // Validation errors
      }
      message.error(err.response?.data?.message || 'Failed to update department');
      console.error('Error updating department:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDepartment(id);
      message.success(`Department "${name}" deleted successfully`);
      loadDepartments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete department');
      console.error('Error deleting department:', err);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DepartmentResponse, b: DepartmentResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <ApartmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: DepartmentResponse) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Department"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6 }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Departments</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/departments/new')}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 8
              }}
            >
              Create Department
            </Button>
          </div>

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

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              locale={{ emptyText: 'No departments found. Click "Create Department" to add one.' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} departments`,
              }}
            />
          )}
        </Space>
      </Card>

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
