import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Space, message, Form, Switch, Select, Result } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ApartmentOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { createDepartment } from '../../../api/structureApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await createDepartment(values.name);
      message.success('Department created successfully');
      setSuccess(true);

      // Show success animation, then redirect
      setTimeout(() => navigate('/admin/structure/departments'), 2000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Result
            status="success"
            title="Department Created Successfully!"
            subTitle="Redirecting you to the departments list..."
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px 24px',
            margin: '-24px -24px 24px -24px',
            color: '#fff',
          }}
        >
          <Space direction="vertical" size={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ApartmentOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  Create New Department
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Add a new department to your organizational structure
                </Text>
              </div>
            </div>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Basic Information */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>

              <Form.Item
                label="Department Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter department name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                  { max: 100, message: 'Name must not exceed 100 characters' }
                ]}
              >
                <Input
                  prefix={<ApartmentOutlined />}
                  placeholder="e.g., Engineering, Marketing, Sales"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Parent Department"
                name="parentDepartmentId"
                help="Select a parent department to create a sub-department (optional)"
              >
                <Select
                  placeholder="Select parent department (optional)"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                >
                  {/* Parent departments will be loaded from API in production */}
                  <Select.Option value="dept1">Engineering</Select.Option>
                  <Select.Option value="dept2">Marketing</Select.Option>
                  <Select.Option value="dept3">Sales</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Department Code"
                name="code"
                help="Auto-generated if not provided"
              >
                <Input
                  placeholder="e.g., ENG, MKT, SALES (auto-generated)"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            {/* Manager & Details */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Manager & Details</Title>

              <Form.Item
                label="Department Manager"
                name="managerId"
                help="Assign a manager to this department (optional)"
              >
                <Select
                  showSearch
                  placeholder="Search and select manager"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                  optionFilterProp="children"
                >
                  {/* Employees will be loaded from API in production */}
                  <Select.Option value="emp1">John Doe (john@example.com)</Select.Option>
                  <Select.Option value="emp2">Jane Smith (jane@example.com)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea
                  rows={4}
                  placeholder="Describe the department's purpose and responsibilities..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            {/* Status */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Status</Title>

              <Form.Item
                label="Active Status"
                name="isActive"
                valuePropName="checked"
                help="Inactive departments are hidden from most views"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/structure/departments')}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckOutlined />}
                loading={loading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                Create Department
              </Button>
            </div>
          </Space>
        </Form>
      </Card>
    </div>
  );
};
