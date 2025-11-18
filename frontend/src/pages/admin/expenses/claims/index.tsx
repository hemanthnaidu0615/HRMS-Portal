import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Select,
  Input,
  message,
  Modal,
  Avatar,
  Spin,
  Typography,
  Statistic,
  Image,
  Tooltip,
  Badge,
} from 'antd';
import {
  WalletOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  DollarOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
  };
  claimDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  approver?: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  description: string;
  receiptUrl?: string;
  items?: Array<{
    description: string;
    amount: number;
    category: string;
  }>;
  remarks?: string;
}

const ClaimsListPage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, statusFilter, categoryFilter, searchText]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/expenses/claims');
      setClaims(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch expense claims');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.category.name === categoryFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (claim) =>
          claim.employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          claim.claimNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          claim.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredClaims(filtered);
  };

  const handleApprove = async (id: string) => {
    Modal.confirm({
      title: 'Approve Expense Claim',
      content: 'Are you sure you want to approve this expense claim?',
      okText: 'Approve',
      okType: 'primary',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/expenses/claims/${id}/approve`);
          message.success('Expense claim approved successfully');
          fetchClaims();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve expense claim');
        }
      },
    });
  };

  const handleReject = async (id: string) => {
    Modal.confirm({
      title: 'Reject Expense Claim',
      content: 'Are you sure you want to reject this expense claim?',
      okText: 'Reject',
      okType: 'danger',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await http.patch(`/api/expenses/claims/${id}/reject`);
          message.success('Expense claim rejected successfully');
          fetchClaims();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to reject expense claim');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      DRAFT: {
        color: 'default',
        icon: <FileTextOutlined />,
        label: 'Draft',
      },
      SUBMITTED: {
        color: 'orange',
        icon: <ClockCircleOutlined />,
        label: 'Submitted',
      },
      APPROVED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
      },
      REJECTED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
      },
      PAID: {
        color: 'blue',
        icon: <DollarOutlined />,
        label: 'Paid',
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => c.status === 'SUBMITTED').reduce((sum, c) => sum + c.totalAmount, 0),
    approved: claims.filter((c) => c.status === 'APPROVED').length,
    rejected: claims.filter((c) => c.status === 'REJECTED').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#f5222d' }}>
                <WalletOutlined style={{ marginRight: 12 }} />
                Expense Claims
              </Title>
              <Text type="secondary">Manage and review employee expense claims</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/expenses/claims/create')}
              style={{
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)',
              }}
            >
              Create Claim
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Claims</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<FileTextOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Pending Amount</span>}
              value={stats.pending}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<ClockCircleOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Approved</span>}
              value={stats.approved}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CheckCircleOutlined />}
            />
          </PremiumCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <PremiumCard
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Rejected</span>}
              value={stats.rejected}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<CloseCircleOutlined />}
            />
          </PremiumCard>
        </Col>
      </Row>

      {/* Filters */}
      <PremiumCard style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Search by employee, claim number, or description..."
              prefix={<SearchOutlined style={{ color: '#f5222d' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#f5222d' }} />}
            >
              <Option value="ALL">All Status</Option>
              <Option value="DRAFT">Draft</Option>
              <Option value="SUBMITTED">Submitted</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="PAID">Paid</Option>
            </Select>
          </Col>
          <Col>
            <Select
              size="large"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150, borderRadius: 8 }}
              suffixIcon={<FilterOutlined style={{ color: '#f5222d' }} />}
            >
              <Option value="ALL">All Categories</Option>
            </Select>
          </Col>
        </Row>
      </PremiumCard>

      {/* Claims Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredClaims.length === 0 ? (
        <PremiumCard>
          <EmptyState
            icon={<WalletOutlined />}
            title="No Expense Claims"
            subtitle="No expense claims found matching your criteria"
            action={{
              text: 'Create Claim',
              icon: <PlusOutlined />,
              onClick: () => navigate('/admin/expenses/claims/create'),
            }}
          />
        </PremiumCard>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredClaims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status);
            return (
              <Col xs={24} sm={24} md={12} lg={8} key={claim.id}>
                <PremiumCard
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Receipt Image */}
                  {claim.receiptUrl && (
                    <div
                      style={{
                        height: 200,
                        overflow: 'hidden',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        background: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {claim.receiptUrl.endsWith('.pdf') ? (
                        <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
                      ) : (
                        <Image
                          src={claim.receiptUrl}
                          alt="Receipt"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: 20 }}>
                    {/* Header */}
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong style={{ fontSize: 16, color: '#262626' }}>
                            {claim.claimNumber}
                          </Text>
                        </Col>
                        <Col>
                          <Tag
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                            style={{ borderRadius: 4 }}
                          >
                            {statusConfig.label}
                          </Tag>
                        </Col>
                      </Row>

                      {/* Employee */}
                      <Space>
                        <Avatar
                          size={32}
                          src={claim.employee.avatar}
                          icon={<UserOutlined />}
                          style={{
                            background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                          }}
                        />
                        <div>
                          <Text strong style={{ display: 'block', fontSize: 14 }}>
                            {claim.employee.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(claim.claimDate).format('MMM DD, YYYY')}
                          </Text>
                        </div>
                      </Space>

                      {/* Category */}
                      <Tag color="blue" style={{ borderRadius: 4 }}>
                        {claim.category.name}
                      </Tag>

                      {/* Description */}
                      <Text type="secondary" ellipsis={{ rows: 2 }}>
                        {claim.description}
                      </Text>

                      {/* Amount */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                          padding: '12px 16px',
                          borderRadius: 8,
                          textAlign: 'center',
                        }}
                      >
                        <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block', fontSize: 12 }}>
                          Total Amount
                        </Text>
                        <Text strong style={{ color: '#fff', fontSize: 24 }}>
                          {formatCurrency(claim.totalAmount)}
                        </Text>
                      </div>

                      {/* Approver */}
                      {claim.approver && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Approver: {claim.approver.name}
                        </Text>
                      )}

                      {/* Actions */}
                      <div
                        style={{
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: 12,
                          marginTop: 12,
                        }}
                      >
                        {claim.status === 'SUBMITTED' ? (
                          <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleApprove(claim.id)}
                              style={{
                                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                border: 'none',
                                borderRadius: 6,
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              danger
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleReject(claim.id)}
                              style={{ borderRadius: 6 }}
                            >
                              Reject
                            </Button>
                          </Space>
                        ) : (
                          <Button
                            block
                            onClick={() => navigate(`/admin/expenses/claims/${claim.id}`)}
                            style={{ borderRadius: 6 }}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </Space>
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

export default ClaimsListPage;
