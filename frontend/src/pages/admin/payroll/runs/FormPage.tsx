import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const RunsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/payroll/runs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch payroll runs');
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
          `${API_BASE_URL}/payroll/runs/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payroll Runs updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/payroll/runs`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Payroll Runs created successfully');
      }
      navigate(`/admin/payroll/runs`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} payroll runs`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Payroll Runs` : `Create Payroll Runs`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="payrollMonth"
            label="Payrollmonth"
            rules={[{ required: true, message: 'Please enter payrollmonth' }]}
          >
            <Input placeholder="Enter payrollmonth" />
          </Form.Item>
<Form.Item
            name="payrollYear"
            label="Payrollyear"
            rules={[{ required: true, message: 'Please enter payrollyear' }]}
          >
            <Input placeholder="Enter payrollyear" />
          </Form.Item>
<Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please enter status' }]}
          >
            <Input placeholder="Enter status" />
          </Form.Item>
<Form.Item
            name="totalEmployees"
            label="Totalemployees"
            rules={[{ required: true, message: 'Please enter totalemployees' }]}
          >
            <Input placeholder="Enter totalemployees" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/payroll/runs`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RunsFormPage;
