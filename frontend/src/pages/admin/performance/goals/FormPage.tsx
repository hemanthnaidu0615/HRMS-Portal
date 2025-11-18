import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const GoalsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/performance/goals/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch goals');
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
          `${API_BASE_URL}/performance/goals/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Goals updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/performance/goals`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Goals created successfully');
      }
      navigate(`/admin/performance/goals`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} goals`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Goals` : `Create Goals`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="goalTitle"
            label="Goaltitle"
            rules={[{ required: true, message: 'Please enter goaltitle' }]}
          >
            <Input placeholder="Enter goaltitle" />
          </Form.Item>
<Form.Item
            name="employee"
            label="Employee"
            rules={[{ required: true, message: 'Please enter employee' }]}
          >
            <Input placeholder="Enter employee" />
          </Form.Item>
<Form.Item
            name="weightage"
            label="Weightage"
            rules={[{ required: true, message: 'Please enter weightage' }]}
          >
            <Input placeholder="Enter weightage" />
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
              <Button onClick={() => navigate(`/admin/performance/goals`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GoalsFormPage;
