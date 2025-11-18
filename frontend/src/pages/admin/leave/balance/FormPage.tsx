import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const BalanceFormPage: React.FC = () => {
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
        `${API_BASE_URL}/leave/balance/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave balance');
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
          `${API_BASE_URL}/leave/balance/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Leave Balance updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/leave/balance`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Leave Balance created successfully');
      }
      navigate(`/admin/leave/balance`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} leave balance`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Leave Balance` : `Create Leave Balance`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="leaveType"
            label="Leavetype"
            rules={[{ required: true, message: 'Please enter leavetype' }]}
          >
            <Input placeholder="Enter leavetype" />
          </Form.Item>
<Form.Item
            name="totalAvailable"
            label="Totalavailable"
            rules={[{ required: true, message: 'Please enter totalavailable' }]}
          >
            <Input placeholder="Enter totalavailable" />
          </Form.Item>
<Form.Item
            name="consumed"
            label="Consumed"
            rules={[{ required: true, message: 'Please enter consumed' }]}
          >
            <Input placeholder="Enter consumed" />
          </Form.Item>
<Form.Item
            name="remaining"
            label="Remaining"
            rules={[{ required: true, message: 'Please enter remaining' }]}
          >
            <Input placeholder="Enter remaining" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/leave/balance`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BalanceFormPage;
