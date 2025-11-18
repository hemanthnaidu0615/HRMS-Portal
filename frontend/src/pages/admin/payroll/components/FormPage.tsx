import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const ComponentsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/payroll/components/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch salary components');
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
          `${API_BASE_URL}/payroll/components/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Salary Components updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/components`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Salary Components created successfully');
      }
      navigate(`/admin/payroll/components`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} salary components`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Salary Components` : `Create Salary Components`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="componentName"
            label="Componentname"
            rules={[{ required: true, message: 'Please enter componentname' }]}
          >
            <Input placeholder="Enter componentname" />
          </Form.Item>
<Form.Item
            name="componentType"
            label="Componenttype"
            rules={[{ required: true, message: 'Please enter componenttype' }]}
          >
            <Input placeholder="Enter componenttype" />
          </Form.Item>
<Form.Item
            name="calculationType"
            label="Calculationtype"
            rules={[{ required: true, message: 'Please enter calculationtype' }]}
          >
            <Input placeholder="Enter calculationtype" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/payroll/components`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ComponentsFormPage;
