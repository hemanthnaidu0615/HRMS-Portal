import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const CategoriesFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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
        `${API_BASE_URL}/expenses/categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense categories');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/expenses/categories/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Expense Categories updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/expenses/categories`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Expense Categories created successfully');
      }
      navigate(`/admin/expenses/categories`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} expense categories`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Expense Categories` : `Create Expense Categories`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="categoryName"
            label="Categoryname"
            rules={[{ required: true, message: 'Please enter categoryname' }]}
          >
            <Input placeholder="Enter categoryname" />
          </Form.Item>
<Form.Item
            name="dailyLimit"
            label="Dailylimit"
            rules={[{ required: true, message: 'Please enter dailylimit' }]}
          >
            <Input placeholder="Enter dailylimit" />
          </Form.Item>
<Form.Item
            name="monthlyLimit"
            label="Monthlylimit"
            rules={[{ required: true, message: 'Please enter monthlylimit' }]}
          >
            <Input placeholder="Enter monthlylimit" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/expenses/categories`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CategoriesFormPage;
