import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPositions, PositionResponse, updatePosition, deletePosition } from '../../../api/structureApi';

const { Title } = Typography;

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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
        return; // Validation errors
      }
      message.error(err.response?.data?.message || 'Failed to update position');
      console.error('Error updating position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deletePosition(id);
      message.success(`Position "${name}" deleted successfully`);
      loadPositions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete position');
      console.error('Error deleting position:', err);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: PositionResponse, b: PositionResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <TeamOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Seniority Level',
      dataIndex: 'seniorityLevel',
      key: 'seniorityLevel',
      sorter: (a: PositionResponse, b: PositionResponse) => a.seniorityLevel - b.seniorityLevel,
      render: (level: number) => (
        <Tag color="blue" style={{ borderRadius: 6 }}>
          Level {level}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: PositionResponse) => (
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
            title="Delete Position"
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
            <Title level={3} style={{ margin: 0 }}>Positions</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/structure/positions/new')}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 8
              }}
            >
              Create Position
            </Button>
          </div>

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

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={positions}
              rowKey="id"
              locale={{ emptyText: 'No positions found. Click "Create Position" to add one.' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} positions`,
              }}
            />
          )}
        </Space>
      </Card>

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
