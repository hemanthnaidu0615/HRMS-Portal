import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Skeleton,
  Alert,
  message,
  TimePicker,
  InputNumber,
  Switch,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title } = Typography;
const { TextArea } = Input;

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  graceTime: number;
  isActive: boolean;
  description?: string;
}

const ShiftFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedDuration, setCalculatedDuration] = useState<string>('—');
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [breakDuration, setBreakDuration] = useState<number>(0);

  const isEditMode = !!id;

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    calculateDuration();
  }, [startTime, endTime, breakDuration]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // If edit mode, load shift
      if (isEditMode) {
        const response = await http.get(`/api/attendance/shifts/${id}`);
        const shiftData = response.data;

        // Populate form
        form.setFieldsValue({
          name: shiftData.name,
          startTime: shiftData.startTime ? dayjs(shiftData.startTime, 'HH:mm:ss') : undefined,
          endTime: shiftData.endTime ? dayjs(shiftData.endTime, 'HH:mm:ss') : undefined,
          breakDuration: shiftData.breakDuration,
          graceTime: shiftData.graceTime,
          isActive: shiftData.isActive,
          description: shiftData.description,
        });

        // Set state for duration calculation
        if (shiftData.startTime) {
          setStartTime(dayjs(shiftData.startTime, 'HH:mm:ss'));
        }
        if (shiftData.endTime) {
          setEndTime(dayjs(shiftData.endTime, 'HH:mm:ss'));
        }
        if (shiftData.breakDuration) {
          setBreakDuration(shiftData.breakDuration);
        }
      } else {
        // Set defaults for new shift
        form.setFieldsValue({
          breakDuration: 60,
          graceTime: 15,
          isActive: true,
        });
        setBreakDuration(60);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load data';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) {
      setCalculatedDuration('—');
      return;
    }

    let diff = endTime.diff(startTime, 'minute');
    if (diff < 0) diff += 24 * 60; // Handle overnight shifts

    diff -= breakDuration; // Subtract break time

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    setCalculatedDuration(`${hours}h ${minutes}m`);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaveLoading(true);
      setError('');

      const payload = {
        name: values.name,
        startTime: values.startTime ? dayjs(values.startTime).format('HH:mm:ss') : undefined,
        endTime: values.endTime ? dayjs(values.endTime).format('HH:mm:ss') : undefined,
        breakDuration: values.breakDuration,
        graceTime: values.graceTime,
        isActive: values.isActive,
        description: values.description,
      };

      if (isEditMode) {
        await http.put(`/api/attendance/shifts/${id}`, payload);
        message.success('Shift updated successfully');
      } else {
        await http.post('/api/attendance/shifts', payload);
        message.success('Shift created successfully');
      }

      navigate('/admin/attendance/shifts');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to ${isEditMode ? 'update' : 'create'} shift`;
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
                {isEditMode ? 'Edit Shift' : 'Create Shift'}
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                {isEditMode ? 'Update shift information' : 'Define a new work shift'}
              </p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/attendance/shifts')}
              style={{ borderRadius: 6 }}
            >
              Back to Shifts
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
              {/* Shift Name */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Shift Name
                  </span>
                }
                name="name"
                rules={[{ required: true, message: 'Please enter shift name' }]}
              >
                <Input
                  placeholder="e.g., Morning Shift, Night Shift, General Shift"
                  size="large"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>

              {/* Time Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                      Start Time
                    </span>
                  }
                  name="startTime"
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select start time"
                    format="hh:mm A"
                    use12Hours
                    onChange={(time) => setStartTime(time)}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                      End Time
                    </span>
                  }
                  name="endTime"
                  rules={[{ required: true, message: 'Please select end time' }]}
                >
                  <TimePicker
                    style={{ width: '100%', borderRadius: 6 }}
                    size="large"
                    placeholder="Select end time"
                    format="hh:mm A"
                    use12Hours
                    onChange={(time) => setEndTime(time)}
                  />
                </Form.Item>
              </div>

              {/* Duration Calculator */}
              <Alert
                message="Calculated Working Hours"
                description={
                  <div style={{ marginTop: 8 }}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Statistic
                          title="Total Working Hours (excluding breaks)"
                          value={calculatedDuration}
                          valueStyle={{
                            color: '#1890ff',
                            fontSize: 24,
                            fontWeight: 700,
                          }}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
                style={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                  border: '2px solid #1890ff',
                }}
              />

              {/* Break and Grace Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      Break Duration (minutes)
                    </span>
                  }
                  name="breakDuration"
                  rules={[{ required: true, message: 'Please enter break duration' }]}
                >
                  <InputNumber
                    min={0}
                    max={480}
                    placeholder="Minutes"
                    size="large"
                    style={{ width: '100%', borderRadius: 6 }}
                    onChange={(value) => setBreakDuration(value || 0)}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      Grace Time (minutes)
                    </span>
                  }
                  name="graceTime"
                  rules={[{ required: true, message: 'Please enter grace time' }]}
                  extra="Late arrival tolerance period"
                >
                  <InputNumber
                    min={0}
                    max={60}
                    placeholder="Minutes"
                    size="large"
                    style={{ width: '100%', borderRadius: 6 }}
                  />
                </Form.Item>
              </div>

              {/* Description */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Description (Optional)
                  </span>
                }
                name="description"
              >
                <TextArea
                  placeholder="Additional details about this shift..."
                  rows={3}
                  style={{ borderRadius: 6 }}
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              {/* Active Status */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Active Status
                  </span>
                }
                name="isActive"
                valuePropName="checked"
                extra="Only active shifts can be assigned to employees"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  style={{
                    background: form.getFieldValue('isActive')
                      ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                      : undefined,
                  }}
                />
              </Form.Item>

              {/* Info Alert */}
              <Alert
                message="Shift Configuration Tips"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Break duration is deducted from total working hours</li>
                    <li>Grace time allows employees to check-in late without penalty</li>
                    <li>For overnight shifts, ensure end time is after midnight</li>
                    <li>Deactivate shifts that are no longer in use instead of deleting</li>
                  </ul>
                }
                type="warning"
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
                onClick={() => navigate('/admin/attendance/shifts')}
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
                {isEditMode ? 'Update Shift' : 'Create Shift'}
              </Button>
            </div>
          </Form>
        </Space>
      </PremiumCard>
    </div>
  );
};

export default ShiftFormPage;
