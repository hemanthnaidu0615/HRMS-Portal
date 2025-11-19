import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Select,
  Row,
  Col,
  Space,
  Skeleton,
  DatePicker,
  TimePicker,
  Alert,
  Divider,
} from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InterviewsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    loadData();
    if (isEdit) {
      fetchData();
    } else if (location.state) {
      // Pre-fill from application if coming from applications page
      const { applicationId, candidateName } = location.state;
      if (applicationId) {
        form.setFieldValue('applicationId', applicationId);
      }
    }
  }, [id]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [applicationsResponse, employeesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/recruitment/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setApplications(applicationsResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/interviews/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue({
        ...data,
        interviewDate: data.interviewDate ? dayjs(data.interviewDate) : undefined,
        interviewTime: data.interviewTime ? dayjs(data.interviewTime, 'HH:mm') : undefined,
      });
      if (data.interviewers) setInterviewers(data.interviewers);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch interview');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...values,
        interviewDate: values.interviewDate ? values.interviewDate.format('YYYY-MM-DD') : undefined,
        interviewTime: values.interviewTime ? values.interviewTime.format('HH:mm') : undefined,
        interviewers,
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/recruitment/interviews/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Interview updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/recruitment/interviews`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Interview scheduled successfully');
      }
      navigate('/admin/recruitment/interviews');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'schedule'} interview`);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#13c2c2' }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {isEdit ? 'Edit Interview' : 'Schedule Interview'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                {isEdit ? 'Update interview details' : 'Schedule a new interview with candidate'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/recruitment/interviews')}
              style={{ borderRadius: 8 }}
              size="large"
            >
              Back to Interviews
            </Button>
          </div>

          <Alert
            message="Interview Scheduling"
            description="Select the candidate, set the interview date and time, and assign interviewers."
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{
              status: 'Scheduled',
              interviewType: 'Video',
            }}
          >
            {/* Candidate & Job Details */}
            <Divider orientation="left">
              <Space>
                <TeamOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Candidate Information</span>
              </Space>
            </Divider>

            <Form.Item
              name="applicationId"
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Select Candidate Application</span>}
              rules={[{ required: true, message: 'Please select a candidate application' }]}
            >
              <Select
                placeholder="Search and select candidate"
                size="large"
                style={{ borderRadius: 8 }}
                showSearch
                optionFilterProp="children"
              >
                {applications.map(app => (
                  <Option key={app.id} value={app.id}>
                    {app.candidateName} - {app.jobPosting} ({app.status})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Interview Schedule */}
            <Divider orientation="left">
              <Space>
                <ClockCircleOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Schedule Details</span>
              </Space>
            </Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="interviewDate"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Interview Date</span>}
                  rules={[{ required: true, message: 'Please select interview date' }]}
                >
                  <DatePicker
                    placeholder="Select date"
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="interviewTime"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Interview Time</span>}
                  rules={[{ required: true, message: 'Please select interview time' }]}
                >
                  <TimePicker
                    placeholder="Select time"
                    size="large"
                    format="HH:mm"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="interviewType"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Interview Type</span>}
                  rules={[{ required: true, message: 'Please select interview type' }]}
                >
                  <Select placeholder="Select interview type" size="large" style={{ borderRadius: 8 }}>
                    <Option value="Video">
                      <Space>
                        <VideoCameraOutlined />
                        <span>Video Interview</span>
                      </Space>
                    </Option>
                    <Option value="Phone">
                      <Space>
                        <PhoneOutlined />
                        <span>Phone Interview</span>
                      </Space>
                    </Option>
                    <Option value="In-person">
                      <Space>
                        <EnvironmentOutlined />
                        <span>In-person Interview</span>
                      </Space>
                    </Option>
                    <Option value="Technical">Technical Interview</Option>
                    <Option value="HR">HR Interview</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Status</span>}
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status" size="large" style={{ borderRadius: 8 }}>
                    <Option value="Scheduled">Scheduled</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="Cancelled">Cancelled</Option>
                    <Option value="Rescheduled">Rescheduled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="meetingLink"
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Meeting Link (for virtual interviews)</span>}
              extra="Provide Zoom, Google Meet, or Teams link for virtual interviews"
            >
              <Input
                placeholder="https://zoom.us/j/..."
                size="large"
                style={{ borderRadius: 8 }}
                prefix={<VideoCameraOutlined style={{ color: '#8c8c8c' }} />}
              />
            </Form.Item>

            {/* Interviewers */}
            <Divider orientation="left">
              <Space>
                <TeamOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Interview Panel</span>
              </Space>
            </Divider>

            <Form.Item
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Assign Interviewers</span>}
              extra="Select one or more employees to conduct the interview"
            >
              <Select
                mode="multiple"
                placeholder="Search and select interviewers"
                size="large"
                style={{ borderRadius: 8 }}
                showSearch
                optionFilterProp="children"
                value={interviewers}
                onChange={setInterviewers}
              >
                {employees.map(emp => (
                  <Option key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName && emp.lastName
                      ? `${emp.firstName} ${emp.lastName} - ${emp.departmentName || 'No Department'}`
                      : emp.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Interview Notes / Instructions</span>}
            >
              <TextArea
                placeholder="Add any notes, instructions, or topics to cover during the interview..."
                rows={6}
                style={{ borderRadius: 8, fontSize: 14, lineHeight: '1.6' }}
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button
                onClick={() => navigate('/admin/recruitment/interviews')}
                size="large"
                style={{ borderRadius: 8, minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
                size="large"
                style={{
                  background: '#13c2c2',
                  borderColor: '#13c2c2',
                  borderRadius: 8,
                  minWidth: 140,
                  fontWeight: 600,
                }}
              >
                {isEdit ? 'Update Interview' : 'Schedule Interview'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default InterviewsFormPage;
