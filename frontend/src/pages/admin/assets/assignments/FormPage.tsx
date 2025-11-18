import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const AssignmentsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/assets/assignments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch assignments');
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
          `${API_BASE_URL}/assets/assignments/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Assignments updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/assets/assignments`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Assignments created successfully');
      }
      navigate(`/admin/assets/assignments`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} assignments`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Assignments` : `Create Assignments`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="asset"
            label="Asset"
            rules={[{ required: true, message: 'Please enter asset' }]}
          >
            <Input placeholder="Enter asset" />
          </Form.Item>
<Form.Item
            name="employee"
            label="Employee"
            rules={[{ required: true, message: 'Please enter employee' }]}
          >
            <Input placeholder="Enter employee" />
          </Form.Item>
<Form.Item
            name="assignedDate"
            label="Assigneddate"
            rules={[{ required: true, message: 'Please enter assigneddate' }]}
          >
            <Input placeholder="Enter assigneddate" />
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
              <Button onClick={() => navigate(`/admin/assets/assignments`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AssignmentsFormPage;
