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
        `${API_BASE_URL}/recruitment/applications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch applications');
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
          `${API_BASE_URL}/recruitment/applications/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Applications updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/recruitment/applications`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Applications created successfully');
      }
      navigate(`/admin/recruitment/applications`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} applications`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Applications` : `Create Applications`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="candidate"
            label="Candidate"
            rules={[{ required: true, message: 'Please enter candidate' }]}
          >
            <Input placeholder="Enter candidate" />
          </Form.Item>
<Form.Item
            name="jobTitle"
            label="Jobtitle"
            rules={[{ required: true, message: 'Please enter jobtitle' }]}
          >
            <Input placeholder="Enter jobtitle" />
          </Form.Item>
<Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please enter status' }]}
          >
            <Input placeholder="Enter status" />
          </Form.Item>
<Form.Item
            name="appliedDate"
            label="Applieddate"
            rules={[{ required: true, message: 'Please enter applieddate' }]}
          >
            <Input placeholder="Enter applieddate" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => navigate(`/admin/recruitment/applications`)}>
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
