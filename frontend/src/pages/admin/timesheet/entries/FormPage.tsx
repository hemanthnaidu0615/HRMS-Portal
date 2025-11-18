import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Space,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Checkbox,
  Typography,
  Divider,
} from 'antd';
import {
  FieldTimeOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Employee {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

const TimesheetEntryFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
    if (isEdit) {
      fetchEntry();
    }
  }, [id]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error: any) {
      message.error('Failed to fetch employees');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await http.get('/api/projects');
      setProjects(response.data);
    } catch (error: any) {
      message.error('Failed to fetch projects');
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await http.get(`/api/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (error: any) {
      message.error('Failed to fetch tasks');
    }
  };

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/timesheet/entries/${id}`);
      const entry = response.data;
      form.setFieldsValue({
        ...entry,
        date: dayjs(entry.date),
        employee: entry.employee.id,
        project: entry.project.id,
        task: entry.task.id,
      });
      setSelectedProject(entry.project.id);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (isEdit) {
        await http.put(`/api/timesheet/entries/${id}`, payload);
        message.success('Timesheet entry updated successfully');
      } else {
        await http.post('/api/timesheet/entries', payload);
        message.success('Timesheet entry created successfully');
      }
      navigate('/admin/timesheet/entries');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} timesheet entry`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
          <FieldTimeOutlined style={{ marginRight: 12 }} />
          {isEdit ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
        </Title>
        <Text type="secondary">
          {isEdit ? 'Update timesheet entry details' : 'Create a new timesheet entry'}
        </Text>
      </div>

      {/* Form Card */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <PremiumCard
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                date: dayjs(),
                hours: 8,
                billable: false,
              }}
              requiredMark="optional"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="employee"
                    label={
                      <span>
                        <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Employee
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select an employee' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select employee"
                      showSearch
                      optionFilterProp="children"
                      style={{ borderRadius: 8 }}
                    >
                      {employees.map((emp) => (
                        <Option key={emp.id} value={emp.id}>
                          {emp.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="date"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Date
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select a date' }]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="project"
                    label={
                      <span>
                        <ProjectOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Project
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select a project' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select project"
                      showSearch
                      optionFilterProp="children"
                      onChange={(value) => {
                        setSelectedProject(value);
                        form.setFieldsValue({ task: undefined });
                      }}
                      style={{ borderRadius: 8 }}
                    >
                      {projects.map((project) => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="task"
                    label={
                      <span>
                        <CheckSquareOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Task
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select a task' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select task"
                      showSearch
                      optionFilterProp="children"
                      disabled={!selectedProject}
                      style={{ borderRadius: 8 }}
                    >
                      {tasks.map((task) => (
                        <Option key={task.id} value={task.id}>
                          {task.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="hours"
                    label={
                      <span>
                        <ClockCircleOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Hours
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter hours' },
                      {
                        type: 'number',
                        min: 0.5,
                        max: 24,
                        message: 'Hours must be between 0.5 and 24',
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={0.5}
                      max={24}
                      step={0.5}
                      placeholder="Enter hours (0.5 - 24)"
                      style={{ width: '100%', borderRadius: 8 }}
                      precision={1}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="billable"
                    valuePropName="checked"
                    label={
                      <span>
                        <DollarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        Billing Status
                      </span>
                    }
                  >
                    <Checkbox
                      style={{
                        marginTop: 8,
                        fontSize: 16,
                      }}
                    >
                      <span style={{ color: '#52c41a', fontWeight: 500 }}>
                        This is billable time
                      </span>
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item
                name="description"
                label={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    Description
                  </span>
                }
                rules={[{ required: true, message: 'Please enter a description' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe what you worked on..."
                  style={{ borderRadius: 8 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Space size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                      border: 'none',
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 24,
                      paddingRight: 24,
                      boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
                    }}
                  >
                    {isEdit ? 'Update Entry' : 'Create Entry'}
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/admin/timesheet/entries')}
                    style={{
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 24,
                      paddingRight: 24,
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </PremiumCard>
        </Col>

        {/* Sidebar Info */}
        <Col xs={24} lg={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
              border: 'none',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Time Entry Guidelines
                </Title>
              </div>

              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: 8,
                }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Hours must be between 0.5 and 24
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Use 0.5 hour increments (e.g., 1.5, 2.0, 8.5)
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Mark billable time for client projects
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Provide detailed descriptions
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Submit timesheets by end of week
                  </Text>
                </Space>
              </Card>
            </Space>
          </PremiumCard>

          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <DollarOutlined style={{ fontSize: 32, color: '#fff' }} />
              <Title level={4} style={{ color: '#fff', margin: '8px 0' }}>
                Billable Time
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                Check the "This is billable time" option for all client-facing work that should
                be invoiced. Internal meetings, training, and administrative tasks are typically
                non-billable.
              </Text>
            </Space>
          </PremiumCard>
        </Col>
      </Row>
    </div>
  );
};

export default TimesheetEntryFormPage;
