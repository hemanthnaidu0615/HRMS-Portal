import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const HolidaysFormPage: React.FC = () => {
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
        `${API_BASE_URL}/leave/holidays/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch holidays');
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
          `${API_BASE_URL}/leave/holidays/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Holidays updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/leave/holidays`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Holidays created successfully');
      }
      navigate(`/admin/leave/holidays`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} holidays`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Holidays` : `Create Holidays`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="holidayName"
            label="Holidayname"
            rules={[{ required: true, message: 'Please enter holidayname' }]}
          >
            <Input placeholder="Enter holidayname" />
          </Form.Item>
<Form.Item
            name="holidayDate"
            label="Holidaydate"
            rules={[{ required: true, message: 'Please enter holidaydate' }]}
          >
            <Input placeholder="Enter holidaydate" />
          </Form.Item>
<Form.Item
            name="holidayType"
            label="Holidaytype"
            rules={[{ required: true, message: 'Please enter holidaytype' }]}
          >
            <Input placeholder="Enter holidaytype" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/leave/holidays`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HolidaysFormPage;
