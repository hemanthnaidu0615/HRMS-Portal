import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Skeleton,
  Alert,
  message,
  DatePicker,
  Switch,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getClientById,
  createClient,
  updateClient,
  getNextClientCode,
  ClientDetail,
  CreateClientRequest,
  UpdateClientRequest,
} from '../../../api/clientApi';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import dayjs from 'dayjs';

const { Title } = Typography;

export const ClientFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [manualCode, setManualCode] = useState(false);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    loadEmployees();
    if (isEditMode) {
      loadClient();
    } else {
      generateClientCode();
    }
  }, [id]);

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err: any) {
      console.error('Error loading employees:', err);
      message.warning('Failed to load employees for account manager selection');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadClient = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getClientById(id!);
      setClient(data);

      // Populate form with client data
      form.setFieldsValue({
        name: data.name,
        clientCode: data.clientCode,
        clientType: data.clientType,
        industry: data.industry,
        primaryContactName: data.primaryContactName,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        taxId: data.taxId,
        website: data.website,
        relationshipStartDate: data.relationshipStartDate ? dayjs(data.relationshipStartDate) : undefined,
        relationshipStatus: data.relationshipStatus,
        accountManagerId: data.accountManagerId,
        isActive: data.isActive,
        isStrategic: data.isStrategic,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load client details');
      console.error('Error loading client:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateClientCode = async () => {
    try {
      setCodeGenerating(true);
      const code = await getNextClientCode();
      form.setFieldValue('clientCode', code);
    } catch (err: any) {
      message.error('Failed to generate client code');
    } finally {
      setCodeGenerating(false);
    }
  };

  const handleGenerateCode = () => {
    generateClientCode();
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaveLoading(true);
      setError('');

      const payload: CreateClientRequest | UpdateClientRequest = {
        name: values.name,
        clientCode: values.clientCode,
        clientType: values.clientType,
        industry: values.industry,
        primaryContactName: values.primaryContactName,
        primaryContactEmail: values.primaryContactEmail,
        primaryContactPhone: values.primaryContactPhone,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
        taxId: values.taxId,
        website: values.website,
        relationshipStartDate: values.relationshipStartDate
          ? dayjs(values.relationshipStartDate).format('YYYY-MM-DD')
          : undefined,
        accountManagerId: values.accountManagerId,
      };

      if (isEditMode) {
        const updatePayload: UpdateClientRequest = {
          ...payload,
          relationshipStatus: values.relationshipStatus,
          isActive: values.isActive,
          isStrategic: values.isStrategic,
        };
        await updateClient(id!, updatePayload);
        message.success('Client updated successfully');
      } else {
        await createClient(payload);
        message.success('Client created successfully');
      }

      navigate('/admin/clients');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} client`;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {isEditMode ? 'Edit Client' : 'Create Client'}
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                {isEditMode ? 'Update client information' : 'Add a new client to the system'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/clients')}
              style={{ borderRadius: 6 }}
            >
              Back to Clients
            </Button>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{
              isActive: true,
              isStrategic: false,
              relationshipStatus: 'active',
            }}
          >
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Basic Info',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                          label="Client Name"
                          name="name"
                          rules={[{ required: true, message: 'Please enter client name' }]}
                        >
                          <Input placeholder="Enter client name" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item
                          label="Client Code"
                          name="clientCode"
                          rules={[{ required: true, message: 'Please enter client code' }]}
                          extra={
                            !isEditMode && !manualCode && (
                              <Space size="small" style={{ marginTop: 4 }}>
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<ReloadOutlined />}
                                  onClick={handleGenerateCode}
                                  loading={codeGenerating}
                                  style={{ padding: 0, height: 'auto' }}
                                >
                                  Generate New Code
                                </Button>
                                <span>|</span>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    setManualCode(true);
                                    form.setFieldValue('clientCode', '');
                                  }}
                                  style={{ padding: 0, height: 'auto' }}
                                >
                                  Enter Manually
                                </Button>
                              </Space>
                            )
                          }
                        >
                          <Input
                            placeholder="Client code"
                            size="large"
                            style={{ borderRadius: 6 }}
                            disabled={!isEditMode && !manualCode && !codeGenerating}
                          />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                          label="Client Type"
                          name="clientType"
                          rules={[{ required: true, message: 'Please select client type' }]}
                        >
                          <Select placeholder="Select client type" size="large" style={{ borderRadius: 6 }}>
                            <Select.Option value="corporate">Corporate</Select.Option>
                            <Select.Option value="government">Government</Select.Option>
                            <Select.Option value="nonprofit">Nonprofit</Select.Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label="Industry"
                          name="industry"
                        >
                          <Input placeholder="e.g., Technology, Healthcare, Finance" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </div>

                      {isEditMode && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item label="Strategic Client" name="isStrategic" valuePropName="checked">
                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                          </Form.Item>

                          <Form.Item label="Active Status" name="isActive" valuePropName="checked">
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                          </Form.Item>
                        </div>
                      )}
                    </Space>
                  ),
                },
                {
                  key: '2',
                  label: 'Contact Info',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Primary Contact Name" name="primaryContactName">
                          <Input placeholder="Contact name" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item
                          label="Primary Contact Email"
                          name="primaryContactEmail"
                          rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                        >
                          <Input placeholder="contact@client.com" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </div>

                      <Form.Item label="Primary Contact Phone" name="primaryContactPhone">
                        <Input placeholder="+1 (555) 123-4567" size="large" style={{ borderRadius: 6 }} />
                      </Form.Item>

                      <Form.Item label="Address Line 1" name="addressLine1">
                        <Input placeholder="Street address" size="large" style={{ borderRadius: 6 }} />
                      </Form.Item>

                      <Form.Item label="Address Line 2" name="addressLine2">
                        <Input placeholder="Apt, suite, etc. (optional)" size="large" style={{ borderRadius: 6 }} />
                      </Form.Item>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="City" name="city">
                          <Input placeholder="City" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item label="State/Province" name="state">
                          <Input placeholder="State" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Country" name="country">
                          <Input placeholder="Country" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item label="Postal Code" name="postalCode">
                          <Input placeholder="ZIP/Postal code" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </div>
                    </Space>
                  ),
                },
                {
                  key: '3',
                  label: 'Business Details',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Form.Item label="Tax ID" name="taxId">
                        <Input placeholder="Tax identification number" size="large" style={{ borderRadius: 6 }} />
                      </Form.Item>

                      <Form.Item
                        label="Website"
                        name="website"
                        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                      >
                        <Input
                          placeholder="https://client-website.com"
                          size="large"
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>
                    </Space>
                  ),
                },
                {
                  key: '4',
                  label: 'Relationship',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Relationship Start Date" name="relationshipStartDate">
                          <DatePicker
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            placeholder="Select start date"
                          />
                        </Form.Item>

                        {isEditMode && (
                          <Form.Item label="Relationship Status" name="relationshipStatus">
                            <Select placeholder="Select relationship status" size="large" style={{ borderRadius: 6 }}>
                              <Select.Option value="active">Active</Select.Option>
                              <Select.Option value="prospect">Prospect</Select.Option>
                              <Select.Option value="on-hold">On Hold</Select.Option>
                              <Select.Option value="inactive">Inactive</Select.Option>
                            </Select>
                          </Form.Item>
                        )}
                      </div>

                      <Form.Item label="Account Manager" name="accountManagerId">
                        <Select
                          placeholder="Select account manager"
                          size="large"
                          style={{ borderRadius: 6 }}
                          loading={employeesLoading}
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={employees.map(emp => ({
                            value: emp.employeeId,
                            label: `${emp.firstName || ''} ${emp.lastName || ''} (${emp.email})`.trim(),
                          }))}
                        />
                      </Form.Item>
                    </Space>
                  ),
                },
              ]}
            />

            <div
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button onClick={() => navigate('/admin/clients')} size="large" style={{ borderRadius: 6 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
                size="large"
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 6,
                }}
              >
                {isEditMode ? 'Update Client' : 'Create Client'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
