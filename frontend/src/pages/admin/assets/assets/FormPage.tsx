import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Upload,
  Typography,
  Card,
  Space,
  Divider,
} from 'antd';
import {
  LaptopOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  PictureOutlined,
  TagOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Category {
  id: string;
  name: string;
}

const AssetFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchAsset();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await http.get('/api/assets/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error('Failed to fetch categories');
    }
  };

  const fetchAsset = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/assets/assets/${id}`);
      const asset = response.data;
      form.setFieldsValue({
        ...asset,
        purchaseDate: dayjs(asset.purchaseDate),
        category: asset.category.id,
      });
      if (asset.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: asset.imageUrl,
          },
        ]);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch asset');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === 'purchaseDate') {
          formData.append(key, values[key].format('YYYY-MM-DD'));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      if (isEdit) {
        await http.put(`/api/assets/assets/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Asset updated successfully');
      } else {
        await http.post('/api/assets/assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Asset created successfully');
      }
      navigate('/admin/assets/assets');
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} asset`
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
          <LaptopOutlined style={{ marginRight: 12 }} />
          {isEdit ? 'Edit Asset' : 'Add New Asset'}
        </Title>
        <Text type="secondary">
          {isEdit ? 'Update asset details' : 'Create a new asset entry'}
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
                status: 'AVAILABLE',
                location: 'Office',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="assetTag"
                    label={
                      <span>
                        <TagOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Asset Tag
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter asset tag' }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., ASSET-001"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label={
                      <span>
                        <LaptopOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Asset Name
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter asset name' }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., MacBook Pro 16-inch"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label={
                      <span>
                        <AppstoreOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Category
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select category"
                      style={{ borderRadius: 8 }}
                    >
                      {categories.map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="serialNumber"
                    label={
                      <span>
                        <TagOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Serial Number
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter serial number' }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., ABC123456789"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="purchaseDate"
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Purchase Date
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select purchase date' }]}
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
                    name="cost"
                    label={
                      <span>
                        <DollarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Cost (USD)
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter cost' },
                      { type: 'number', min: 0, message: 'Cost must be positive' },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      style={{ width: '100%', borderRadius: 8 }}
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="status"
                    label={
                      <span>
                        <AppstoreOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Status
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select size="large" style={{ borderRadius: 8 }}>
                      <Option value="AVAILABLE">Available</Option>
                      <Option value="ASSIGNED">Assigned</Option>
                      <Option value="MAINTENANCE">Maintenance</Option>
                      <Option value="RETIRED">Retired</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="location"
                    label={
                      <span>
                        <EnvironmentOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        Location
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter location' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select or enter location"
                      style={{ borderRadius: 8 }}
                      showSearch
                      mode="tags"
                      maxTagCount={1}
                    >
                      <Option value="Office">Office</Option>
                      <Option value="Warehouse">Warehouse</Option>
                      <Option value="Remote">Remote</Option>
                      <Option value="Storage">Storage</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item
                name="description"
                label={
                  <span>
                    <FileTextOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Description
                  </span>
                }
              >
                <TextArea
                  rows={4}
                  placeholder="Additional details about the asset..."
                  style={{ borderRadius: 8 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <PictureOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Asset Image
                  </span>
                }
              >
                <Upload {...uploadProps} listType="picture-card">
                  {fileList.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload Image</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Upload a photo of the asset (Max 5MB, JPG/PNG)
                </Text>
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
                    {isEdit ? 'Update Asset' : 'Create Asset'}
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => navigate('/admin/assets/assets')}
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

        {/* Sidebar Info */}
        <Col xs={24} lg={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
              border: 'none',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  <LaptopOutlined style={{ marginRight: 8 }} />
                  Asset Information
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
                    • Asset Tag should be unique
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Serial Number is required for tracking
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Keep purchase receipts for warranty
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Upload clear photos for identification
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13 }}>
                    • Update status regularly
                  </Text>
                </Space>
              </Card>
            </Space>
          </PremiumCard>

          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <AppstoreOutlined style={{ fontSize: 32, color: '#fff' }} />
              <Title level={4} style={{ color: '#fff', margin: '8px 0' }}>
                Asset Categories
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                Categories help organize assets by type. If you don't see the category you need,
                create a new one in the Categories section.
              </Text>
              <Button
                type="primary"
                ghost
                onClick={() => navigate('/admin/assets/categories')}
                style={{
                  marginTop: 8,
                  borderColor: '#fff',
                  color: '#fff',
                  borderRadius: 6,
                }}
              >
                Manage Categories
              </Button>
            </Space>
          </PremiumCard>
        </Col>
      </Row>
    </div>
  );
};

export default AssetFormPage;
