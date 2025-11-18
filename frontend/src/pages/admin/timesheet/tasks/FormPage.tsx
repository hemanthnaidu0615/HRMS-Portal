import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const TasksFormPage: React.FC = () => {
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
        `${API_BASE_URL}/timesheet/tasks/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch project tasks');
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
          `${API_BASE_URL}/timesheet/tasks/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Project Tasks updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/timesheet/tasks`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Project Tasks created successfully');
      }
      navigate(`/admin/timesheet/tasks`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project tasks`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Project Tasks` : `Create Project Tasks`}>
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
            name="taskName"
            label="Taskname"
            rules={[{ required: true, message: 'Please enter taskname' }]}
          >
            <Input placeholder="Enter taskname" />
          </Form.Item>
<Form.Item
            name="isBillable"
            label="Isbillable"
            rules={[{ required: true, message: 'Please enter isbillable' }]}
          >
            <Input placeholder="Enter isbillable" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/timesheet/tasks`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TasksFormPage;
