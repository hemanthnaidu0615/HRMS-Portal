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
  Upload,
  Alert,
  Rate,
  Divider,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

const { Option } = Select;
const { TextArea } = Input;

const ApplicationsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [resumeFileList, setResumeFileList] = useState<any[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    loadJobs();
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  const loadJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(response.data.filter((job: any) => job.status === 'Open'));
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recruitment/applications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      form.setFieldsValue(data);

      if (data.resumeUrl) {
        setResumeFileList([{
          uid: '-1',
          name: 'resume.pdf',
          status: 'done',
          url: data.resumeUrl,
        }]);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch application');
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
        resumeUrl: resumeFileList.length > 0 ? resumeFileList[0].url || resumeFileList[0].response?.url : undefined,
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/recruitment/applications/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Application updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/recruitment/applications`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Application created successfully');
      }
      navigate('/admin/recruitment/applications');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} application`);
    } finally {
      setSaveLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: `${API_BASE_URL}/upload`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    fileList: resumeFileList,
    onChange(info) {
      let newFileList = [...info.fileList];

      // Limit to one file
      newFileList = newFileList.slice(-1);

      setResumeFileList(newFileList);

      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed`);
      }
    },
    beforeUpload(file) {
      const isPDF = file.type === 'application/pdf';
      const isDoc = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (!isPDF && !isDoc) {
        message.error('You can only upload PDF or DOC files!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return false;
      }

      return true;
    },
    onRemove() {
      setResumeFileList([]);
    },
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
                <FileTextOutlined style={{ marginRight: 8 }} />
                {isEdit ? 'Edit Application' : 'New Application'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                {isEdit ? 'Update application information' : 'Add a new candidate application'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/recruitment/applications')}
              style={{ borderRadius: 8 }}
              size="large"
            >
              Back to Applications
            </Button>
          </div>

          <Alert
            message="Application Information"
            description="Fill in the candidate's information and upload their resume to create a new application."
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
              status: 'New',
              source: 'Website',
              rating: 0,
            }}
          >
            {/* Candidate Information */}
            <Divider orientation="left">
              <Space>
                <UserOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Candidate Information</span>
              </Space>
            </Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="candidateName"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Full Name</span>}
                  rules={[{ required: true, message: 'Please enter candidate name' }]}
                >
                  <Input
                    placeholder="e.g. John Doe"
                    size="large"
                    style={{ borderRadius: 8 }}
                    prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Email Address</span>}
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    placeholder="john.doe@example.com"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Phone Number</span>}
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input
                    placeholder="+1 (555) 123-4567"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="experience"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Years of Experience</span>}
                >
                  <Select placeholder="Select experience" size="large" style={{ borderRadius: 8 }}>
                    <Option value="0-1 years">0-1 years</Option>
                    <Option value="1-3 years">1-3 years</Option>
                    <Option value="3-5 years">3-5 years</Option>
                    <Option value="5-7 years">5-7 years</Option>
                    <Option value="7-10 years">7-10 years</Option>
                    <Option value="10+ years">10+ years</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="currentCompany"
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Current Company</span>}
            >
              <Input
                placeholder="e.g. ABC Corporation"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {/* Application Details */}
            <Divider orientation="left">
              <Space>
                <FileTextOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Application Details</span>
              </Space>
            </Divider>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="jobPostingId"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Job Position</span>}
                  rules={[{ required: true, message: 'Please select a job position' }]}
                >
                  <Select
                    placeholder="Select job position"
                    size="large"
                    style={{ borderRadius: 8 }}
                    showSearch
                    optionFilterProp="children"
                  >
                    {jobs.map(job => (
                      <Option key={job.id} value={job.id}>
                        {job.title} - {job.department}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="source"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Application Source</span>}
                  rules={[{ required: true, message: 'Please select source' }]}
                >
                  <Select placeholder="Select source" size="large" style={{ borderRadius: 8 }}>
                    <Option value="Website">Website</Option>
                    <Option value="LinkedIn">LinkedIn</Option>
                    <Option value="Referral">Referral</Option>
                    <Option value="Job Board">Job Board</Option>
                    <Option value="Direct">Direct Application</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Status</span>}
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status" size="large" style={{ borderRadius: 8 }}>
                    <Option value="New">New</Option>
                    <Option value="Reviewing">Reviewing</Option>
                    <Option value="Shortlisted">Shortlisted</Option>
                    <Option value="Interview Scheduled">Interview Scheduled</Option>
                    <Option value="Interviewed">Interviewed</Option>
                    <Option value="Offered">Offered</Option>
                    <Option value="Hired">Hired</Option>
                    <Option value="Rejected">Rejected</Option>
                    <Option value="Withdrawn">Withdrawn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="rating"
                  label={<span style={{ fontWeight: 500, fontSize: 14 }}>Candidate Rating</span>}
                >
                  <Rate style={{ fontSize: 24 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="coverLetter"
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Cover Letter / Additional Notes</span>}
            >
              <TextArea
                placeholder="Enter cover letter or additional notes about the candidate..."
                rows={6}
                style={{ borderRadius: 8, fontSize: 14, lineHeight: '1.6' }}
                showCount
                maxLength={2000}
              />
            </Form.Item>

            {/* Resume Upload */}
            <Divider orientation="left">
              <Space>
                <UploadOutlined style={{ color: '#13c2c2' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Resume / CV</span>
              </Space>
            </Divider>

            <Form.Item
              label={<span style={{ fontWeight: 500, fontSize: 14 }}>Upload Resume</span>}
              extra="Accepted formats: PDF, DOC, DOCX (Max size: 5MB)"
            >
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  style={{
                    borderRadius: 8,
                    borderColor: '#13c2c2',
                    color: '#13c2c2',
                    width: 200,
                  }}
                >
                  {resumeFileList.length > 0 ? 'Change Resume' : 'Upload Resume'}
                </Button>
              </Upload>
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
                onClick={() => navigate('/admin/recruitment/applications')}
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
                {isEdit ? 'Update Application' : 'Create Application'}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ApplicationsFormPage;
