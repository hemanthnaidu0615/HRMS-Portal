import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const ApplicationsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/leave/applications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave applications');
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
          `${API_BASE_URL}/leave/applications/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Leave Applications updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/leave/applications`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Leave Applications created successfully');
      }
      navigate(`/admin/leave/applications`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} leave applications`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Leave Applications` : `Create Leave Applications`}>
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
            name="startDate"
            label="Startdate"
            rules={[{ required: true, message: 'Please enter startdate' }]}
          >
            <Input placeholder="Enter startdate" />
          </Form.Item>
<Form.Item
            name="endDate"
            label="Enddate"
            rules={[{ required: true, message: 'Please enter enddate' }]}
          >
            <Input placeholder="Enter enddate" />
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
              <Button onClick={() => navigate(`/admin/leave/applications`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ApplicationsFormPage;
