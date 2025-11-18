import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  DatePicker,
  InputNumber,
  Select,
  Upload,
  Row,
  Col,
  Space,
  Card,
  Divider,
  Typography,
  Table,
} from 'antd';
import {
  WalletOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';
import { withinLastDaysRule, positiveNumberRule, minCharactersRule } from '../../../../utils/validationRules';
import { validateFile } from '../../../../utils/validators';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface ExpenseItem {
  key: string;
  description: string;
  amount: number;
  category: string;
}

const ClaimsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    fetchCategories();
    if (isEdit) {
      fetchClaim();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await http.get('/api/expenses/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/expenses/claims/${id}`);
      const data = response.data;
      form.setFieldsValue({
        ...data,
        claimDate: data.claimDate ? dayjs(data.claimDate) : null,
      });
      if (data.items) {
        setExpenseItems(data.items.map((item: any, index: number) => ({ ...item, key: index.toString() })));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense claim');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleAddItem = () => {
    const newItem: ExpenseItem = {
      key: Date.now().toString(),
      description: '',
      amount: 0,
      category: '',
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const handleDeleteItem = (key: string) => {
    setExpenseItems(expenseItems.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(
      expenseItems.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const onFinish = async (values: any) => {
    if (expenseItems.length === 0) {
      message.error('Please add at least one expense item');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...values,
        claimDate: values.claimDate ? values.claimDate.format('YYYY-MM-DD') : null,
        totalAmount: calculateTotal(),
        items: expenseItems,
        receiptUrl: fileList.length > 0 ? fileList[0].url : null,
      };

      if (isEdit) {
        await http.put(`/api/expenses/claims/${id}`, formData);
        message.success('Expense claim updated successfully');
      } else {
        await http.post('/api/expenses/claims', formData);
        message.success('Expense claim created successfully');
      }
      navigate('/admin/expenses/claims');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} expense claim`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: ExpenseItem) => (
        <Input
          value={text}
          onChange={(e) => handleItemChange(record.key, 'description', e.target.value)}
          placeholder="Enter description"
        />
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (text: string, record: ExpenseItem) => (
        <Select
          value={text}
          onChange={(value) => handleItemChange(record.key, 'category', value)}
          placeholder="Select category"
          style={{ width: '100%' }}
        >
          {categories.map((cat: any) => (
            <Option key={cat.id} value={cat.name}>
              {cat.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (text: number, record: ExpenseItem) => (
        <InputNumber
          value={text}
          onChange={(value) => handleItemChange(record.key, 'amount', value || 0)}
          placeholder="0.00"
          prefix="$"
          style={{ width: '100%' }}
          min={0.01}
          precision={2}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, record: ExpenseItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#f5222d' }}>
            <WalletOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Expense Claim' : 'Create Expense Claim'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update expense claim details' : 'Submit a new expense claim for reimbursement'}
          </Text>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          {/* Main Information */}
          <Col xs={24} lg={16}>
            <PremiumCard
              title={
                <Space>
                  <WalletOutlined style={{ color: '#f5222d' }} />
                  <span>Claim Information</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="employee"
                    label={<span>Employee <span style={{ color: '#ff4d4f' }}>*</span></span>}
                    rules={[{ required: true, message: 'Please select employee' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select employee"
                      showSearch
                      optionFilterProp="children"
                    >
                      {employees.map((emp: any) => (
                        <Option key={emp.id} value={emp.id}>
                          {emp.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="claimDate"
                    label={<span>Claim Date <span style={{ color: '#ff4d4f' }}>*</span></span>}
                    rules={[
                      { required: true, message: 'Please select claim date' },
                      withinLastDaysRule(90),
                    ]}
                    extra="Expenses must be claimed within 90 days"
                  >
                    <DatePicker
                      size="large"
                      style={{ width: '100%' }}
                      disabledDate={(current) => {
                        const today = dayjs();
                        const minDate = today.subtract(90, 'day');
                        return current && (current < minDate || current > today);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="category"
                    label={<span>Primary Category <span style={{ color: '#ff4d4f' }}>*</span></span>}
                    rules={[{ required: true, message: 'Please select category' }]}
                  >
                    <Select size="large" placeholder="Select category">
                      {categories.map((cat: any) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select size="large" placeholder="Select status">
                      <Option value="DRAFT">Draft</Option>
                      <Option value="SUBMITTED">Submitted</Option>
                      <Option value="APPROVED">Approved</Option>
                      <Option value="REJECTED">Rejected</Option>
                      <Option value="PAID">Paid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label={<span>Description <span style={{ color: '#ff4d4f' }}>*</span></span>}
                    rules={[
                      { required: true, message: 'Please enter description' },
                      minCharactersRule(10),
                    ]}
                    extra="Minimum 10 characters. Provide clear details about the expense"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Provide detailed description of your expense claim"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </PremiumCard>

            {/* Expense Items */}
            <PremiumCard
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#f5222d' }} />
                  <span>Expense Items</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  style={{
                    background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                    border: 'none',
                  }}
                >
                  Add Item
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={expenseItems}
                pagination={false}
                locale={{ emptyText: 'No expense items added yet' }}
              />
              <Divider />
              <Row justify="end">
                <Col>
                  <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                    <Text type="secondary">Total Amount</Text>
                    <Title level={3} style={{ margin: 0, color: '#f5222d' }}>
                      ${calculateTotal().toFixed(2)}
                    </Title>
                  </Space>
                </Col>
              </Row>
            </PremiumCard>
          </Col>

          {/* Receipt Upload */}
          <Col xs={24} lg={8}>
            <PremiumCard
              title={
                <Space>
                  <UploadOutlined style={{ color: '#f5222d' }} />
                  <span>Receipt</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="receipt"
                label="Upload Receipt"
                extra="Supported formats: JPG, PNG, PDF (Max: 5MB). Required for claims over $100"
                rules={[
                  {
                    validator: (_, value) => {
                      const total = calculateTotal();
                      if (total > 100 && fileList.length === 0) {
                        return Promise.reject(new Error('Receipt is required for amounts over $100'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={(file) => {
                    const validation = validateFile(file, {
                      maxSize: 5,
                      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                    });
                    if (!validation.isValid) {
                      message.error(validation.error);
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  maxCount={1}
                >
                  {fileList.length === 0 && (
                    <div>
                      <UploadOutlined style={{ fontSize: 32, color: '#f5222d' }} />
                      <div style={{ marginTop: 8 }}>Upload Receipt</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <div
                style={{
                  background: '#fff7e6',
                  border: '1px solid #ffd591',
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 16,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Note:</strong> Please ensure the receipt is clear and legible. Include all
                  relevant details such as date, vendor, items, and total amount.
                </Text>
              </div>
            </PremiumCard>

            {/* Summary Card */}
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                    Total Claim Amount
                  </Text>
                  <Title level={1} style={{ color: '#fff', margin: '8px 0' }}>
                    ${calculateTotal().toFixed(2)}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    {expenseItems.length} item(s)
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
                  onClick={() => navigate('/admin/expenses/claims')}
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
                  {isEdit ? 'Update' : 'Create'} Claim
                </Button>
              </Space>
            </Col>
          </Row>
        </PremiumCard>
      </Form>
    </div>
  );
};

export default ClaimsFormPage;
