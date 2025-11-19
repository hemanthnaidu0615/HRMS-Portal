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
  InputNumber,
  Switch,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getVendorById,
  createVendor,
  updateVendor,
  getNextVendorCode,
  VendorDetail,
  CreateVendorRequest,
  UpdateVendorRequest,
} from '../../../api/vendorApi';
import dayjs from 'dayjs';

const { Title } = Typography;

export const VendorFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [manualCode, setManualCode] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      loadVendor();
    } else {
      generateVendorCode();
    }
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVendorById(id!);
      setVendor(data);

      // Populate form with vendor data
      form.setFieldsValue({
        name: data.name,
        vendorCode: data.vendorCode,
        vendorType: data.vendorType,
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
        businessRegistrationNumber: data.businessRegistrationNumber,
        website: data.website,
        contractStartDate: data.contractStartDate ? dayjs(data.contractStartDate) : undefined,
        contractEndDate: data.contractEndDate ? dayjs(data.contractEndDate) : undefined,
        contractStatus: data.contractStatus,
        billingType: data.billingType,
        defaultBillingRate: data.defaultBillingRate,
        paymentTerms: data.paymentTerms,
        parentVendorId: data.parentVendorId,
        isActive: data.isActive,
        isPreferred: data.isPreferred,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendor details');
      console.error('Error loading vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateVendorCode = async () => {
    try {
      setCodeGenerating(true);
      const code = await getNextVendorCode();
      form.setFieldValue('vendorCode', code);
    } catch (err: any) {
      message.error('Failed to generate vendor code');
    } finally {
      setCodeGenerating(false);
    }
  };

  const handleGenerateCode = () => {
    generateVendorCode();
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaveLoading(true);
      setError('');

      const payload: CreateVendorRequest | UpdateVendorRequest = {
        name: values.name,
        vendorCode: values.vendorCode,
        vendorType: values.vendorType,
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
        businessRegistrationNumber: values.businessRegistrationNumber,
        website: values.website,
        contractStartDate: values.contractStartDate
          ? dayjs(values.contractStartDate).format('YYYY-MM-DD')
          : undefined,
        contractEndDate: values.contractEndDate
          ? dayjs(values.contractEndDate).format('YYYY-MM-DD')
          : undefined,
        billingType: values.billingType,
        defaultBillingRate: values.defaultBillingRate,
        paymentTerms: values.paymentTerms,
        parentVendorId: values.parentVendorId,
      };

      if (isEditMode) {
        const updatePayload: UpdateVendorRequest = {
          ...payload,
          contractStatus: values.contractStatus,
          isActive: values.isActive,
          isPreferred: values.isPreferred,
        };
        await updateVendor(id!, updatePayload);
        message.success('Vendor updated successfully');
      } else {
        await createVendor(payload);
        message.success('Vendor created successfully');
      }

      navigate('/admin/vendors');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} vendor`;
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
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px 24px',
            margin: '-24px -24px 24px -24px',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {isEditMode ? 'Edit Vendor' : 'Create Vendor'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                {isEditMode ? 'Update vendor information' : 'Add a new vendor to the system'}
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/vendors')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                borderRadius: 8,
              }}
            >
              Back
            </Button>
          </div>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>

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
              isPreferred: false,
              billingType: 'hourly',
              contractStatus: 'active',
            }}
          >
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Basic Information',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                          label="Vendor Name"
                          name="name"
                          rules={[{ required: true, message: 'Please enter vendor name' }]}
                        >
                          <Input placeholder="Enter vendor name" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item
                          label="Vendor Code"
                          name="vendorCode"
                          rules={[{ required: true, message: 'Please enter vendor code' }]}
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
                                    form.setFieldValue('vendorCode', '');
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
                            placeholder="Vendor code"
                            size="large"
                            style={{ borderRadius: 6 }}
                            disabled={!isEditMode && !manualCode && !codeGenerating}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Vendor Type"
                        name="vendorType"
                        rules={[{ required: true, message: 'Please select vendor type' }]}
                      >
                        <Select placeholder="Select vendor type" size="large" style={{ borderRadius: 6 }}>
                          <Select.Option value="staffing">Staffing</Select.Option>
                          <Select.Option value="consulting">Consulting</Select.Option>
                          <Select.Option value="technology">Technology</Select.Option>
                          <Select.Option value="services">Services</Select.Option>
                        </Select>
                      </Form.Item>

                      {isEditMode && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item label="Active Status" name="isActive" valuePropName="checked">
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                          </Form.Item>

                          <Form.Item label="Preferred Vendor" name="isPreferred" valuePropName="checked">
                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                          </Form.Item>
                        </div>
                      )}
                    </Space>
                  ),
                },
                {
                  key: '2',
                  label: 'Contact Information',
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
                          <Input placeholder="contact@vendor.com" size="large" style={{ borderRadius: 6 }} />
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Tax ID" name="taxId">
                          <Input placeholder="Tax identification number" size="large" style={{ borderRadius: 6 }} />
                        </Form.Item>

                        <Form.Item label="Business Registration Number" name="businessRegistrationNumber">
                          <Input
                            placeholder="Registration number"
                            size="large"
                            style={{ borderRadius: 6 }}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        label="Website"
                        name="website"
                        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                      >
                        <Input
                          placeholder="https://vendor-website.com"
                          size="large"
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>
                    </Space>
                  ),
                },
                {
                  key: '4',
                  label: 'Contract & Billing',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Contract Start Date" name="contractStartDate">
                          <DatePicker
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            placeholder="Select start date"
                          />
                        </Form.Item>

                        <Form.Item label="Contract End Date" name="contractEndDate">
                          <DatePicker
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            placeholder="Select end date"
                          />
                        </Form.Item>
                      </div>

                      {isEditMode && (
                        <Form.Item label="Contract Status" name="contractStatus">
                          <Select placeholder="Select contract status" size="large" style={{ borderRadius: 6 }}>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="expired">Expired</Select.Option>
                            <Select.Option value="terminated">Terminated</Select.Option>
                          </Select>
                        </Form.Item>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item label="Billing Type" name="billingType">
                          <Select placeholder="Select billing type" size="large" style={{ borderRadius: 6 }}>
                            <Select.Option value="hourly">Hourly</Select.Option>
                            <Select.Option value="daily">Daily</Select.Option>
                            <Select.Option value="monthly">Monthly</Select.Option>
                            <Select.Option value="fixed">Fixed Price</Select.Option>
                          </Select>
                        </Form.Item>

                        <Form.Item label="Default Billing Rate" name="defaultBillingRate">
                          <InputNumber
                            placeholder="0.00"
                            min={0}
                            precision={2}
                            style={{ width: '100%', borderRadius: 6 }}
                            size="large"
                            prefix="$"
                          />
                        </Form.Item>
                      </div>

                      <Form.Item label="Payment Terms" name="paymentTerms">
                        <Input.TextArea
                          placeholder="e.g., Net 30, Net 60, etc."
                          rows={3}
                          style={{ borderRadius: 6 }}
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
              <Button onClick={() => navigate('/admin/vendors')} size="large" style={{ borderRadius: 6 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                }}
              >
                {isEditMode ? 'Update Vendor' : 'Create Vendor'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
