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
  Card,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  location: string;
  notes?: string;
  status: string;
}

const RecordFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);

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

      // If edit mode, load record
      if (isEditMode) {
        const recordResponse = await http.get(`/api/attendance/records/${id}`);
        const recordData = recordResponse.data;
        setRecord(recordData);

        // Populate form
        form.setFieldsValue({
          employeeId: recordData.employeeId,
          date: recordData.date ? dayjs(recordData.date) : undefined,
          checkInTime: recordData.checkInTime ? dayjs(recordData.checkInTime) : undefined,
          checkOutTime: recordData.checkOutTime ? dayjs(recordData.checkOutTime) : undefined,
          location: recordData.location,
          notes: recordData.notes,
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

      const payload = {
        employeeId: values.employeeId,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
        checkInTime: values.checkInTime ? dayjs(values.checkInTime).toISOString() : undefined,
        checkOutTime: values.checkOutTime ? dayjs(values.checkOutTime).toISOString() : undefined,
        location: values.location,
        notes: values.notes,
      };

      if (isEditMode) {
        await http.put(`/api/attendance/records/${id}`, payload);
        message.success('Attendance record updated successfully');
      } else {
        await http.post('/api/attendance/records', payload);
        message.success('Attendance record created successfully');
      }

      navigate('/admin/attendance/records');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} attendance record`;
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSaveLoading(false);
    }
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
                {isEditMode ? 'Edit Attendance Record' : 'Create Attendance Record'}
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                {isEditMode
                  ? 'Update attendance record information'
                  : 'Add a new attendance record to the system'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/attendance/records')}
              style={{ borderRadius: 6 }}
            >
              Back to Records
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

              {/* Date */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Date
                  </span>
                }
                name="date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: 6 }}
                  size="large"
                  placeholder="Select date"
                  format="MMMM DD, YYYY"
                />
              </Form.Item>

              {/* Time Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                      Check In Time
                    </span>
                  }
                  name="checkInTime"
                  rules={[{ required: true, message: 'Please select check in time' }]}
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select check in time"
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                      Check Out Time
                    </span>
                  }
                  name="checkOutTime"
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select check out time"
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>
              </div>

              {/* Location */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    Location
                  </span>
                }
                name="location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input
                  placeholder="Enter work location (e.g., Office, Remote, Client Site)"
                  size="large"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              {/* Notes */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Notes
                  </span>
                }
                name="notes"
              >
                <TextArea
                  placeholder="Additional notes or comments about this attendance record..."
                  rows={4}
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              {/* Info Alert */}
              <Alert
                message="Attendance Calculation"
                description="Work hours will be automatically calculated based on check-in and check-out times. The system will also determine the attendance status based on your organization's policies."
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
                onClick={() => navigate('/admin/attendance/records')}
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
                {isEditMode ? 'Update Record' : 'Create Record'}
              </Button>
            </div>
          </Form>
        </Space>
      </PremiumCard>
    </div>
  );
};

export default RecordFormPage;
