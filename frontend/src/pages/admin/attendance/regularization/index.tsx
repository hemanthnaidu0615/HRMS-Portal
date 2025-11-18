import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  message,
  Modal,
  Input,
  Select,
  Typography,
  Skeleton,
  Alert,
  Row,
  Col,
  Space,
  Avatar,
  Badge,
  Tooltip,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestType: 'Missing Check-in' | 'Missing Check-out' | 'Late Arrival' | 'Early Departure' | 'Other';
  reason: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName?: string;
  submittedAt: string;
  documents?: string[];
}

const RegularizationListPage: React.FC = () => {
  const [data, setData] = useState<RegularizationRequest[]>([]);
  const [filteredData, setFilteredData] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchText, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await http.get('/api/attendance/regularization');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch regularization requests';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (searchText) {
      const lowercased = searchText.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.employeeName.toLowerCase().includes(lowercased) ||
          request.reason.toLowerCase().includes(lowercased) ||
          request.requestType.toLowerCase().includes(lowercased)
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((request) => request.status === selectedStatus);
    }

    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    Modal.confirm({
      title: 'Delete Regularization Request',
      content: `Are you sure you want to delete the regularization request for ${employeeName}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await http.delete(`/api/attendance/regularization/${id}`);
          message.success('Regularization request deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete regularization request');
        }
      },
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      Pending: {
        color: 'orange',
        icon: <SyncOutlined spin />,
        label: 'Pending',
      },
      Approved: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
      },
      Rejected: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
      },
    };
    return configs[status] || configs.Pending;
  };

  const getRequestTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Missing Check-in': 'blue',
      'Missing Check-out': 'purple',
      'Late Arrival': 'orange',
      'Early Departure': 'cyan',
      'Other': 'default',
    };
    return colors[type] || 'default';
  };

  const renderRequestCard = (request: RegularizationRequest) => {
    const statusConfig = getStatusConfig(request.status);

    return (
      <Col xs={24} sm={24} md={12} lg={8} xl={8} key={request.id}>
        <PremiumCard
          hoverable
          style={{
            borderRadius: 12,
            border: `2px solid ${statusConfig.color === 'orange' ? '#ffa940' : statusConfig.color === 'green' ? '#52c41a' : '#ff4d4f'}`,
            boxShadow: `0 4px 12px ${statusConfig.color === 'orange' ? 'rgba(255, 169, 64, 0.2)' : statusConfig.color === 'green' ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255, 77, 79, 0.2)'}`,
            height: '100%',
            transition: 'all 0.3s ease',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Header with Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Space>
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#1890ff' }}>
                    {request.employeeName}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {dayjs(request.submittedAt).format('MMM DD, YYYY')}
                  </Text>
                </div>
              </Space>
              <Badge
                count={
                  <Tag
                    icon={statusConfig.icon}
                    color={statusConfig.color}
                    style={{
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      padding: '4px 12px',
                    }}
                  >
                    {statusConfig.label}
                  </Tag>
                }
              />
            </div>

            {/* Date and Type */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #bae7ff',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Attendance Date:</Text>
                  <Text style={{ color: '#1890ff', fontWeight: 600 }}>
                    {dayjs(request.date).format('MMM DD, YYYY')}
                  </Text>
                </div>
                <div>
                  <Tag color={getRequestTypeColor(request.requestType)} style={{ borderRadius: 6 }}>
                    {request.requestType}
                  </Tag>
                </div>
              </Space>
            </div>

            {/* Requested Times */}
            {(request.requestedCheckIn || request.requestedCheckOut) && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {request.requestedCheckIn && (
                  <Tooltip title="Requested Check-in">
                    <Tag
                      icon={<ClockCircleOutlined />}
                      color="blue"
                      style={{ borderRadius: 6, fontSize: 12 }}
                    >
                      In: {dayjs(request.requestedCheckIn).format('hh:mm A')}
                    </Tag>
                  </Tooltip>
                )}
                {request.requestedCheckOut && (
                  <Tooltip title="Requested Check-out">
                    <Tag
                      icon={<ClockCircleOutlined />}
                      color="purple"
                      style={{ borderRadius: 6, fontSize: 12 }}
                    >
                      Out: {dayjs(request.requestedCheckOut).format('hh:mm A')}
                    </Tag>
                  </Tooltip>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <FileTextOutlined /> Reason:
              </Text>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: '#666',
                  maxHeight: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {request.reason}
              </div>
            </div>

            {/* Approver */}
            {request.approverName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Approver: <Text strong>{request.approverName}</Text>
              </Text>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/admin/attendance/regularization/${request.id}`)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  borderColor: '#1890ff',
                  borderRadius: 6,
                }}
              >
                View
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/attendance/regularization/${request.id}/edit`)}
                style={{ borderRadius: 6 }}
              >
                Edit
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(request.id, request.employeeName)}
                style={{ borderRadius: 6 }}
              />
            </div>
          </Space>
        </PremiumCard>
      </Col>
    );
  };

  if (loading && data.length === 0) {
    return (
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
        <PremiumCard style={{ borderRadius: 12 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </PremiumCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <PremiumCard
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
          border: '1px solid #e8f4ff',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Regularization Requests
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Manage attendance regularization and adjustment requests
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/attendance/regularization/create')}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderColor: '#1890ff',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
              }}
            >
              Create Request
            </Button>
          </div>

          {/* Filters */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #bae7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <FilterOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <Input
              placeholder="Search by employee, reason or type..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, borderRadius: 6 }}
              allowClear
            />
            <Select
              placeholder="Filter by Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: 180, borderRadius: 6 }}
            >
              <Select.Option value="Pending">
                <SyncOutlined spin /> Pending
              </Select.Option>
              <Select.Option value="Approved">
                <CheckCircleOutlined /> Approved
              </Select.Option>
              <Select.Option value="Rejected">
                <CloseCircleOutlined /> Rejected
              </Select.Option>
            </Select>
            {(searchText || selectedStatus) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666', fontWeight: 500 }}>
              Showing {filteredData.length} of {data.length} requests
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error Loading Requests"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Cards Grid */}
          {filteredData.length === 0 ? (
            <Empty
              description={
                searchText || selectedStatus
                  ? 'No requests match your filters'
                  : 'No regularization requests found. Click "Create Request" to add one.'
              }
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Row gutter={[16, 16]}>{filteredData.map(renderRequestCard)}</Row>
          )}
        </Space>
      </PremiumCard>

      <style>{`
        .ant-card-hoverable:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default RegularizationListPage;
