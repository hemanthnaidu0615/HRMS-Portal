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
  DatePicker,
  Alert,
  Spin,
} from 'antd';
import {
  TrophyOutlined,
  SaveOutlined,
  CloseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CyclesFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchCycleData();
    }
  }, [id]);

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/performance/cycles/${id}`);
      const data = response.data;
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        status: data.status,
        selfReviewDeadline: dayjs(data.selfReviewDeadline),
        managerReviewDeadline: dayjs(data.managerReviewDeadline),
      });
      setDateRange([dayjs(data.startDate), dayjs(data.endDate)]);
    } catch (error: any) {
      message.error('Failed to fetch review cycle');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!dateRange[0] || !dateRange[1]) {
      message.error('Please select cycle period');
      return;
    }

    // Validate deadlines
    if (values.selfReviewDeadline.isAfter(values.managerReviewDeadline)) {
      message.error('Self review deadline must be before manager review deadline');
      return;
    }

    if (values.selfReviewDeadline.isBefore(dateRange[0])) {
      message.error('Self review deadline must be after cycle start date');
      return;
    }

    if (values.managerReviewDeadline.isAfter(dateRange[1])) {
      message.error('Manager review deadline must be before cycle end date');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        selfReviewDeadline: values.selfReviewDeadline.format('YYYY-MM-DD'),
        managerReviewDeadline: values.managerReviewDeadline.format('YYYY-MM-DD'),
      };

      if (isEdit) {
        await http.put(`/api/performance/cycles/${id}`, payload);
        message.success('Review cycle updated successfully');
      } else {
        await http.post('/api/performance/cycles', payload);
        message.success('Review cycle created successfully');
      }
      navigate('/admin/performance/cycles');
    } catch (error: any) {
      message.error(
        error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} review cycle`
      );
    } finally {
      setLoading(false);
    }
  };

  const getDuration = () => {
    if (dateRange[0] && dateRange[1]) {
      return dateRange[1].diff(dateRange[0], 'day');
    }
    return 0;
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#eb2f96' }}>
            <TrophyOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Review Cycle' : 'Create Review Cycle'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update the review cycle details' : 'Set up a new performance review cycle'}
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
                {/* Basic Information */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Cycle Information
                  </Title>

                  <Form.Item
                    name="name"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Cycle Name
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Please enter cycle name' },
                      { min: 3, message: 'Name must be at least 3 characters' },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Q1 2024 Performance Review"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Description
                      </span>
                    }
                  >
                    <TextArea
                      rows={3}
                      placeholder="Describe the purpose and scope of this review cycle..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

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
                      <Option value="ACTIVE">Active</Option>
                      <Option value="COMPLETED">Completed</Option>
                      <Option value="CANCELLED">Cancelled</Option>
                    </Select>
                  </Form.Item>
                </div>

                <Divider />

                {/* Period Settings */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Cycle Period
                  </Title>

                  <Form.Item
                    label={
                      <span style={{ fontSize: 15, fontWeight: 500 }}>
                        Cycle Duration
                      </span>
                    }
                    required
                  >
                    <RangePicker
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                      style={{ width: '100%', borderRadius: 8 }}
                      format="MMM DD, YYYY"
                    />
                  </Form.Item>

                  {dateRange[0] && dateRange[1] && (
                    <Alert
                      message={
                        <Space>
                          <ClockCircleOutlined />
                          <Text strong>
                            Duration: {getDuration()} days ({dayjs(dateRange[0]).format('MMM DD')} - {dayjs(dateRange[1]).format('MMM DD, YYYY')})
                          </Text>
                        </Space>
                      }
                      type="info"
                      style={{ marginBottom: 24, borderRadius: 8 }}
                    />
                  )}
                </div>

                <Divider />

                {/* Deadlines */}
                <div>
                  <Title level={5} style={{ color: '#eb2f96', marginBottom: 16 }}>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    Review Deadlines
                  </Title>

                  <Alert
                    message="Important"
                    description="Self review deadline must be before manager review deadline. Both deadlines should fall within the cycle period."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  />

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="selfReviewDeadline"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            <ClockCircleOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                            Self Review Deadline
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select self review deadline' }]}
                      >
                        <DatePicker
                          style={{ width: '100%', borderRadius: 8 }}
                          format="MMM DD, YYYY"
                          disabledDate={(current) => {
                            if (!dateRange[0] || !dateRange[1]) return false;
                            return current && (current.isBefore(dateRange[0], 'day') || current.isAfter(dateRange[1], 'day'));
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="managerReviewDeadline"
                        label={
                          <span style={{ fontSize: 15, fontWeight: 500 }}>
                            <ClockCircleOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                            Manager Review Deadline
                          </span>
                        }
                        rules={[{ required: true, message: 'Please select manager review deadline' }]}
                      >
                        <DatePicker
                          style={{ width: '100%', borderRadius: 8 }}
                          format="MMM DD, YYYY"
                          disabledDate={(current) => {
                            if (!dateRange[0] || !dateRange[1]) return false;
                            return current && (current.isBefore(dateRange[0], 'day') || current.isAfter(dateRange[1], 'day'));
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
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
                      {isEdit ? 'Update Cycle' : 'Create Cycle'}
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => navigate('/admin/performance/cycles')}
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
            {/* Cycle Planning Guide */}
            <PremiumCard
              style={{
                background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
                border: 'none',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Title level={5} style={{ color: '#fff', margin: 0 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Cycle Planning Tips
                </Title>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>
                      Typical Cycle Length
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      Quarterly: 90 days
                    </Text>
                    <br />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      Semi-annual: 180 days
                    </Text>
                    <br />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      Annual: 365 days
                    </Text>
                  </div>
                  <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <Text strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>
                      Deadline Guidelines
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      Allow 1-2 weeks between self and manager review deadlines
                    </Text>
                  </div>
                </div>
              </Space>
            </PremiumCard>

            {/* Best Practices */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                  Best Practices
                </Title>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Communicate cycle dates to all employees in advance
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Set realistic deadlines with buffer time
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Send reminder notifications before deadlines
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Ensure managers have time to review thoroughly
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Plan follow-up meetings after cycle completion
                    </Text>
                  </li>
                </ul>
              </Space>
            </PremiumCard>

            {/* Status Guide */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <TrophyOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                  Status Guide
                </Title>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Draft:</Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Cycle is being planned, not visible to employees
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Active:</Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Cycle is live, employees can submit reviews
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Completed:</Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Cycle finished, reviews finalized
                    </Text>
                  </div>
                  <div>
                    <Text strong>Cancelled:</Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Cycle was discontinued
                    </Text>
                  </div>
                </div>
              </Space>
            </PremiumCard>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CyclesFormPage;
