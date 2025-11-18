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
  Switch,
  Alert,
  Radio,
  Tooltip
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  PercentageOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import './components.css';

const { Option } = Select;
const { TextArea } = Input;

const ComponentsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculationType, setCalculationType] = useState<'fixed' | 'percentage'>('fixed');
  const [componentType, setComponentType] = useState<'earning' | 'deduction'>('earning');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/payroll/components/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue(data);
      setCalculationType(data.calculationType || 'fixed');
      setComponentType(data.type || 'earning');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch salary component');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        name: values.name,
        type: values.type,
        calculationType: values.calculationType,
        percentage: values.calculationType === 'percentage' ? values.percentage : undefined,
        amount: values.calculationType === 'fixed' ? values.amount : undefined,
        isTaxable: values.isTaxable || false,
        isActive: values.isActive !== undefined ? values.isActive : true,
        description: values.description,
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/payroll/components/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Salary component updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/components`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Salary component created successfully');
      }
      navigate('/admin/payroll/components');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} salary component`);
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

  return (
    <div className="components-page">
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/payroll/components')}
          style={{ marginBottom: 16 }}
        >
          Back to Salary Components
        </Button>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
          <DollarOutlined style={{ marginRight: 12, color: '#faad14' }} />
          {isEdit ? 'Edit Salary Component' : 'Create Salary Component'}
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          Configure earnings and deductions for payroll calculation
        </p>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                type: 'earning',
                calculationType: 'fixed',
                isActive: true,
                isTaxable: false,
              }}
            >
              <Alert
                message="Component Configuration"
                description="Set up the salary component with its type, calculation method, and other details"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="name"
                    label="Component Name"
                    rules={[{ required: true, message: 'Please enter component name' }]}
                    tooltip="A clear, descriptive name for this component (e.g., Housing Allowance, Health Insurance)"
                  >
                    <Input
                      placeholder="Enter component name"
                      size="large"
                      prefix={<DollarOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="type"
                    label="Component Type"
                    rules={[{ required: true, message: 'Please select component type' }]}
                    tooltip="Select whether this component adds to or subtracts from the salary"
                  >
                    <Select
                      size="large"
                      placeholder="Select component type"
                      onChange={(value) => setComponentType(value)}
                    >
                      <Option value="earning">
                        <Space>
                          <RiseOutlined style={{ color: '#52c41a' }} />
                          Earning (Addition)
                        </Space>
                      </Option>
                      <Option value="deduction">
                        <Space>
                          <FallOutlined style={{ color: '#ff4d4f' }} />
                          Deduction (Subtraction)
                        </Space>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="calculationType"
                    label="Calculation Type"
                    rules={[{ required: true, message: 'Please select calculation type' }]}
                    tooltip="Choose how this component's value is calculated"
                  >
                    <Select
                      size="large"
                      placeholder="Select calculation type"
                      onChange={(value) => setCalculationType(value)}
                    >
                      <Option value="fixed">
                        <Space>
                          <DollarOutlined style={{ color: '#1890ff' }} />
                          Fixed Amount
                        </Space>
                      </Option>
                      <Option value="percentage">
                        <Space>
                          <PercentageOutlined style={{ color: '#722ed1' }} />
                          Percentage of Basic Salary
                        </Space>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Value Configuration</Divider>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.calculationType !== currentValues.calculationType
                }
              >
                {({ getFieldValue }) => {
                  const calcType = getFieldValue('calculationType');
                  return calcType === 'fixed' ? (
                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Item
                          name="amount"
                          label={
                            <span>
                              <DollarOutlined style={{ marginRight: 4 }} />
                              Fixed Amount
                            </span>
                          }
                          rules={[{ required: true, message: 'Please enter amount' }]}
                          tooltip="Enter the fixed amount for this component"
                        >
                          <InputNumber
                            placeholder="Enter amount"
                            size="large"
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Item
                          name="percentage"
                          label={
                            <span>
                              <PercentageOutlined style={{ marginRight: 4 }} />
                              Percentage
                            </span>
                          }
                          rules={[
                            { required: true, message: 'Please enter percentage' },
                            { type: 'number', min: 0, max: 100, message: 'Percentage must be between 0 and 100' }
                          ]}
                          tooltip="Enter the percentage of basic salary for this component"
                        >
                          <InputNumber
                            placeholder="Enter percentage"
                            size="large"
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            step={0.1}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace('%', '') as any}
                          />
                        </Form.Item>
                        <Alert
                          message="Example Calculation"
                          description={
                            <div>
                              If basic salary is <strong>$5,000</strong> and percentage is{' '}
                              <strong>{getFieldValue('percentage') || 0}%</strong>, the component value will be{' '}
                              <strong>{formatCurrency((5000 * (getFieldValue('percentage') || 0)) / 100)}</strong>
                            </div>
                          }
                          type="info"
                          showIcon
                          style={{ marginTop: 8 }}
                        />
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>

              <Divider>Additional Settings</Divider>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="isTaxable"
                    label="Tax Status"
                    valuePropName="checked"
                    tooltip="Indicate whether this component is subject to taxation"
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Radio.Group
                        onChange={(e) => form.setFieldsValue({ isTaxable: e.target.value })}
                        value={form.getFieldValue('isTaxable')}
                      >
                        <Space direction="vertical">
                          <Radio value={true}>
                            <Space>
                              <SafetyOutlined style={{ color: '#faad14' }} />
                              Taxable - Subject to tax deductions
                            </Space>
                          </Radio>
                          <Radio value={false}>
                            <Space>
                              <SafetyOutlined style={{ color: '#52c41a' }} />
                              Non-Taxable - Exempt from tax
                            </Space>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Space>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="isActive"
                    label="Component Status"
                    valuePropName="checked"
                    tooltip="Active components will be available for use in payroll processing"
                  >
                    <Space align="start">
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        defaultChecked
                      />
                      <Tooltip title="Toggle to activate or deactivate this component">
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                      </Tooltip>
                    </Space>
                  </Form.Item>
                  <Alert
                    message="Only active components can be used in payroll processing"
                    type="warning"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label="Description (Optional)"
                    tooltip="Add any additional notes or details about this component"
                  >
                    <TextArea
                      placeholder="Enter description"
                      rows={4}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                    style={{ background: '#faad14', borderColor: '#faad14' }}
                  >
                    {isEdit ? 'Update Component' : 'Create Component'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate('/admin/payroll/components')}
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
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Component Preview
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', position: 'sticky', top: 24 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Component Name</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {form.getFieldValue('name') || 'Not set'}
                </div>
              </div>

              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Type</div>
                <div>
                  {componentType === 'earning' ? (
                    <Space>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <span style={{ color: '#52c41a', fontWeight: 500 }}>Earning</span>
                    </Space>
                  ) : (
                    <Space>
                      <FallOutlined style={{ color: '#ff4d4f' }} />
                      <span style={{ color: '#ff4d4f', fontWeight: 500 }}>Deduction</span>
                    </Space>
                  )}
                </div>
              </div>

              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Calculation</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  {calculationType === 'fixed' ? (
                    <Space>
                      <DollarOutlined style={{ color: '#1890ff' }} />
                      <span>{formatCurrency(form.getFieldValue('amount') || 0)}</span>
                    </Space>
                  ) : (
                    <Space>
                      <PercentageOutlined style={{ color: '#722ed1' }} />
                      <span>{form.getFieldValue('percentage') || 0}% of Basic Salary</span>
                    </Space>
                  )}
                </div>
              </div>

              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Tax Status</div>
                <div>
                  {form.getFieldValue('isTaxable') ? (
                    <Space>
                      <SafetyOutlined style={{ color: '#faad14' }} />
                      <span style={{ fontWeight: 500 }}>Taxable</span>
                    </Space>
                  ) : (
                    <Space>
                      <SafetyOutlined style={{ color: '#52c41a' }} />
                      <span style={{ fontWeight: 500 }}>Non-Taxable</span>
                    </Space>
                  )}
                </div>
              </div>

              <div>
                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Status</div>
                <div>
                  {form.getFieldValue('isActive') !== false ? (
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span style={{ color: '#52c41a', fontWeight: 500 }}>Active</span>
                    </Space>
                  ) : (
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span style={{ color: '#ff4d4f', fontWeight: 500 }}>Inactive</span>
                    </Space>
                  )}
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Alert
                message="Quick Tip"
                description={
                  componentType === 'earning'
                    ? "Earnings increase the employee's total salary"
                    : "Deductions decrease the employee's total salary"
                }
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComponentsFormPage;
