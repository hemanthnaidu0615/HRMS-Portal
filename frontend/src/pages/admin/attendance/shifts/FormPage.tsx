import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const ShiftsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/attendance/shifts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch shifts');
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
          `${API_BASE_URL}/attendance/shifts/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Shifts updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/attendance/shifts`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Shifts created successfully');
      }
      navigate(`/admin/attendance/shifts`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} shifts`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Shifts` : `Create Shifts`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="shiftName"
            label="Shiftname"
            rules={[{ required: true, message: 'Please enter shiftname' }]}
          >
            <Input placeholder="Enter shiftname" />
          </Form.Item>
<Form.Item
            name="startTime"
            label="Starttime"
            rules={[{ required: true, message: 'Please enter starttime' }]}
          >
            <Input placeholder="Enter starttime" />
          </Form.Item>
<Form.Item
            name="endTime"
            label="Endtime"
            rules={[{ required: true, message: 'Please enter endtime' }]}
          >
            <Input placeholder="Enter endtime" />
          </Form.Item>
<Form.Item
            name="totalHours"
            label="Totalhours"
            rules={[{ required: true, message: 'Please enter totalhours' }]}
          >
            <Input placeholder="Enter totalhours" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/attendance/shifts`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ShiftsFormPage;
