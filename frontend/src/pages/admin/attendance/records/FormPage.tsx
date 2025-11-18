import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const RecordsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/attendance/records/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch attendance records');
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
          `${API_BASE_URL}/attendance/records/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Attendance Records updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/attendance/records`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Attendance Records created successfully');
      }
      navigate(`/admin/attendance/records`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} attendance records`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Attendance Records` : `Create Attendance Records`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please enter date' }]}
          >
            <Input placeholder="Enter date" />
          </Form.Item>
<Form.Item
            name="checkInTime"
            label="Checkintime"
            rules={[{ required: true, message: 'Please enter checkintime' }]}
          >
            <Input placeholder="Enter checkintime" />
          </Form.Item>
<Form.Item
            name="checkOutTime"
            label="Checkouttime"
            rules={[{ required: true, message: 'Please enter checkouttime' }]}
          >
            <Input placeholder="Enter checkouttime" />
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
              <Button onClick={() => navigate(`/admin/attendance/records`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RecordsFormPage;
