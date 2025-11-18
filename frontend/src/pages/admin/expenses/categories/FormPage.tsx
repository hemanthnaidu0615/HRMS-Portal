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
} from 'antd';
import {
  TagsOutlined,
  SaveOutlined,
  CloseOutlined,
  DollarOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Title, Text } = Typography;

const CategoriesFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/expenses/categories/${id}`);
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense category');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit) {
        await http.put(`/api/expenses/categories/${id}`, values);
        message.success('Expense category updated successfully');
      } else {
        await http.post('/api/expenses/categories', values);
        message.success('Expense category created successfully');
      }
      navigate('/admin/expenses/categories');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} expense category`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#f5222d' }}>
            <TagsOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Expense Category' : 'Create Expense Category'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update expense category details' : 'Create a new expense category with limits'}
          </Text>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            {/* Basic Information */}
            <PremiumCard
              title={
                <Space>
                  <TagsOutlined style={{ color: '#f5222d' }} />
                  <span>Category Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Category Name"
                    rules={[{ required: true, message: 'Please enter category name' }]}
                  >
                    <Input size="large" placeholder="e.g., Travel, Meals, Office Supplies" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Category Code"
                    rules={[{ required: true, message: 'Please enter category code' }]}
                  >
                    <Input size="large" placeholder="e.g., TRV, MEA, OFF" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="maxAmount"
                    label="Maximum Amount"
                    rules={[{ required: true, message: 'Please enter maximum amount' }]}
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
              </Row>
            </PremiumCard>

            {/* Settings */}
            <PremiumCard
              title={
                <Space>
                  <CheckOutlined style={{ color: '#f5222d' }} />
                  <span>Category Settings</span>
                </Space>
              }
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space direction="vertical" size={0}>
                        <Text strong>Requires Receipt</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Claims in this category must include a receipt
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <Form.Item name="requiresReceipt" valuePropName="checked" noStyle initialValue={true}>
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: 0 }} />

                <div>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space direction="vertical" size={0}>
                        <Text strong>Requires Approval</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Claims in this category need manager approval
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <Form.Item name="requiresApproval" valuePropName="checked" noStyle initialValue={true}>
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: 0 }} />

                <div>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space direction="vertical" size={0}>
                        <Text strong>Active Status</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Enable or disable this category
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Space>
            </PremiumCard>
          </Col>

          {/* Summary */}
          <Col xs={24} lg={8}>
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
                position: 'sticky',
                top: 24,
              }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <DollarOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                  <Title level={4} style={{ color: '#fff', marginTop: 16, marginBottom: 8 }}>
                    Category Summary
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    Configure expense category limits and requirements
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
                        Category Code
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>
                        {Form.useWatch('code', form) || 'Not set'}
                      </Text>
                    </div>
                    <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Maximum Amount
                      </Text>
                      <br />
                      <Text strong style={{ color: '#fff', fontSize: 20 }}>
                        ${Form.useWatch('maxAmount', form)?.toFixed(2) || '0.00'}
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
                    <strong>Note:</strong> All fields are required. The maximum amount will be enforced for all claims in this category.
                  </Text>
                </div>
              </Space>
            </PremiumCard>
          </Col>
        </Row>

        {/* Action Buttons */}
        <PremiumCard style={{ marginTop: 16 }}>
          <Row justify="end">
            <Col>
              <Space size="middle">
                <Button
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={() => navigate('/admin/expenses/categories')}
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
                    background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                    border: 'none',
                    minWidth: 120,
                  }}
                >
                  {isEdit ? 'Update' : 'Create'} Category
                </Button>
              </Space>
            </Col>
          </Row>
        </PremiumCard>
      </Form>
    </div>
  );
};

export default CategoriesFormPage;
