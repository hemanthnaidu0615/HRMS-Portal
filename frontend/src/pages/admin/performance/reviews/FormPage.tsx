import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Card,
  Spin,
  Rate,
  Alert,
} from 'antd';
import {
  TrophyOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  StarOutlined,
  FileTextOutlined,
  BulbOutlined,
  RocketOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
}

interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const ReviewsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [rating, setRating] = useState<number>(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    fetchCycles();
    if (isEdit) {
      fetchReviewData();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error: any) {
      message.error('Failed to fetch employees');
    }
  };

  const fetchCycles = async () => {
    try {
      const response = await http.get('/api/performance/cycles');
      setCycles(response.data);
    } catch (error: any) {
      message.error('Failed to fetch review cycles');
    }
  };

  const fetchReviewData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/performance/reviews/${id}`);
      const data = response.data;
      form.setFieldsValue({
        employeeId: data.employee.id,
        reviewerId: data.reviewer.id,
        cycleId: data.cycle.id,
        rating: data.rating,
        strengths: data.strengths,
        improvements: data.improvements,
        goals: data.goals,
        status: data.status,
      });
      setRating(data.rating);
    } catch (error: any) {
      message.error('Failed to fetch review');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!values.rating || values.rating === 0) {
      message.error('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await http.put(`/api/performance/reviews/${id}`, values);
        message.success('Review updated successfully');
      } else {
        await http.post('/api/performance/reviews', values);
        message.success('Review created successfully');
      }
      navigate('/admin/performance/reviews');
    } catch (error: any) {
      message.error(
        error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} review`
      );
    } finally {
      setLoading(false);
    }
  };

  const getRatingDescription = (value: number) => {
    const descriptions = [
      'Not Rated',
      'Needs Improvement',
      'Meets Expectations',
      'Good Performance',
      'Excellent Performance',
      'Outstanding Performance',
    ];
    return descriptions[value] || descriptions[0];
  };

  const getRatingColor = (value: number) => {
    if (value >= 4.5) return '#52c41a';
    if (value >= 3.5) return '#1890ff';
    if (value >= 2.5) return '#faad14';
    if (value > 0) return '#f5222d';
    return '#d9d9d9';
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#eb2f96' }}>
            <TrophyOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Performance Review' : 'Create Performance Review'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update the performance review details' : 'Add a new performance review'}
          </Text>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Form Section */}
        <Col xs={24} lg={16}>
          <PremiumCard
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
            }}
            bodyStyle={{ padding: 32 }}
          >
            {loading && !isEdit ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                {/* Basic Information Section */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Basic Information
                  </Title>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="employeeId"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Employee
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select an employee' }]}
                      >
                        <Select
                          placeholder="Select employee"
                          showSearch
                          optionFilterProp="children"
                          style={{ borderRadius: 8 }}
                        >
                          {employees.map((emp) => (
                            <Option key={emp.id} value={emp.id}>
                              <Space direction="vertical" size={0}>
                                <Text strong>{emp.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {emp.position || emp.email}
                                </Text>
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="reviewerId"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Reviewer
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select a reviewer' }]}
                      >
                        <Select
                          placeholder="Select reviewer"
                          showSearch
                          optionFilterProp="children"
                          style={{ borderRadius: 8 }}
                        >
                          {employees.map((emp) => (
                            <Option key={emp.id} value={emp.id}>
                              {emp.name} - {emp.email}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="cycleId"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Review Cycle
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select a review cycle' }]}
                      >
                        <Select
                          placeholder="Select review cycle"
                          style={{ borderRadius: 8 }}
                        >
                          {cycles.map((cycle) => (
                            <Option key={cycle.id} value={cycle.id}>
                              {cycle.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="status"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            Status
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select status' }]}
                        initialValue="DRAFT"
                      >
                        <Select style={{ borderRadius: 8 }}>
                          <Option value="DRAFT">Draft</Option>
                          <Option value="SUBMITTED">Submitted</Option>
                          <Option value="APPROVED">Approved</Option>
                          <Option value="COMPLETED">Completed</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Rating Section */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <StarOutlined style={{ marginRight: 8 }} />
                    Overall Performance Rating
                  </Title>

                  <Form.Item
                    name="rating"
                    rules={[{ required: true, message: 'Please provide a rating' }]}
                  >
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <Rate
                        allowHalf
                        value={rating}
                        onChange={(value) => {
                          setRating(value);
                          form.setFieldsValue({ rating: value });
                        }}
                        style={{ fontSize: 48, color: getRatingColor(rating) }}
                      />
                      <div style={{ marginTop: 16 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 24,
                            color: getRatingColor(rating),
                          }}
                        >
                          {rating.toFixed(1)} / 5.0
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 16 }}>
                            {getRatingDescription(Math.round(rating))}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Form.Item>
                </div>

                <Divider />

                {/* Feedback Section */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Performance Feedback
                  </Title>

                  <Form.Item
                    name="strengths"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <BulbOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        Key Strengths
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please describe key strengths' },
                      { min: 20, message: 'Please provide at least 20 characters' },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe the employee's key strengths and achievements..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="improvements"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />
                        Areas for Improvement
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please describe areas for improvement' },
                      { min: 20, message: 'Please provide at least 20 characters' },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Identify areas where the employee can improve..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="goals"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        <RocketOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Goals for Next Cycle
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please set goals for next cycle' },
                      { min: 20, message: 'Please provide at least 20 characters' },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Set goals and objectives for the next review cycle..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </div>

                <Divider />

                {/* Action Buttons */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{
                        background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                        border: 'none',
                        borderRadius: 8,
                        minWidth: 140,
                        height: 44,
                      }}
                    >
                      {isEdit ? 'Update Review' : 'Create Review'}
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => navigate('/admin/performance/reviews')}
                      style={{ borderRadius: 8, minWidth: 100, height: 44 }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </PremiumCard>
        </Col>

        {/* Guidelines Section */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Rating Guide */}
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Title level={5} style={{ color: '#fff', margin: 0 }}>
                  <StarOutlined style={{ marginRight: 8 }} />
                  Rating Guide
                </Title>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#fff' }}>⭐ 1 Star:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Needs Improvement
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#fff' }}>⭐⭐ 2 Stars:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Meets Expectations
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#fff' }}>⭐⭐⭐ 3 Stars:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Good Performance
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#fff' }}>⭐⭐⭐⭐ 4 Stars:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Excellent Performance
                    </Text>
                  </div>
                  <div>
                    <Text style={{ color: '#fff' }}>⭐⭐⭐⭐⭐ 5 Stars:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                      Outstanding Performance
                    </Text>
                  </div>
                </div>
              </Space>
            </PremiumCard>

            {/* Tips Card */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                  Review Writing Tips
                </Title>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Be specific with examples
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Focus on behaviors, not personality
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Balance positive and constructive feedback
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Set SMART goals for next cycle
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Be honest but respectful
                    </Text>
                  </li>
                </ul>
              </Space>
            </PremiumCard>

            {/* Info Alert */}
            <Alert
              message="Important"
              description="Performance reviews are confidential and will be shared only with the employee and authorized managers."
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ReviewsFormPage;
