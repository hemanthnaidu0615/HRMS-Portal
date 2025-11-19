import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  InputNumber,
  Switch,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Card,
  Alert,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import {
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const TypesFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carryForwardEnabled, setCarryForwardEnabled] = useState(false);
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
      const response = await http.get(`/api/leave/types/${id}`);
      const data = response.data;
      form.setFieldsValue(data);
      setCarryForwardEnabled(data.carryForward || false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave type');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        carryForwardLimit: carryForwardEnabled ? values.carryForwardLimit : null,
      };

      if (isEdit) {
        await http.put(`/api/leave/types/${id}`, payload);
        message.success('Leave type updated successfully');
      } else {
        await http.post('/api/leave/types', payload);
        message.success('Leave type created successfully');
      }
      navigate('/admin/leave/types');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} leave type`);
    } finally {
      setLoading(false);
    }
  };

  const getCodeSuggestion = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isEdit && name) {
      const suggestion = getCodeSuggestion(name);
      form.setFieldsValue({ code: suggestion });
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
            <CalendarOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Leave Type' : 'Create Leave Type'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update leave type configuration' : 'Configure a new leave type for your organization'}
          </Text>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Form Section */}
        <Col xs={24} lg={16}>
          <PremiumCard
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
            }}
            bodyStyle={{ padding: 32 }}
          >
            {loading && isEdit ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                initialValues={{
                  carryForward: false,
                  isActive: true,
                }}
              >
                {/* Basic Information Section */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={5} style={{ color: '#52c41a', marginBottom: 16 }}>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    Basic Information
                  </Title>

                  <Row gutter={16}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        name="name"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Leave Type Name
                          </span>
                        }
                        rules={[
                          { required: true, message: 'Please enter leave type name' },
                          { min: 3, message: 'Name must be at least 3 characters' },
                        ]}
                      >
                        <Input
                          placeholder="e.g., Annual Leave, Sick Leave"
                          onChange={handleNameChange}
                          style={{ borderRadius: 8 }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="code"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Code
                            <Tooltip title="Short code for the leave type (2-3 characters)">
                              <InfoCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
                            </Tooltip>
                          </span>
                        }
                        rules={[
                          { required: true, message: 'Please enter code' },
                          { pattern: /^[A-Z]{2,3}$/, message: 'Code must be 2-3 uppercase letters' },
                        ]}
                      >
                        <Input
                          placeholder="AL, SL"
                          maxLength={3}
                          style={{ borderRadius: 8, textTransform: 'uppercase' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Description
                      </span>
                    }
                  >
                    <TextArea
                      rows={3}
                      placeholder="Brief description of this leave type..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Leave Quota Section */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={5} style={{ color: '#52c41a', marginBottom: 16 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Leave Quota
                  </Title>

                  <Form.Item
                    name="maxDays"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Maximum Days Per Year
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter maximum days' },
                      { type: 'number', min: 1, max: 365, message: 'Must be between 1 and 365' },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={365}
                      placeholder="Enter max days"
                      style={{ width: '100%', borderRadius: 8 }}
                      addonAfter="days"
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Carry Forward Section */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={5} style={{ color: '#52c41a', marginBottom: 16 }}>
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Carry Forward Settings
                  </Title>

                  <Form.Item
                    name="carryForward"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Allow Carry Forward
                        <Tooltip title="Allow unused leaves to be carried forward to the next period">
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
                        </Tooltip>
                      </span>
                    }
                    valuePropName="checked"
                  >
                    <Switch
                      onChange={(checked) => setCarryForwardEnabled(checked)}
                      checkedChildren="Yes"
                      unCheckedChildren="No"
                      style={{
                        background: carryForwardEnabled
                          ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                          : undefined,
                      }}
                    />
                  </Form.Item>

                  {carryForwardEnabled && (
                    <Form.Item
                      name="carryForwardLimit"
                      label={
                        <span style={{ fontSize: 15, fontWeight: 500 }}>
                          Carry Forward Limit
                        </span>
                      }
                      rules={[
                        {
                          required: carryForwardEnabled,
                          message: 'Please enter carry forward limit',
                        },
                        { type: 'number', min: 1, message: 'Must be at least 1 day' },
                      ]}
                      extra={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Maximum number of days that can be carried forward
                        </Text>
                      }
                    >
                      <InputNumber
                        min={1}
                        placeholder="Enter limit"
                        style={{ width: '100%', borderRadius: 8 }}
                        addonAfter="days"
                      />
                    </Form.Item>
                  )}
                </div>

                <Divider />

                {/* Status Section */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={5} style={{ color: '#52c41a', marginBottom: 16 }}>
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    Status
                  </Title>

                  <Form.Item
                    name="isActive"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Active Status
                      </span>
                    }
                    valuePropName="checked"
                    extra={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Inactive leave types cannot be used for new leave applications
                      </Text>
                    }
                  >
                    <Switch
                      checkedChildren={<CheckCircleOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                      style={{
                        background: form.getFieldValue('isActive')
                          ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                          : undefined,
                      }}
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Action Buttons */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{
                        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        border: 'none',
                        borderRadius: 8,
                        minWidth: 140,
                        height: 44,
                      }}
                    >
                      {isEdit ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => navigate('/admin/leave/types')}
                      style={{ borderRadius: 8, minWidth: 100, height: 44 }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </PremiumCard>
        </Col>

        {/* Help Section */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Quick Guide Card */}
            <PremiumCard>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Title level={5} style={{ margin: 0 }}>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  Quick Guide
                </Title>
                <Paragraph style={{ margin: 0, fontSize: 13 }}>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    <li>Choose a clear, descriptive name</li>
                    <li>Use a unique 2-3 letter code</li>
                    <li>Set appropriate maximum days</li>
                    <li>Configure carry forward rules</li>
                    <li>Activate when ready to use</li>
                  </ul>
                </Paragraph>
              </Space>
            </PremiumCard>

            {/* Common Leave Types Card */}
            <PremiumCard>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Title level={5} style={{ margin: 0 }}>
                  <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  Common Leave Types
                </Title>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Space direction="vertical" size={2}>
                      <Tag color="green">AL</Tag>
                      <Text strong style={{ fontSize: 13 }}>Annual Leave</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>12-30 days per year</Text>
                    </Space>
                  </Card>
                  <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                    <Space direction="vertical" size={2}>
                      <Tag color="blue">SL</Tag>
                      <Text strong style={{ fontSize: 13 }}>Sick Leave</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>7-15 days per year</Text>
                    </Space>
                  </Card>
                  <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                    <Space direction="vertical" size={2}>
                      <Tag color="orange">CL</Tag>
                      <Text strong style={{ fontSize: 13 }}>Casual Leave</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>5-10 days per year</Text>
                    </Space>
                  </Card>
                </Space>
              </Space>
            </PremiumCard>

            {/* Best Practices Card */}
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%)',
                border: '1px solid #ffd591',
              }}
            >
              <Space direction="vertical" size={8}>
                <Space>
                  <WarningOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                  <Text strong style={{ color: '#d46b08' }}>Best Practices</Text>
                </Space>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#8c8c8c' }}>
                  <li>Review labor laws for minimum requirements</li>
                  <li>Consider industry standards</li>
                  <li>Document carry forward policies clearly</li>
                  <li>Test with sample applications before activating</li>
                </ul>
              </Space>
            </PremiumCard>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default TypesFormPage;
