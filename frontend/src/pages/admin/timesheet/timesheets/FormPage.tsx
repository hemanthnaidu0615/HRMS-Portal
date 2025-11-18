import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const TimesheetsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/timesheet/timesheets/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch timesheets');
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
          `${API_BASE_URL}/timesheet/timesheets/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Timesheets updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/timesheet/timesheets`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Timesheets created successfully');
      }
      navigate(`/admin/timesheet/timesheets`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} timesheets`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Timesheets` : `Create Timesheets`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="project"
            label="Project"
            rules={[{ required: true, message: 'Please enter project' }]}
          >
            <Input placeholder="Enter project" />
          </Form.Item>
<Form.Item
            name="task"
            label="Task"
            rules={[{ required: true, message: 'Please enter task' }]}
          >
            <Input placeholder="Enter task" />
          </Form.Item>
<Form.Item
            name="hoursWorked"
            label="Hoursworked"
            rules={[{ required: true, message: 'Please enter hoursworked' }]}
          >
            <Input placeholder="Enter hoursworked" />
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
              <Button onClick={() => navigate(`/admin/timesheet/timesheets`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TimesheetsFormPage;
