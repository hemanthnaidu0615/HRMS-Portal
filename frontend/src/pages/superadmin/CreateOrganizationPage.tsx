import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Button, Alert, Typography, Space, Steps, Row, Col, Select, DatePicker, InputNumber, message
} from 'antd';
import {
  BankOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, HomeOutlined,
  SettingOutlined, CrownOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { superadminApi } from '../../api/superadminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface OrganizationFormData {
  // Basic Information
  name: string;
  industry?: string;
  organizationSize?: string;
  registrationNumber?: string;
  taxId?: string;

  // Contact Information
  email?: string;
  phone?: string;
  website?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;

  // Configuration
  timezone?: string;
  defaultCurrency?: string;
  dateFormat?: string;
  fiscalYearStartMonth?: number;

  // Subscription
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxEmployees?: number;
}

export const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<OrganizationFormData>>({});

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Consulting', 'Real Estate', 'Hospitality', 'Transportation', 'Other'
  ];

  const organizationSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  const countries = [
    { code: 'USA', name: 'United States', currency: 'USD' },
    { code: 'GBR', name: 'United Kingdom', currency: 'GBP' },
    { code: 'IND', name: 'India', currency: 'INR' },
    { code: 'CAN', name: 'Canada', currency: 'CAD' },
    { code: 'AUS', name: 'Australia', currency: 'AUD' },
    { code: 'DEU', name: 'Germany', currency: 'EUR' },
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo',
    'Australia/Sydney', 'Pacific/Auckland'
  ];

  const currencies = ['USD', 'GBP', 'EUR', 'INR', 'CAD', 'AUD', 'JPY'];

  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

  const subscriptionPlans = [
    { value: 'free', label: 'Free', maxEmployees: 10 },
    { value: 'starter', label: 'Starter', maxEmployees: 50 },
    { value: 'professional', label: 'Professional', maxEmployees: 200 },
    { value: 'enterprise', label: 'Enterprise', maxEmployees: null },
  ];

  const steps = [
    {
      title: 'Basic Info',
      icon: <BankOutlined />,
      description: 'Company details'
    },
    {
      title: 'Contact',
      icon: <MailOutlined />,
      description: 'Contact information'
    },
    {
      title: 'Address',
      icon: <HomeOutlined />,
      description: 'Location details'
    },
    {
      title: 'Settings',
      icon: <SettingOutlined />,
      description: 'Preferences'
    },
    {
      title: 'Subscription',
      icon: <CrownOutlined />,
      description: 'Plan selection'
    }
  ];

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
      setError('');
    } catch (err) {
      message.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    const values = form.getFieldsValue();
    setFormData({ ...formData, ...values });
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const finalData = { ...formData, ...values };

      // Convert date fields
      if (finalData.subscriptionStartDate) {
        finalData.subscriptionStartDate = dayjs(finalData.subscriptionStartDate).format('YYYY-MM-DD');
      }
      if (finalData.subscriptionEndDate) {
        finalData.subscriptionEndDate = dayjs(finalData.subscriptionEndDate).format('YYYY-MM-DD');
      }

      setError('');
      setLoading(true);

      await superadminApi.createOrganization(finalData);
      message.success('Organization created successfully!');
      navigate('/superadmin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization');
      message.error('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Basic Information</Title>
              <Text type="secondary">Tell us about your organization</Text>
            </div>

            <Form.Item
              label="Organization Name"
              name="name"
              rules={[{ required: true, message: 'Please enter organization name' }]}
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="e.g., Acme Corporation"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Industry" name="industry">
              <Select
                placeholder="Select industry"
                size="large"
                showSearch
                allowClear
              >
                {industries.map(ind => (
                  <Option key={ind} value={ind}>{ind}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Organization Size" name="organizationSize">
              <Select
                placeholder="Select organization size"
                size="large"
                allowClear
              >
                {organizationSizes.map(size => (
                  <Option key={size} value={size}>{size} employees</Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Registration Number" name="registrationNumber">
                  <Input placeholder="e.g., 123456789" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tax ID" name="taxId">
                  <Input placeholder="e.g., 12-3456789" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        );

      case 1:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Contact Information</Title>
              <Text type="secondary">How can we reach your organization?</Text>
            </div>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="e.g., contact@company.com"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Phone Number" name="phone">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="e.g., +1 (555) 123-4567"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Website"
              name="website"
              rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
            >
              <Input
                prefix={<GlobalOutlined />}
                placeholder="e.g., https://www.company.com"
                size="large"
              />
            </Form.Item>
          </Space>
        );

      case 2:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Address</Title>
              <Text type="secondary">Where is your organization located?</Text>
            </div>

            <Form.Item label="Address Line 1" name="addressLine1">
              <Input placeholder="Street address" size="large" />
            </Form.Item>

            <Form.Item label="Address Line 2" name="addressLine2">
              <Input placeholder="Suite, building, floor (optional)" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="City" name="city">
                  <Input placeholder="City" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="State/Province" name="state">
                  <Input placeholder="State or Province" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Country" name="country">
                  <Select
                    placeholder="Select country"
                    size="large"
                    showSearch
                    onChange={(value) => {
                      const country = countries.find(c => c.name === value);
                      if (country) {
                        form.setFieldsValue({
                          countryCode: country.code,
                          defaultCurrency: country.currency
                        });
                      }
                    }}
                  >
                    {countries.map(c => (
                      <Option key={c.code} value={c.name}>{c.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Postal Code" name="postalCode">
                  <Input placeholder="ZIP/Postal code" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="countryCode" hidden>
              <Input />
            </Form.Item>
          </Space>
        );

      case 3:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Configuration Settings</Title>
              <Text type="secondary">Customize your organization preferences</Text>
            </div>

            <Form.Item label="Timezone" name="timezone" initialValue="UTC">
              <Select placeholder="Select timezone" size="large" showSearch>
                {timezones.map(tz => (
                  <Option key={tz} value={tz}>{tz}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Default Currency" name="defaultCurrency" initialValue="USD">
              <Select placeholder="Select currency" size="large" showSearch>
                {currencies.map(currency => (
                  <Option key={currency} value={currency}>{currency}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Date Format" name="dateFormat" initialValue="MM/DD/YYYY">
              <Select placeholder="Select date format" size="large">
                {dateFormats.map(format => (
                  <Option key={format} value={format}>{format}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Fiscal Year Start Month"
              name="fiscalYearStartMonth"
              initialValue={1}
            >
              <Select placeholder="Select month" size="large">
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((month, idx) => (
                  <Option key={idx + 1} value={idx + 1}>{month}</Option>
                ))}
              </Select>
            </Form.Item>
          </Space>
        );

      case 4:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Subscription Plan</Title>
              <Text type="secondary">Choose the right plan for your organization</Text>
            </div>

            <Form.Item
              label="Subscription Plan"
              name="subscriptionPlan"
              initialValue="free"
            >
              <Select
                placeholder="Select plan"
                size="large"
                onChange={(value) => {
                  const plan = subscriptionPlans.find(p => p.value === value);
                  if (plan && plan.maxEmployees) {
                    form.setFieldsValue({ maxEmployees: plan.maxEmployees });
                  }
                }}
              >
                {subscriptionPlans.map(plan => (
                  <Option key={plan.value} value={plan.value}>
                    {plan.label}
                    {plan.maxEmployees && ` (up to ${plan.maxEmployees} employees)`}
                    {!plan.maxEmployees && ' (unlimited employees)'}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Maximum Employees" name="maxEmployees">
              <InputNumber
                placeholder="Leave empty for unlimited"
                size="large"
                style={{ width: '100%' }}
                min={1}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Subscription Start Date" name="subscriptionStartDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Subscription End Date" name="subscriptionEndDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Trial Period"
              description="New organizations start with a trial subscription. You can upgrade anytime from the settings."
              type="info"
              showIcon
            />
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>
                <BankOutlined style={{ marginRight: 12, color: '#0a0d54' }} />
                Create Organization
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Set up your organization with comprehensive details
              </Text>
            </div>

            <Steps current={currentStep} items={steps} style={{ marginTop: 24 }} />

            {error && (
              <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
            )}

            <Form
              form={form}
              layout="vertical"
              initialValues={formData}
              style={{ marginTop: 32 }}
            >
              {renderStepContent()}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 40,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Space>
                  {currentStep > 0 && (
                    <Button size="large" onClick={handlePrevious}>
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/superadmin/organizations')}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>

                <Space>
                  {currentStep < steps.length - 1 && (
                    <Button type="primary" size="large" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={handleSubmit}
                      loading={loading}
                      style={{
                        background: '#52c41a',
                        borderColor: '#52c41a'
                      }}
                    >
                      Create Organization
                    </Button>
                  )}
                </Space>
              </div>
            </Form>
          </Space>
        </Card>
      </div>
    </div>
  );
};
