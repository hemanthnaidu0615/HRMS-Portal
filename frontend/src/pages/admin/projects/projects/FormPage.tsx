import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  DatePicker,
  InputNumber,
  Select,
  Checkbox,
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
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ProjectFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchClients();
    fetchManagers();
    if (isEdit) {
      fetchProject();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await http.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await http.get('/api/employees');
      setManagers(response.data);
    } catch (error) {
      console.error('Failed to fetch managers');
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/projects/${id}`);
      const data = response.data;
      form.setFieldsValue({
        ...data,
        startDate: data.startDate ? dayjs(data.startDate) : null,
        endDate: data.endDate ? dayjs(data.endDate) : null,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch project');
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
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      };

      if (isEdit) {
        await http.put(`/api/projects/${id}`, formData);
        message.success('Project updated successfully');
      } else {
        await http.post('/api/projects', formData);
        message.success('Project created successfully');
      }
      navigate('/admin/projects/projects');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
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
            {isEdit ? 'Edit Project' : 'Create Project'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update project details' : 'Create a new project'}
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
                  <span>Project Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Project Name"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                  >
                    <Input size="large" placeholder="Enter project name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Project Code"
                    rules={[{ required: true, message: 'Please enter project code' }]}
                  >
                    <Input size="large" placeholder="Enter project code" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="client"
                    label="Client"
                    rules={[{ required: true, message: 'Please select client' }]}
                  >
                    <Select size="large" placeholder="Select client">
                      {clients.map((client: any) => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="manager"
                    label="Project Manager"
                    rules={[{ required: true, message: 'Please select manager' }]}
                  >
                    <Select size="large" placeholder="Select manager">
                      {managers.map((manager: any) => (
                        <Option key={manager.id} value={manager.id}>
                          {manager.name}
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
                    name="endDate"
                    label="End Date"
                    rules={[{ required: true, message: 'Please select end date' }]}
                  >
                    <DatePicker size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="budget"
                    label="Budget"
                    rules={[{ required: true, message: 'Please enter budget' }]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="0.00"
                      prefix="$"
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select size="large" placeholder="Select status">
                      <Option value="PLANNING">Planning</Option>
                      <Option value="ACTIVE">Active</Option>
                      <Option value="ON_HOLD">On Hold</Option>
                      <Option value="COMPLETED">Completed</Option>
                      <Option value="CANCELLED">Cancelled</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="billable" valuePropName="checked">
                    <Checkbox>This project is billable</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <TextArea rows={4} placeholder="Enter project description" />
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
                  <ProjectOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                  <Title level={4} style={{ color: '#fff', marginTop: 16, marginBottom: 8 }}>
                    Project Summary
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    Configure project details and settings
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
                        Project Code
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>
                        {Form.useWatch('code', form) || 'Not set'}
                      </Text>
                    </div>
                    <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Budget
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 20 }}>
                        ${Form.useWatch('budget', form)?.toFixed(2) || '0.00'}
                      </Text>
                    </div>
                  </Space>
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
                  onClick={() => navigate('/admin/projects/projects')}
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
                  {isEdit ? 'Update' : 'Create'} Project
                </Button>
              </Space>
            </Col>
          </Row>
        </PremiumCard>
      </Form>
    </div>
  );
};

export default ProjectFormPage;
