import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Select,
  Row,
  Col,
  Space,
  Divider,
  InputNumber,
  Table,
  Tag,
  Alert,
  Statistic,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  CalculatorOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import './payslips.css';

const { Option } = Select;

interface Employee {
  id: string;
  name: string;
  department: string;
  basicSalary: number;
}

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage';
  amount: number;
  percentage: number;
}

interface ComponentLine {
  componentId: string;
  name: string;
  type: 'earning' | 'deduction';
  amount: number;
}

const PayslipsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [componentLines, setComponentLines] = useState<ComponentLine[]>([]);
  const [basicSalary, setBasicSalary] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [grossSalary, setGrossSalary] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    fetchComponents();
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    calculateSalary();
  }, [basicSalary, componentLines]);

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

  const fetchComponents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/components`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComponents(response.data);
    } catch (error: any) {
      console.error('Failed to fetch salary components', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/payslips/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue(data);
      setBasicSalary(data.basicSalary || 0);
      setComponentLines(data.components || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setBasicSalary(employee.basicSalary || 0);
      form.setFieldsValue({ basicSalary: employee.basicSalary });
    }
  };

  const handleAddComponent = () => {
    const componentId = form.getFieldValue('selectedComponent');
    if (!componentId) {
      message.warning('Please select a component');
      return;
    }

    const component = components.find(c => c.id === componentId);
    if (!component) return;

    // Check if component already added
    if (componentLines.find(c => c.componentId === componentId)) {
      message.warning('Component already added');
      return;
    }

    let amount = 0;
    if (component.calculationType === 'fixed') {
      amount = component.amount;
    } else {
      amount = (basicSalary * component.percentage) / 100;
    }

    const newLine: ComponentLine = {
      componentId: component.id,
      name: component.name,
      type: component.type,
      amount: amount,
    };

    setComponentLines([...componentLines, newLine]);
    form.setFieldsValue({ selectedComponent: undefined });
  };

  const handleRemoveComponent = (componentId: string) => {
    setComponentLines(componentLines.filter(c => c.componentId !== componentId));
  };

  const handleComponentAmountChange = (componentId: string, newAmount: number) => {
    setComponentLines(
      componentLines.map(c =>
        c.componentId === componentId ? { ...c, amount: newAmount } : c
      )
    );
  };

  const calculateSalary = () => {
    const earnings = componentLines
      .filter(c => c.type === 'earning')
      .reduce((sum, c) => sum + c.amount, 0);

    const deductions = componentLines
      .filter(c => c.type === 'deduction')
      .reduce((sum, c) => sum + c.amount, 0);

    const gross = basicSalary + earnings;
    const net = gross - deductions;

    setTotalEarnings(earnings);
    setTotalDeductions(deductions);
    setGrossSalary(gross);
    setNetSalary(net);
  };

  const onFinish = async (values: any) => {
    if (!selectedEmployee) {
      message.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        employee: selectedEmployee.name,
        employeeId: selectedEmployee.id,
        payPeriod: values.payPeriod,
        month: values.month,
        year: values.year,
        basicSalary: basicSalary,
        grossSalary: grossSalary,
        deductions: totalDeductions,
        netSalary: netSalary,
        components: componentLines,
        status: 'generated',
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/payroll/payslips/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payslip updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/payslips`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payslip generated successfully');
      }
      navigate('/admin/payroll/payslips');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'generate'} payslip`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const componentColumns = [
    {
      title: 'Component',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ComponentLine) => (
        <Space>
          <Tag color={record.type === 'earning' ? 'green' : 'red'}>
            {record.type === 'earning' ? 'EARNING' : 'DEDUCTION'}
          </Tag>
          {text}
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: ComponentLine) => (
        <InputNumber
          value={amount}
          onChange={(value) => handleComponentAmountChange(record.componentId, value || 0)}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
          style={{ width: '150px' }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ComponentLine) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveComponent(record.componentId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="payslips-page">
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/payroll/payslips')}
          style={{ marginBottom: 16 }}
        >
          Back to Payslips
        </Button>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
          <DollarOutlined style={{ marginRight: 12, color: '#faad14' }} />
          {isEdit ? 'Edit Payslip' : 'Generate Payslip'}
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          Generate payslip with salary breakdown and components
        </p>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', marginBottom: 16 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Alert
                message="Employee & Period Information"
                description="Select the employee and pay period for this payslip"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="employeeId"
                    label={
                      <span>
                        <UserOutlined style={{ marginRight: 4 }} />
                        Employee
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select employee' }]}
                  >
                    <Select
                      placeholder="Select employee"
                      size="large"
                      showSearch
                      onChange={handleEmployeeChange}
                      filterOption={(input, option) =>
                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {employees.map((emp) => (
                        <Option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="payPeriod"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Pay Period
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter pay period' }]}
                  >
                    <Input
                      placeholder="e.g., January 2024"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="month"
                    label="Month"
                    rules={[{ required: true, message: 'Please select month' }]}
                  >
                    <Select placeholder="Select month" size="large">
                      {['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((month) => (
                        <Option key={month} value={month}>{month}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="year"
                    label="Year"
                    rules={[{ required: true, message: 'Please enter year' }]}
                  >
                    <InputNumber
                      placeholder="Enter year"
                      size="large"
                      style={{ width: '100%' }}
                      min={2020}
                      max={2100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Salary Breakdown</Divider>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="basicSalary"
                    label={
                      <span>
                        <DollarOutlined style={{ marginRight: 4 }} />
                        Basic Salary
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter basic salary' }]}
                  >
                    <InputNumber
                      placeholder="Enter basic salary"
                      size="large"
                      style={{ width: '100%' }}
                      min={0}
                      value={basicSalary}
                      onChange={(value) => setBasicSalary(value || 0)}
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Salary Components</Divider>

              <Row gutter={16}>
                <Col xs={24} md={18}>
                  <Form.Item
                    name="selectedComponent"
                    label="Add Salary Component"
                  >
                    <Select
                      placeholder="Select a component to add"
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {components
                        .filter(c => !componentLines.find(cl => cl.componentId === c.id))
                        .map((comp) => (
                          <Option key={comp.id} value={comp.id}>
                            <Space>
                              <Tag color={comp.type === 'earning' ? 'green' : 'red'}>
                                {comp.type.toUpperCase()}
                              </Tag>
                              {comp.name}
                              <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                                ({comp.calculationType === 'fixed'
                                  ? formatCurrency(comp.amount)
                                  : `${comp.percentage}%`})
                              </span>
                            </Space>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label=" ">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddComponent}
                      block
                      size="large"
                    >
                      Add Component
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              {componentLines.length > 0 && (
                <Table
                  dataSource={componentLines}
                  columns={componentColumns}
                  rowKey="componentId"
                  pagination={false}
                  size="small"
                  style={{ marginBottom: 24 }}
                />
              )}

              <Divider />

              <Form.Item>
                <Space size="middle">
                  <Button
                    type="default"
                    size="large"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewVisible(true)}
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
                    {isEdit ? 'Update Payslip' : 'Generate Payslip'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate('/admin/payroll/payslips')}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <CalculatorOutlined style={{ marginRight: 8 }} />
                Salary Summary
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', position: 'sticky', top: 24 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Statistic
                title="Basic Salary"
                value={basicSalary}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 18 }}
              />

              <Statistic
                title="Total Earnings"
                value={totalEarnings}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 18, color: '#52c41a' }}
              />

              <Divider style={{ margin: '8px 0' }} />

              <Statistic
                title="Gross Salary"
                value={grossSalary}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}
              />

              <Statistic
                title="Total Deductions"
                value={totalDeductions}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
              />

              <Divider style={{ margin: '8px 0' }} />

              <Statistic
                title="Net Salary"
                value={netSalary}
                precision={2}
                prefix="$"
                valueStyle={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: 8 }} />
            Payslip Preview
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedEmployee && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>Employee</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedEmployee.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>Department</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedEmployee.department}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>Pay Period</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{form.getFieldValue('payPeriod')}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>Month & Year</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                      {form.getFieldValue('month')} {form.getFieldValue('year')}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Salary Breakdown">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Basic Salary:</span>
                  <strong>{formatCurrency(basicSalary)}</strong>
                </div>
                {componentLines.filter(c => c.type === 'earning').length > 0 && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ color: '#52c41a', fontWeight: 500 }}>Earnings:</div>
                    {componentLines
                      .filter(c => c.type === 'earning')
                      .map((comp) => (
                        <div key={comp.componentId} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16 }}>
                          <span>{comp.name}:</span>
                          <span style={{ color: '#52c41a' }}>+{formatCurrency(comp.amount)}</span>
                        </div>
                      ))}
                  </>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#1890ff' }}>Gross Salary:</strong>
                  <strong style={{ color: '#1890ff' }}>{formatCurrency(grossSalary)}</strong>
                </div>
                {componentLines.filter(c => c.type === 'deduction').length > 0 && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ color: '#ff4d4f', fontWeight: 500 }}>Deductions:</div>
                    {componentLines
                      .filter(c => c.type === 'deduction')
                      .map((comp) => (
                        <div key={comp.componentId} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16 }}>
                          <span>{comp.name}:</span>
                          <span style={{ color: '#ff4d4f' }}>-{formatCurrency(comp.amount)}</span>
                        </div>
                      ))}
                  </>
                )}
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                  <strong style={{ color: '#52c41a' }}>Net Salary:</strong>
                  <strong style={{ color: '#52c41a', fontSize: 20 }}>{formatCurrency(netSalary)}</strong>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayslipsFormPage;
