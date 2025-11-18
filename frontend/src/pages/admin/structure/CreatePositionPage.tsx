import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  InputNumber,
  Button,
  Typography,
  Space,
  message,
  Form,
  Select,
  Switch,
  Result,
  Row,
  Col
} from 'antd';
import {
  CheckOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { createPosition } from '../../../api/structureApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await createPosition(values.name, values.seniorityLevel);
      message.success('Position created successfully');
      setSuccess(true);

      // Show success animation, then redirect
      setTimeout(() => navigate('/admin/structure/positions'), 2000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Result
            status="success"
            title="Position Created Successfully!"
            subTitle="Redirecting you to the positions list..."
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                <TrophyOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  Create New Position
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Define a new job position in your organization
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
            seniorityLevel: 3,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Basic Information */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>

              <Form.Item
                label="Position Title"
                name="name"
                rules={[
                  { required: true, message: 'Please enter position title' },
                  { min: 2, message: 'Title must be at least 2 characters' },
                  { max: 100, message: 'Title must not exceed 100 characters' }
                ]}
              >
                <Input
                  prefix={<TeamOutlined />}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Position Code"
                name="code"
                help="Auto-generated if not provided"
              >
                <Input
                  placeholder="e.g., SE, MM (auto-generated)"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Department"
                name="departmentId"
              >
                <Select
                  placeholder="Select department"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                >
                  {/* Departments will be loaded from API in production */}
                  <Select.Option value="dept1">Engineering</Select.Option>
                  <Select.Option value="dept2">Marketing</Select.Option>
                  <Select.Option value="dept3">Sales</Select.Option>
                  <Select.Option value="dept4">Human Resources</Select.Option>
                </Select>
              </Form.Item>
            </div>

            {/* Level & Compensation */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Level & Compensation</Title>

              <Form.Item
                label="Seniority Level"
                name="seniorityLevel"
                rules={[
                  { required: true, message: 'Please select seniority level' },
                ]}
                help="1-2: Entry Level, 3-5: Mid Level, 6-7: Senior Level, 8-10: Executive"
              >
                <Select
                  size="large"
                  style={{ borderRadius: 8 }}
                  placeholder="Select level"
                >
                  <Select.Option value={1}>1 - Entry Level</Select.Option>
                  <Select.Option value={2}>2 - Entry Level</Select.Option>
                  <Select.Option value={3}>3 - Mid Level</Select.Option>
                  <Select.Option value={4}>4 - Mid Level</Select.Option>
                  <Select.Option value={5}>5 - Mid Level</Select.Option>
                  <Select.Option value={6}>6 - Senior Level</Select.Option>
                  <Select.Option value={7}>7 - Senior Level</Select.Option>
                  <Select.Option value={8}>8 - Executive</Select.Option>
                  <Select.Option value={9}>9 - Executive</Select.Option>
                  <Select.Option value={10}>10 - Executive</Select.Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Minimum Salary"
                    name="minSalary"
                  >
                    <InputNumber
                      prefix={<DollarOutlined />}
                      placeholder="50,000"
                      min={0}
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Maximum Salary"
                    name="maxSalary"
                  >
                    <InputNumber
                      prefix={<DollarOutlined />}
                      placeholder="100,000"
                      min={0}
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Details */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Position Details</Title>

              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea
                  rows={4}
                  placeholder="Describe the position's main responsibilities and duties..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Requirements"
                name="requirements"
              >
                <TextArea
                  rows={4}
                  placeholder="List the skills, qualifications, and experience required..."
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
                help="Inactive positions won't be available for assignment"
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
                onClick={() => navigate('/admin/structure/positions')}
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
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                Create Position
              </Button>
            </div>
          </Space>
        </Form>
      </Card>
    </div>
  );
};
