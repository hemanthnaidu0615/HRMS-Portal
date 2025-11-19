import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Divider,
  Tag,
  Alert,
  Modal,
  Statistic
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import dayjs from 'dayjs';
import './runs.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

const RunsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/departments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartments(response.data);
    } catch (error: any) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
    } catch (error: any) {
      console.error('Failed to fetch employees', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/runs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue({
        ...data,
        dateRange: data.startDate && data.endDate ? [dayjs(data.startDate), dayjs(data.endDate)] : null,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payroll run');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form.validateFields().then((values) => {
      const [startDate, endDate] = values.dateRange || [];
      const preview = {
        payPeriod: values.payPeriod,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        employeeCount: values.employeeSelection === 'all'
          ? employees.length
          : (values.selectedDepartments?.length || 0) > 0
            ? employees.filter(emp => values.selectedDepartments.includes(emp.department)).length
            : 0,
        status: 'pending',
        estimatedAmount: 0, // This would come from backend calculation
      };
      setPreviewData(preview);
      setPreviewVisible(true);
    }).catch(() => {
      message.warning('Please fill all required fields before preview');
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [startDate, endDate] = values.dateRange || [];

      const payload = {
        payPeriod: values.payPeriod,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        status: 'pending',
        employeeSelection: values.employeeSelection,
        selectedDepartments: values.selectedDepartments || [],
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/payroll/runs/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payroll run updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/runs`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payroll run created successfully');
      }
      navigate('/admin/payroll/runs');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} payroll run`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="payroll-runs-page">
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/payroll/runs')}
          style={{ marginBottom: 16 }}
        >
          Back to Payroll Runs
        </Button>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
          <DollarOutlined style={{ marginRight: 12, color: '#faad14' }} />
          {isEdit ? 'Edit Payroll Run' : 'Create Payroll Run'}
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          Set up a new payroll run for your employees
        </p>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            employeeSelection: 'all',
            status: 'pending',
          }}
        >
          <Alert
            message="Payroll Run Setup"
            description="Configure the payroll period and select which employees should be included in this payroll run."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="payPeriod"
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Pay Period Name
                  </span>
                }
                rules={[{ required: true, message: 'Please enter pay period' }]}
                tooltip="e.g., January 2024, Q1 2024"
              >
                <Input
                  placeholder="Enter pay period (e.g., January 2024)"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Pay Period Date Range
                  </span>
                }
                rules={[{ required: true, message: 'Please select date range' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Employee Selection</Divider>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="employeeSelection"
                label={
                  <span>
                    <TeamOutlined style={{ marginRight: 4 }} />
                    Employee Selection Method
                  </span>
                }
                rules={[{ required: true, message: 'Please select employee selection method' }]}
              >
                <Select
                  size="large"
                  placeholder="Select employee selection method"
                >
                  <Option value="all">
                    <Space>
                      <TeamOutlined />
                      All Employees
                    </Space>
                  </Option>
                  <Option value="departments">
                    <Space>
                      <TeamOutlined />
                      Specific Departments
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.employeeSelection !== currentValues.employeeSelection
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('employeeSelection') === 'departments' ? (
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      name="selectedDepartments"
                      label="Select Departments"
                      rules={[{ required: true, message: 'Please select at least one department' }]}
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select departments"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as string).toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {departments.map((dept) => (
                          <Option key={dept.id} value={dept.id}>
                            {dept.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              ) : null
            }
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space size="middle">
              <Button
                type="default"
                size="large"
                icon={<EyeOutlined />}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{ background: '#faad14', borderColor: '#faad14' }}
              >
                {isEdit ? 'Update Payroll Run' : 'Create Payroll Run'}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/payroll/runs')}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Preview Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: 8 }} />
            Payroll Run Preview
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {previewData && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Pay Period"
                    value={previewData.payPeriod}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Employees"
                    value={previewData.employeeCount}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
            <Card style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Period:</strong> {previewData.startDate} to {previewData.endDate}
                </div>
                <div>
                  <strong>Status:</strong> <Tag color="warning">PENDING</Tag>
                </div>
                <Alert
                  message="Ready to Create"
                  description="This payroll run will be created with pending status. You can process it after creation."
                  type="success"
                  showIcon
                />
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RunsFormPage;
