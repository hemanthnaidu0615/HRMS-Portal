import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Progress,
  Select,
  Input,
  Space,
  Typography,
  message,
  Spin,
  Avatar,
  Tag,
  Statistic,
  Alert,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Option } = Select;
const { Title, Text } = Typography;

interface LeaveBalance {
  id: string;
  employee: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    department?: string;
  };
  leaveType: {
    id: string;
    name: string;
    code: string;
    color?: string;
  };
  totalLeaves: number;
  usedLeaves: number;
  availableLeaves: number;
  pendingLeaves?: number;
}

const LeaveBalancesListPage: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [filteredBalances, setFilteredBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaveTypes();
    fetchBalances();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [balances, searchText, leaveTypeFilter]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await http.get('/api/leave/types');
      setLeaveTypes(response.data);
    } catch (error: any) {
      console.error('Failed to fetch leave types');
    }
  };

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/leave/balances');
      setBalances(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave balances');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...balances];

    // Leave type filter
    if (leaveTypeFilter !== 'ALL') {
      filtered = filtered.filter((balance) => balance.leaveType.id === leaveTypeFilter);
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (balance) =>
          balance.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          balance.employee.email.toLowerCase().includes(searchText.toLowerCase()) ||
          balance.leaveType.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredBalances(filtered);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return '#ff4d4f';
    if (percentage >= 50) return '#faad14';
    return '#52c41a';
  };

  const getBalanceStatus = (available: number, total: number) => {
    const percentage = ((total - available) / total) * 100;
    if (percentage >= 90) return { type: 'error' as const, icon: <WarningOutlined />, text: 'Critical' };
    if (percentage >= 75) return { type: 'warning' as const, icon: <ClockCircleOutlined />, text: 'Low' };
    return { type: 'success' as const, icon: <CheckCircleOutlined />, text: 'Good' };
  };

  const getLeaveTypeColor = (code: string) => {
    const colors: any = {
      'AL': '#52c41a',
      'SL': '#1890ff',
      'CL': '#fa8c16',
      'PL': '#eb2f96',
      'ML': '#722ed1',
    };
    return colors[code] || '#666';
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
            <CalendarOutlined style={{ marginRight: 12 }} />
            Leave Balances
          </Title>
          <Text type="secondary">View and manage employee leave balances</Text>
        </Space>
      </div>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by employee name, email, or leave type..."
              prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={leaveTypeFilter}
              onChange={setLeaveTypeFilter}
              style={{ width: 200, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#52c41a' }} />}
            >
              <Option value="ALL">All Leave Types</Option>
              {leaveTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Balance Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredBalances.length === 0 ? (
        <PremiumCard>
          <EmptyState
            icon={<CalendarOutlined />}
            title="No Leave Balances"
            subtitle="No leave balances found matching your criteria"
          />
        </PremiumCard>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredBalances.map((balance) => {
            const usedPercentage = (balance.usedLeaves / balance.totalLeaves) * 100;
            const availablePercentage = (balance.availableLeaves / balance.totalLeaves) * 100;
            const status = getBalanceStatus(balance.availableLeaves, balance.totalLeaves);
            const leaveTypeColor = getLeaveTypeColor(balance.leaveType.code);

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={balance.id}>
                <PremiumCard
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Card Header with Gradient */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${leaveTypeColor} 0%, ${leaveTypeColor}dd 100%)`,
                      padding: '20px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Background Pattern */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />

                    {/* Employee Info */}
                    <Space align="start" style={{ position: 'relative', zIndex: 1 }}>
                      <Avatar
                        size={48}
                        src={balance.employee.avatar}
                        icon={<UserOutlined />}
                        style={{
                          background: 'rgba(255,255,255,0.3)',
                          border: '2px solid rgba(255,255,255,0.5)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div>
                          <Text
                            strong
                            style={{
                              color: '#fff',
                              fontSize: 16,
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            {balance.employee.name}
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                            {balance.employee.email}
                          </Text>
                        </div>
                        {balance.employee.department && (
                          <Tag
                            style={{
                              marginTop: 8,
                              background: 'rgba(255,255,255,0.2)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              color: '#fff',
                            }}
                          >
                            {balance.employee.department}
                          </Tag>
                        )}
                      </div>
                    </Space>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px' }}>
                    {/* Leave Type */}
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                      <Tag
                        color={leaveTypeColor}
                        style={{
                          fontSize: 14,
                          padding: '6px 16px',
                          borderRadius: 20,
                          border: 'none',
                        }}
                      >
                        {balance.leaveType.name}
                      </Tag>
                    </div>

                    {/* Circular Progress */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <Progress
                        type="circle"
                        percent={Math.round(availablePercentage)}
                        strokeColor={{
                          '0%': leaveTypeColor,
                          '100%': `${leaveTypeColor}aa`,
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={8}
                        width={120}
                        format={() => (
                          <div>
                            <div
                              style={{
                                fontSize: 28,
                                fontWeight: 600,
                                color: leaveTypeColor,
                              }}
                            >
                              {balance.availableLeaves}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Available</div>
                          </div>
                        )}
                      />
                    </div>

                    {/* Statistics */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <Card
                          size="small"
                          style={{
                            textAlign: 'center',
                            background: '#fafafa',
                            border: 'none',
                            borderRadius: 8,
                          }}
                        >
                          <Statistic
                            value={balance.totalLeaves}
                            valueStyle={{ fontSize: 20, color: '#595959' }}
                            title={
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>Total</span>
                            }
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          size="small"
                          style={{
                            textAlign: 'center',
                            background: '#fafafa',
                            border: 'none',
                            borderRadius: 8,
                          }}
                        >
                          <Statistic
                            value={balance.usedLeaves}
                            valueStyle={{ fontSize: 20, color: '#ff4d4f' }}
                            title={
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>Used</span>
                            }
                          />
                        </Card>
                      </Col>
                    </Row>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Usage
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: 12,
                            color: getProgressColor(usedPercentage),
                          }}
                        >
                          {Math.round(usedPercentage)}%
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round(usedPercentage)}
                        strokeColor={getProgressColor(usedPercentage)}
                        trailColor="#f0f0f0"
                        showInfo={false}
                        strokeWidth={8}
                        style={{ marginBottom: 0 }}
                      />
                    </div>

                    {/* Status Alert */}
                    {balance.availableLeaves <= 2 && (
                      <Alert
                        message="Low Balance"
                        type={status.type}
                        icon={status.icon}
                        showIcon
                        style={{
                          fontSize: 12,
                          padding: '8px 12px',
                          borderRadius: 6,
                        }}
                      />
                    )}

                    {balance.pendingLeaves && balance.pendingLeaves > 0 && (
                      <Alert
                        message={`${balance.pendingLeaves} day(s) pending approval`}
                        type="info"
                        icon={<ClockCircleOutlined />}
                        showIcon
                        style={{
                          fontSize: 12,
                          padding: '8px 12px',
                          borderRadius: 6,
                          marginTop: 8,
                        }}
                      />
                    )}
                  </div>
                </PremiumCard>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default LeaveBalancesListPage;
