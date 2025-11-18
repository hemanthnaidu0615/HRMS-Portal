import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const PayslipsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/payroll/payslips/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payslips');
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
          `${API_BASE_URL}/payroll/payslips/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payslips updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/payslips`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payslips created successfully');
      }
      navigate(`/admin/payroll/payslips`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} payslips`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Payslips` : `Create Payslips`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="employee"
            label="Employee"
            rules={[{ required: true, message: 'Please enter employee' }]}
          >
            <Input placeholder="Enter employee" />
          </Form.Item>
<Form.Item
            name="month"
            label="Month"
            rules={[{ required: true, message: 'Please enter month' }]}
          >
            <Input placeholder="Enter month" />
          </Form.Item>
<Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <Input placeholder="Enter year" />
          </Form.Item>
<Form.Item
            name="netSalary"
            label="Netsalary"
            rules={[{ required: true, message: 'Please enter netsalary' }]}
          >
            <Input placeholder="Enter netsalary" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/payroll/payslips`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PayslipsFormPage;
