import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const { Option } = Select;

const InterviewsFormPage: React.FC = () => {
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
        `${API_BASE_URL}/recruitment/interviews/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch interviews');
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
          `${API_BASE_URL}/recruitment/interviews/${id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Interviews updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/recruitment/interviews`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Interviews created successfully');
      }
      navigate(`/admin/recruitment/interviews`);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} interviews`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title={isEdit ? `Edit Interviews` : `Create Interviews`}>
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
            name="interviewRound"
            label="Interviewround"
            rules={[{ required: true, message: 'Please enter interviewround' }]}
          >
            <Input placeholder="Enter interviewround" />
          </Form.Item>
<Form.Item
            name="interviewDate"
            label="Interviewdate"
            rules={[{ required: true, message: 'Please enter interviewdate' }]}
          >
            <Input placeholder="Enter interviewdate" />
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
              <Button onClick={() => navigate(`/admin/recruitment/interviews`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InterviewsFormPage;
