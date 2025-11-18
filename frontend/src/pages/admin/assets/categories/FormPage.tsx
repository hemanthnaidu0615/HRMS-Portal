import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  InputNumber,
  Typography,
  Space,
  Card,
} from 'antd';
import {
  AppstoreOutlined,
  SaveOutlined,
  CloseOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AssetCategoryFormPage: React.FC = () => {
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
      const response = await http.get(`/api/assets/categories/${id}`);
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit) {
        await http.put(`/api/assets/categories/${id}`, values);
        message.success('Category updated successfully');
      } else {
        await http.post('/api/assets/categories', values);
        message.success('Category created successfully');
      }
      navigate('/admin/assets/categories');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} category`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
          <AppstoreOutlined style={{ marginRight: 12 }} />
          {isEdit ? 'Edit Category' : 'Create Category'}
        </Title>
        <Text type="secondary">
          {isEdit ? 'Update category details' : 'Create a new asset category'}
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
                depreciationRate: 10,
                lifespanYears: 5,
              }}
            >
              <Form.Item
                name="name"
                label={
                  <span>
                    <AppstoreOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Category Name
                  </span>
                }
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
                <Input
                  size="large"
                  placeholder="e.g., Laptops, Furniture, Vehicles"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Description
                  </span>
                }
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe this asset category..."
                  style={{ borderRadius: 8 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="depreciationRate"
                    label={
                      <span>
                        <PercentageOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Depreciation Rate (% per year)
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter depreciation rate' },
                      {
                        type: 'number',
                        min: 0,
                        max: 100,
                        message: 'Rate must be between 0 and 100',
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={0}
                      max={100}
                      step={1}
                      placeholder="10"
                      style={{ width: '100%', borderRadius: 8 }}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="lifespanYears"
                    label={
                      <span>
                        <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Expected Lifespan (years)
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter lifespan' },
                      {
                        type: 'number',
                        min: 1,
                        max: 50,
                        message: 'Lifespan must be between 1 and 50 years',
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={1}
                      max={50}
                      step={1}
                      placeholder="5"
                      style={{ width: '100%', borderRadius: 8 }}
                      addonAfter="years"
                    />
                  </Form.Item>
                </Col>
              </Row>

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
                    {isEdit ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/admin/assets/categories')}
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
                  <AppstoreOutlined style={{ marginRight: 8 }} />
                  Category Guidelines
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
                    • Categories help organize assets by type
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Depreciation rate affects asset value over time
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Lifespan determines when assets need replacement
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Common rates: Computers (20%), Furniture (10%)
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Use clear, descriptive category names
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

export default AssetCategoryFormPage;
