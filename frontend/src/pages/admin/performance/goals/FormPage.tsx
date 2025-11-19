import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  DatePicker,
  Slider,
  Alert,
  Spin,
} from 'antd';
import {
  TrophyOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  RocketOutlined,
  CalendarOutlined,
  FlagOutlined,
  FileTextOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
}

const GoalsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    if (isEdit) {
      fetchGoalData();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error: any) {
      message.error('Failed to fetch employees');
    }
  };

  const fetchGoalData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/performance/goals/${id}`);
      const data = response.data;
      form.setFieldsValue({
        employeeId: data.employee.id,
        title: data.title,
        description: data.description,
        targetDate: dayjs(data.targetDate),
        status: data.status,
        progress: data.progress,
        priority: data.priority,
        category: data.category,
      });
      setProgress(data.progress);
    } catch (error: any) {
      message.error('Failed to fetch goal');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        targetDate: values.targetDate.format('YYYY-MM-DD'),
        progress: progress,
      };

      if (isEdit) {
        await http.put(`/api/performance/goals/${id}`, payload);
        message.success('Goal updated successfully');
      } else {
        await http.post('/api/performance/goals', payload);
        message.success('Goal created successfully');
      }
      navigate('/admin/performance/goals');
    } catch (error: any) {
      message.error(
        error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} goal`
      );
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 75) return '#52c41a';
    if (value >= 50) return '#1890ff';
    if (value >= 25) return '#faad14';
    return '#f5222d';
  };

  const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%',
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#eb2f96' }}>
            <TrophyOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Goal' : 'Create Goal'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update the goal details' : 'Add a new performance goal'}
          </Text>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Form Section */}
        <Col xs={24} lg={16}>
          <PremiumCard
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
            }}
            bodyStyle={{ padding: 32 }}
          >
            {loading && !isEdit ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                {/* Basic Information */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <RocketOutlined style={{ marginRight: 8 }} />
                    Goal Information
                  </Title>

                  <Form.Item
                    name="employeeId"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <UserOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                        Employee
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select an employee' }]}
                  >
                    <Select
                      placeholder="Select employee"
                      showSearch
                      optionFilterProp="children"
                      style={{ borderRadius: 8 }}
                    >
                      {employees.map((emp) => (
                        <Option key={emp.id} value={emp.id}>
                          <Space direction="vertical" size={0}>
                            <Text strong>{emp.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {emp.position || emp.email}
                            </Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="title"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Goal Title
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter goal title' },
                      { min: 3, message: 'Title must be at least 3 characters' },
                    ]}
                  >
                    <Input
                      placeholder="Enter goal title..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <FileTextOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                        Description
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter description' },
                      { min: 10, message: 'Description must be at least 10 characters' },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe the goal in detail..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Goal Settings */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <FlagOutlined style={{ marginRight: 8 }} />
                    Goal Settings
                  </Title>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="targetDate"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            <CalendarOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                            Target Date
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select target date' }]}
                      >
                        <DatePicker
                          style={{ width: '100%', borderRadius: 8 }}
                          format="MMM DD, YYYY"
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="category"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Category
                          </span>
                        }
                      >
                        <Select
                          placeholder="Select category (optional)"
                          style={{ borderRadius: 8 }}
                          allowClear
                        >
                          <Option value="Sales">Sales</Option>
                          <Option value="Development">Development</Option>
                          <Option value="Marketing">Marketing</Option>
                          <Option value="Customer Service">Customer Service</Option>
                          <Option value="Management">Management</Option>
                          <Option value="Operations">Operations</Option>
                          <Option value="Other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="priority"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            <FlagOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                            Priority
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select priority' }]}
                        initialValue="MEDIUM"
                      >
                        <Select style={{ borderRadius: 8 }}>
                          <Option value="LOW">
                            <Space>
                              <span>🟢</span>
                              <Text>Low Priority</Text>
                            </Space>
                          </Option>
                          <Option value="MEDIUM">
                            <Space>
                              <span>🟡</span>
                              <Text>Medium Priority</Text>
                            </Space>
                          </Option>
                          <Option value="HIGH">
                            <Space>
                              <span>🔴</span>
                              <Text>High Priority</Text>
                            </Space>
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="status"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Status
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select status' }]}
                        initialValue="NOT_STARTED"
                      >
                        <Select style={{ borderRadius: 8 }}>
                          <Option value="NOT_STARTED">Not Started</Option>
                          <Option value="IN_PROGRESS">In Progress</Option>
                          <Option value="COMPLETED">Completed</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Progress Section */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <PercentageOutlined style={{ marginRight: 8 }} />
                    Progress Tracking
                  </Title>

                  <Form.Item
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Current Progress: {progress}%
                      </span>
                    }
                  >
                    <div style={{ padding: '24px 0' }}>
                      <Slider
                        marks={marks}
                        value={progress}
                        onChange={(value) => {
                          setProgress(value);
                          form.setFieldsValue({ progress: value });
                        }}
                        trackStyle={{ background: getProgressColor(progress) }}
                        handleStyle={{
                          borderColor: getProgressColor(progress),
                          backgroundColor: getProgressColor(progress),
                        }}
                      />
                    </div>
                    <Alert
                      message={
                        <Text>
                          The goal is{' '}
                          <Text strong style={{ color: getProgressColor(progress) }}>
                            {progress}% complete
                          </Text>
                        </Text>
                      }
                      type="info"
                      showIcon
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Action Buttons */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{
                        background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                        border: 'none',
                        borderRadius: 8,
                        minWidth: 140,
                        height: 44,
                      }}
                    >
                      {isEdit ? 'Update Goal' : 'Create Goal'}
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => navigate('/admin/performance/goals')}
                      style={{ borderRadius: 8, minWidth: 100, height: 44 }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </PremiumCard>
        </Col>

        {/* Guidelines Section */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* SMART Goals Guide */}
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Title level={5} style={{ color: '#fff', margin: 0 }}>
                  <RocketOutlined style={{ marginRight: 8 }} />
                  SMART Goals
                </Title>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#fff' }}>
                      S - Specific
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Clear and well-defined
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#fff' }}>
                      M - Measurable
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Trackable with metrics
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#fff' }}>
                      A - Achievable
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Realistic and attainable
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#fff' }}>
                      R - Relevant
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Aligned with objectives
                    </Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#fff' }}>
                      T - Time-bound
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Has a deadline
                    </Text>
                  </div>
                </div>
              </Space>
            </PremiumCard>

            {/* Tips Card */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                  Goal Setting Tips
                </Title>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Break large goals into smaller milestones
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Set realistic but challenging targets
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Review and update progress regularly
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Align goals with company objectives
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Document achievements and learnings
                    </Text>
                  </li>
                </ul>
              </Space>
            </PremiumCard>

            {/* Priority Guide */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <FlagOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                  Priority Levels
                </Title>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      <span>🔴</span>
                      <Text strong>High:</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 28 }}>
                      Critical goals requiring immediate focus
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      <span>🟡</span>
                      <Text strong>Medium:</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 28 }}>
                      Important but not urgent goals
                    </Text>
                  </div>
                  <div>
                    <Space>
                      <span>🟢</span>
                      <Text strong>Low:</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 28 }}>
                      Nice-to-have goals for future focus
                    </Text>
                  </div>
                </div>
              </Space>
            </PremiumCard>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default GoalsFormPage;
