import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  DatePicker,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Alert,
  Card,
  Spin,
  Tag,
  Statistic,
} from 'antd';
import {
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { noPastDateRule, minCharactersRule, endDateAfterStartDateRule } from '../../../../utils/validationRules';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface LeaveType {
  id: string;
  name: string;
  code: string;
  maxDays: number;
}

interface LeaveBalance {
  totalLeaves: number;
  usedLeaves: number;
  availableLeaves: number;
}

const ApplicationsFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchEmployees();
    fetchLeaveTypes();
    if (isEdit) {
      fetchApplicationData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedEmployee && selectedLeaveType) {
      fetchLeaveBalance();
    }
  }, [selectedEmployee, selectedLeaveType]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const days = dateRange[1].diff(dateRange[0], 'day') + 1;
      setCalculatedDays(days);
      form.setFieldsValue({ days });
    }
  }, [dateRange, form]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/api/employees');
      setEmployees(response.data);
    } catch (error: any) {
      message.error('Failed to fetch employees');
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await http.get('/api/leave/types');
      setLeaveTypes(response.data);
    } catch (error: any) {
      message.error('Failed to fetch leave types');
    }
  };

  const fetchLeaveBalance = async () => {
    if (!selectedEmployee || !selectedLeaveType) return;

    setBalanceLoading(true);
    try {
      const response = await http.get(
        `/api/leave/balances?employeeId=${selectedEmployee}&leaveTypeId=${selectedLeaveType}`
      );
      setLeaveBalance(response.data);
    } catch (error: any) {
      console.error('Failed to fetch leave balance');
      setLeaveBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchApplicationData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/api/leave/applications/${id}`);
      const data = response.data;
      form.setFieldsValue({
        employeeId: data.employee.id,
        leaveTypeId: data.leaveType.id,
        reason: data.reason,
        days: data.days,
      });
      setSelectedEmployee(data.employee.id);
      setSelectedLeaveType(data.leaveType.id);
      setDateRange([dayjs(data.startDate), dayjs(data.endDate)]);
      setCalculatedDays(data.days);
    } catch (error: any) {
      message.error('Failed to fetch leave application');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!dateRange[0] || !dateRange[1]) {
      message.error('Please select date range');
      return;
    }

    if (leaveBalance && calculatedDays > leaveBalance.availableLeaves) {
      message.error('Insufficient leave balance');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        days: calculatedDays,
      };

      if (isEdit) {
        await http.put(`/api/leave/applications/${id}`, payload);
        message.success('Leave application updated successfully');
      } else {
        await http.post('/api/leave/applications', payload);
        message.success('Leave application submitted successfully');
      }
      navigate('/admin/leave/applications');
    } catch (error: any) {
      message.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'submit'} leave application`);
    } finally {
      setLoading(false);
    }
  };

  const hasInsufficientBalance = leaveBalance && calculatedDays > leaveBalance.availableLeaves;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
            <CalendarOutlined style={{ marginRight: 12 }} />
            {isEdit ? 'Edit Leave Application' : 'Apply for Leave'}
          </Title>
          <Text type="secondary">
            {isEdit ? 'Update your leave application details' : 'Submit a new leave request'}
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
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                {/* Employee Selection */}
                <Form.Item
                  name="employeeId"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 500 }}>
                      <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Employee <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select an employee' }]}
                >
                  <Select
                    placeholder="Select employee"
                    showSearch
                    optionFilterProp="children"
                    onChange={(value) => setSelectedEmployee(value)}
                    style={{ borderRadius: 8 }}
                  >
                    {employees.map((emp) => (
                      <Option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Leave Type Selection */}
                <Form.Item
                  name="leaveTypeId"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 500 }}>
                      <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Leave Type <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select leave type' }]}
                  extra="Select the type of leave you want to apply for"
                >
                  <Select
                    placeholder="Select leave type"
                    onChange={(value) => setSelectedLeaveType(value)}
                    style={{ borderRadius: 8 }}
                  >
                    {leaveTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        <Space>
                          <span>{type.name}</span>
                          <Tag color="blue">{type.code}</Tag>
                          <Text type="secondary">Max: {type.maxDays} days</Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Date Range */}
                <Form.Item
                  label={
                    <span style={{ fontSize: 15, fontWeight: 500 }}>
                      <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Date Range <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  }
                  required
                  rules={[
                    { required: true, message: 'Please select date range' },
                  ]}
                  extra="Leave dates cannot be in the past. Please select future dates."
                >
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                    style={{ width: '100%', borderRadius: 8 }}
                    format="MMM DD, YYYY"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>

                {/* Calculated Days */}
                {calculatedDays > 0 && (
                  <Alert
                    message={
                      <Space>
                        <ClockCircleOutlined />
                        <Text strong>Duration: {calculatedDays} day{calculatedDays > 1 ? 's' : ''}</Text>
                      </Space>
                    }
                    type="info"
                    style={{ marginBottom: 24, borderRadius: 8 }}
                  />
                )}

                {/* Reason */}
                <Form.Item
                  name="reason"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 500 }}>
                      <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      Reason <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Please provide a reason' },
                    minCharactersRule(10),
                  ]}
                  extra={
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Minimum 10 characters required. Be specific and clear about your leave reason.
                      </Text>
                    </div>
                  }
                >
                  <TextArea
                    rows={4}
                    placeholder="Please provide a detailed reason for your leave..."
                    style={{ borderRadius: 8 }}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                {/* Balance Warning */}
                {hasInsufficientBalance && (
                  <Alert
                    message="Insufficient Leave Balance"
                    description={`You only have ${leaveBalance?.availableLeaves} day(s) available, but you're requesting ${calculatedDays} day(s).`}
                    type="error"
                    icon={<WarningOutlined />}
                    showIcon
                    style={{ marginBottom: 24, borderRadius: 8 }}
                  />
                )}

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
                      disabled={hasInsufficientBalance}
                      style={{
                        background: hasInsufficientBalance
                          ? undefined
                          : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        border: 'none',
                        borderRadius: 8,
                        minWidth: 140,
                        height: 44,
                      }}
                    >
                      {isEdit ? 'Update' : 'Submit'}
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => navigate('/admin/leave/applications')}
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

        {/* Balance Section */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Leave Balance Card */}
            {selectedEmployee && selectedLeaveType && (
              <PremiumCard
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Spin spinning={balanceLoading}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                        Leave Balance
                      </Text>
                      <Title level={3} style={{ color: '#fff', margin: '8px 0 0 0' }}>
                        {leaveBalance ? (
                          <>
                            <CheckCircleOutlined style={{ marginRight: 8 }} />
                            {leaveBalance.availableLeaves} Days
                          </>
                        ) : (
                          'Loading...'
                        )}
                      </Title>
                    </div>

                    {leaveBalance && (
                      <>
                        <Divider style={{ margin: 0, borderColor: 'rgba(255,255,255,0.2)' }} />
                        <Row gutter={16}>
                          <Col span={12}>
                            <Statistic
                              title={
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                  Total
                                </span>
                              }
                              value={leaveBalance.totalLeaves}
                              valueStyle={{ color: '#fff', fontSize: 20 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title={
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                  Used
                                </span>
                              }
                              value={leaveBalance.usedLeaves}
                              valueStyle={{ color: '#fff', fontSize: 20 }}
                            />
                          </Col>
                        </Row>
                      </>
                    )}
                  </Space>
                </Spin>
              </PremiumCard>
            )}

            {/* Help Card */}
            <PremiumCard>
              <Space direction="vertical" size={12}>
                <Title level={5} style={{ margin: 0 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  Tips for Leave Application
                </Title>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Check your leave balance before applying
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Provide a clear and detailed reason
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Apply at least 3 days in advance when possible
                    </Text>
                  </li>
                  <li>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Contact your manager for urgent leave requests
                    </Text>
                  </li>
                </ul>
              </Space>
            </PremiumCard>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicationsFormPage;
