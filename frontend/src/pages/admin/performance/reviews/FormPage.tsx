import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const ReviewsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/performance/reviews/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch reviews');
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
          `${API_BASE_URL}/performance/reviews/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Reviews updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/performance/reviews`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Reviews created successfully');
      }
      navigate(`/admin/performance/reviews`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} reviews`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Reviews` : `Create Reviews`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="employee"
            label="Employee"
            rules={[{ required: true, message: 'Please enter employee' }]}
          >
            <Input placeholder="Enter employee" />
          </Form.Item>
<Form.Item
            name="reviewType"
            label="Reviewtype"
            rules={[{ required: true, message: 'Please enter reviewtype' }]}
          >
            <Input placeholder="Enter reviewtype" />
          </Form.Item>
<Form.Item
            name="selfRating"
            label="Selfrating"
            rules={[{ required: true, message: 'Please enter selfrating' }]}
          >
            <Input placeholder="Enter selfrating" />
          </Form.Item>
<Form.Item
            name="managerRating"
            label="Managerrating"
            rules={[{ required: true, message: 'Please enter managerrating' }]}
          >
            <Input placeholder="Enter managerrating" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/performance/reviews`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReviewsFormPage;
