import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  DatePicker,
  Select,
  Typography,
  Space,
  Divider,
  Card,
} from 'antd';
import {
  SwapOutlined,
  SaveOutlined,
  CloseOutlined,
  LaptopOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
}

interface Employee {
  id: string;
  name: string;
}

const AssetAssignmentFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    if (isEdit) {
      fetchAssignment();
    }
  }, [id]);

  const fetchAssets = async () => {
    try {
      const response = await http.get('/api/assets/assets', {
        params: { status: 'AVAILABLE' },
      });
      setAssets(response.data);
    } catch (error: any) {
      message.error('Failed to fetch assets');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error: any) {
      message.error('Failed to fetch employees');
    }
  };

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/assets/assignments/${id}`);
      const assignment = response.data;
      form.setFieldsValue({
        ...assignment,
        assignedDate: dayjs(assignment.assignedDate),
        expectedReturnDate: assignment.expectedReturnDate
          ? dayjs(assignment.expectedReturnDate)
          : undefined,
        asset: assignment.asset.id,
        employee: assignment.employee.id,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch assignment');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        assignedDate: values.assignedDate.format('YYYY-MM-DD'),
        expectedReturnDate: values.expectedReturnDate
          ? values.expectedReturnDate.format('YYYY-MM-DD')
          : undefined,
      };

      if (isEdit) {
        await http.put(`/api/assets/assignments/${id}`, payload);
        message.success('Assignment updated successfully');
      } else {
        await http.post('/api/assets/assignments', payload);
        message.success('Asset assigned successfully');
      }
      navigate('/admin/assets/assignments');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} assignment`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
          <SwapOutlined style={{ marginRight: 12 }} />
          {isEdit ? 'Edit Assignment' : 'Assign Asset'}
        </Title>
        <Text type="secondary">
          {isEdit ? 'Update asset assignment details' : 'Assign an asset to an employee'}
        </Text>
      </div>

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
              requiredMark="optional"
              initialValues={{
                condition: 'GOOD',
                assignedDate: dayjs(),
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="asset"
                    label={
                      <span>
                        <LaptopOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Asset
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select an asset' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select asset"
                      showSearch
                      optionFilterProp="children"
                      style={{ borderRadius: 8 }}
                      disabled={isEdit}
                    >
                      {assets.map((asset) => (
                        <Option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.assetTag})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="employee"
                    label={
                      <span>
                        <UserOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
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
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="assignedDate"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Assignment Date
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select assignment date' }]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: '100%', borderRadius: 8 }}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="expectedReturnDate"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Expected Return Date
                      </span>
                    }
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
                    name="condition"
                    label={
                      <span>
                        <CheckCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Condition
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select condition' }]}
                  >
                    <Select size="large" style={{ borderRadius: 8 }}>
                      <Option value="EXCELLENT">Excellent</Option>
                      <Option value="GOOD">Good</Option>
                      <Option value="FAIR">Fair</Option>
                      <Option value="POOR">Poor</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="status"
                    label={
                      <span>
                        <CheckCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Status
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select status' }]}
                    initialValue="ACTIVE"
                  >
                    <Select size="large" style={{ borderRadius: 8 }}>
                      <Option value="ACTIVE">Active</Option>
                      <Option value="RETURNED">Returned</Option>
                      <Option value="OVERDUE">Overdue</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item
                name="notes"
                label={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Notes
                  </span>
                }
              >
                <TextArea
                  rows={4}
                  placeholder="Additional notes or instructions..."
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
                      background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                      border: 'none',
                      borderRadius: 8,
                      height: 44,
                      paddingLeft: 24,
                      paddingRight: 24,
                      boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)',
                    }}
                  >
                    {isEdit ? 'Update Assignment' : 'Assign Asset'}
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/admin/assets/assignments')}
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

        <Col xs={24} lg={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  <SwapOutlined style={{ marginRight: 8 }} />
                  Assignment Guidelines
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
                    • Only available assets can be assigned
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Check asset condition before assignment
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Set expected return date for tracking
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Add notes for special instructions
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Update status when asset is returned
                  </Text>
                </Space>
              </Card>
            </Space>
          </PremiumCard>
        </Col>
      </Row>
    </div>
  );
};

export default AssetAssignmentFormPage;
