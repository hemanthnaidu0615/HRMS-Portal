import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  DatePicker,
  InputNumber,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  ProjectOutlined,
  SaveOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const TaskFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    if (isEdit) {
      fetchTask();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await http.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/projects/tasks/${id}`);
      const data = response.data;
      form.setFieldsValue({
        ...data,
        startDate: data.startDate ? dayjs(data.startDate) : null,
        dueDate: data.dueDate ? dayjs(data.dueDate) : null,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      };

      if (isEdit) {
        await http.put(`/api/projects/tasks/${id}`, formData);
        message.success('Task updated successfully');
      } else {
        await http.post('/api/projects/tasks', formData);
        message.success('Task created successfully');
      }
      navigate('/admin/projects/tasks');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#2f54eb' }}>
            <ProjectOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Task' : 'Create Task'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update task details' : 'Create a new project task'}
          </Text>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <PremiumCard
              title={
                <Space>
                  <ProjectOutlined style={{ color: '#2f54eb' }} />
                  <span>Task Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="title"
                    label="Task Title"
                    rules={[{ required: true, message: 'Please enter task title' }]}
                  >
                    <Input size="large" placeholder="Enter task title" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="project"
                    label="Project"
                    rules={[{ required: true, message: 'Please select project' }]}
                  >
                    <Select size="large" placeholder="Select project">
                      {projects.map((project: any) => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="assignee"
                    label="Assignee"
                    rules={[{ required: true, message: 'Please select assignee' }]}
                  >
                    <Select size="large" placeholder="Select assignee">
                      {employees.map((employee: any) => (
                        <Option key={employee.id} value={employee.id}>
                          {employee.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[{ required: true, message: 'Please select start date' }]}
                  >
                    <DatePicker size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dueDate"
                    label="Due Date"
                    rules={[{ required: true, message: 'Please select due date' }]}
                  >
                    <DatePicker size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true, message: 'Please select priority' }]}
                  >
                    <Select size="large" placeholder="Select priority">
                      <Option value="LOW">Low</Option>
                      <Option value="MEDIUM">Medium</Option>
                      <Option value="HIGH">High</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select size="large" placeholder="Select status">
                      <Option value="TODO">To Do</Option>
                      <Option value="IN_PROGRESS">In Progress</Option>
                      <Option value="REVIEW">Review</Option>
                      <Option value="DONE">Done</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="estimatedHours"
                    label="Estimated Hours"
                    rules={[{ required: true, message: 'Please enter estimated hours' }]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="0"
                      style={{ width: '100%' }}
                      min={0}
                      precision={1}
                      suffix="hours"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <TextArea rows={6} placeholder="Enter task description and requirements" />
                  </Form.Item>
                </Col>
              </Row>
            </PremiumCard>
          </Col>

          <Col xs={24} lg={8}>
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
                border: 'none',
                position: 'sticky',
                top: 24,
              }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                  <Title level={4} style={{ color: '#fff', marginTop: 16, marginBottom: 8 }}>
                    Task Summary
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    Configure task details and assignment
                  </Text>
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />

                <div
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Priority
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>
                        {Form.useWatch('priority', form) || 'Not set'}
                      </Text>
                    </div>
                    <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Status
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>
                        {Form.useWatch('status', form)?.replace('_', ' ') || 'Not set'}
                      </Text>
                    </div>
                    <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Estimated Time
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 20 }}>
                        {Form.useWatch('estimatedHours', form) || '0'}h
                      </Text>
                    </div>
                  </Space>
                </div>

                <div
                  style={{
                    background: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#ad6800' }}>
                    <strong>Tip:</strong> Break down large tasks into smaller, manageable ones for better tracking and productivity.
                  </Text>
                </div>
              </Space>
            </PremiumCard>
          </Col>
        </Row>

        <PremiumCard style={{ marginTop: 16 }}>
          <Row justify="end">
            <Col>
              <Space size="middle">
                <Button
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={() => navigate('/admin/projects/tasks')}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={loading}
                  style={{
                    background: 'linear-gradient(135deg, #2f54eb 0%, #1890ff 100%)',
                    border: 'none',
                    minWidth: 120,
                  }}
                >
                  {isEdit ? 'Update' : 'Create'} Task
                </Button>
              </Space>
            </Col>
          </Row>
        </PremiumCard>
      </Form>
    </div>
  );
};

export default TaskFormPage;
