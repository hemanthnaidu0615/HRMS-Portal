import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const CyclesFormPage: React.FC = () => {
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
        `${API_BASE_URL}/performance/cycles/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch performance cycles');
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
          `${API_BASE_URL}/performance/cycles/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Performance Cycles updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/performance/cycles`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Performance Cycles created successfully');
      }
      navigate(`/admin/performance/cycles`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} performance cycles`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Performance Cycles` : `Create Performance Cycles`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="cycleName"
            label="Cyclename"
            rules={[{ required: true, message: 'Please enter cyclename' }]}
          >
            <Input placeholder="Enter cyclename" />
          </Form.Item>
<Form.Item
            name="cycleType"
            label="Cycletype"
            rules={[{ required: true, message: 'Please enter cycletype' }]}
          >
            <Input placeholder="Enter cycletype" />
          </Form.Item>
<Form.Item
            name="startDate"
            label="Startdate"
            rules={[{ required: true, message: 'Please enter startdate' }]}
          >
            <Input placeholder="Enter startdate" />
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
              <Button onClick={() => navigate(`/admin/performance/cycles`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CyclesFormPage;
