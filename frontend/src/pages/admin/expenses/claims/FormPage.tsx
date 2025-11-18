import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const ClaimsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/expenses/claims/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense claims');
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
          `${API_BASE_URL}/expenses/claims/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Expense Claims updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/expenses/claims`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Expense Claims created successfully');
      }
      navigate(`/admin/expenses/claims`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} expense claims`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Expense Claims` : `Create Expense Claims`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="claimNumber"
            label="Claimnumber"
            rules={[{ required: true, message: 'Please enter claimnumber' }]}
          >
            <Input placeholder="Enter claimnumber" />
          </Form.Item>
<Form.Item
            name="employee"
            label="Employee"
            rules={[{ required: true, message: 'Please enter employee' }]}
          >
            <Input placeholder="Enter employee" />
          </Form.Item>
<Form.Item
            name="totalAmount"
            label="Totalamount"
            rules={[{ required: true, message: 'Please enter totalamount' }]}
          >
            <Input placeholder="Enter totalamount" />
          </Form.Item>
<Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please enter status' }]}
          >
            <Input placeholder="Enter status" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/expenses/claims`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ClaimsFormPage;
