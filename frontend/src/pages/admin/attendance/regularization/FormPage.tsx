import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Skeleton,
  Alert,
  message,
  DatePicker,
  TimePicker,
  Upload,
  Card,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: string;
  requestType: string;
  reason: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  documents?: string[];
}

const RegularizationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditMode = !!id;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load employees
      const employeesResponse = await http.get('/api/employees');
      setEmployees(employeesResponse.data);

      // If edit mode, load request
      if (isEditMode) {
        const requestResponse = await http.get(`/api/attendance/regularization/${id}`);
        const requestData = requestResponse.data;

        // Populate form
        form.setFieldsValue({
          employeeId: requestData.employeeId,
          date: requestData.date ? dayjs(requestData.date) : undefined,
          requestType: requestData.requestType,
          requestedCheckIn: requestData.requestedCheckIn
            ? dayjs(requestData.requestedCheckIn)
            : undefined,
          requestedCheckOut: requestData.requestedCheckOut
            ? dayjs(requestData.requestedCheckOut)
            : undefined,
          reason: requestData.reason,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load data';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaveLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('employeeId', values.employeeId);
      formData.append('date', values.date ? dayjs(values.date).format('YYYY-MM-DD') : '');
      formData.append('requestType', values.requestType);
      formData.append('reason', values.reason);

      if (values.requestedCheckIn) {
        formData.append('requestedCheckIn', dayjs(values.requestedCheckIn).toISOString());
      }
      if (values.requestedCheckOut) {
        formData.append('requestedCheckOut', dayjs(values.requestedCheckOut).toISOString());
      }

      // Append files
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('documents', file.originFileObj);
        }
      });

      if (isEditMode) {
        await http.put(`/api/attendance/regularization/${id}`, formData);
        message.success('Regularization request updated successfully');
      } else {
        await http.post('/api/attendance/regularization', formData);
        message.success('Regularization request created successfully');
      }

      navigate('/admin/attendance/regularization');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} regularization request`;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSaveLoading(false);
    }
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: any) => setFileList(newFileList),
    beforeUpload: () => false, // Prevent auto upload
    multiple: true,
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <PremiumCard
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
          border: '1px solid #e8f4ff',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {isEditMode ? 'Edit Regularization Request' : 'Create Regularization Request'}
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                {isEditMode
                  ? 'Update regularization request information'
                  : 'Submit a new attendance regularization request'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/attendance/regularization')}
              style={{ borderRadius: 6 }}
            >
              Back to Requests
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              padding: '32px',
              borderRadius: 12,
              border: '1px solid #bae7ff',
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Employee Selection */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    Employee
                  </span>
                }
                name="employeeId"
                rules={[{ required: true, message: 'Please select an employee' }]}
              >
                <Select
                  placeholder="Select employee"
                  size="large"
                  style={{ borderRadius: 6 }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  disabled={isEditMode}
                >
                  {employees.map((emp) => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.firstName && emp.lastName
                        ? `${emp.firstName} ${emp.lastName} (${emp.email})`
                        : emp.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Date and Request Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Attendance Date
                    </span>
                  }
                  name="date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select date"
                    format="MMMM DD, YYYY"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <FileTextOutlined style={{ marginRight: 4 }} />
                      Request Type
                    </span>
                  }
                  name="requestType"
                  rules={[{ required: true, message: 'Please select request type' }]}
                >
                  <Select placeholder="Select request type" size="large" style={{ borderRadius: 6 }}>
                    <Select.Option value="Missing Check-in">Missing Check-in</Select.Option>
                    <Select.Option value="Missing Check-out">Missing Check-out</Select.Option>
                    <Select.Option value="Late Arrival">Late Arrival</Select.Option>
                    <Select.Option value="Early Departure">Early Departure</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Requested Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                      Requested Check-in Time
                    </span>
                  }
                  name="requestedCheckIn"
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select check-in time"
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                      Requested Check-out Time
                    </span>
                  }
                  name="requestedCheckOut"
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select check-out time"
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>
              </div>

              {/* Reason */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <FileTextOutlined style={{ marginRight: 4 }} />
                    Reason for Regularization
                  </span>
                }
                name="reason"
                rules={[
                  { required: true, message: 'Please provide a reason' },
                  { min: 20, message: 'Reason must be at least 20 characters' },
                ]}
              >
                <TextArea
                  placeholder="Provide a detailed explanation for this regularization request..."
                  rows={4}
                  style={{ borderRadius: 6 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {/* File Upload */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <UploadOutlined style={{ marginRight: 4 }} />
                    Supporting Documents (Optional)
                  </span>
                }
                extra="Upload any supporting documents (screenshots, emails, etc.)"
              >
                <Dragger
                  {...uploadProps}
                  style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
                    borderRadius: 8,
                    border: '2px dashed #1890ff',
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: '#1890ff', fontWeight: 600 }}>
                    Click or drag files to this area to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#666' }}>
                    Support for single or bulk upload. Maximum file size: 5MB
                  </p>
                </Dragger>
              </Form.Item>

              {/* Info Alert */}
              <Alert
                message="Request Review Process"
                description="Your regularization request will be sent to your manager for approval. You will be notified once the request is reviewed. Please ensure all information provided is accurate."
                type="info"
                showIcon
                style={{ borderRadius: 6 }}
              />
            </Space>

            {/* Action Buttons */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '1px solid #d9d9d9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button
                onClick={() => navigate('/admin/attendance/regularization')}
                size="large"
                style={{ borderRadius: 6 }}
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
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  borderColor: '#1890ff',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                }}
              >
                {isEditMode ? 'Update Request' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </Space>
      </PremiumCard>
    </div>
  );
};

export default RegularizationFormPage;
