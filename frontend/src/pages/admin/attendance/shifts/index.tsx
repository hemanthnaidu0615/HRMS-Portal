import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Input,
  Typography,
  Skeleton,
  Alert,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number; // in minutes
  graceTime: number; // in minutes
  isActive: boolean;
  totalHours?: number;
  description?: string;
}

const ShiftsListPage: React.FC = () => {
  const [data, setData] = useState<Shift[]>([]);
  const [filteredData, setFilteredData] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchText]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await http.get('/api/attendance/shifts');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch shifts';
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
        (shift) =>
          shift.name.toLowerCase().includes(lowercased) ||
          (shift.description && shift.description.toLowerCase().includes(lowercased))
      );
    }

    setFilteredData(filtered);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await http.patch(`/api/attendance/shifts/${id}`, {
        isActive: !currentStatus,
      });
      message.success(`Shift ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update shift status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Shift',
      content: `Are you sure you want to delete the shift "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await http.delete(`/api/attendance/shifts/${id}`);
          message.success('Shift deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete shift');
        }
      },
    });
  };

  const formatTime = (time: string): string => {
    if (!time) return '—';
    return dayjs(time, 'HH:mm:ss').format('hh:mm A');
  };

  const calculateDuration = (startTime: string, endTime: string, breakDuration: number): string => {
    if (!startTime || !endTime) return '—';

    const start = dayjs(startTime, 'HH:mm:ss');
    const end = dayjs(endTime, 'HH:mm:ss');

    let diff = end.diff(start, 'minute');
    if (diff < 0) diff += 24 * 60; // Handle overnight shifts

    diff -= breakDuration; // Subtract break time

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a: Shift, b: Shift) => a.name.localeCompare(b.name),
      render: (name: string, record: Shift) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1890ff' }}>{name}</span>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      align: 'center' as const,
      render: (time: string) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color="blue"
          style={{ borderRadius: 6, fontSize: 13, fontWeight: 500 }}
        >
          {formatTime(time)}
        </Tag>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      align: 'center' as const,
      render: (time: string) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color="purple"
          style={{ borderRadius: 6, fontSize: 13, fontWeight: 500 }}
        >
          {formatTime(time)}
        </Tag>
      ),
    },
    {
      title: 'Working Hours',
      key: 'workingHours',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: Shift) => (
        <span style={{ fontWeight: 600, color: '#1890ff', fontSize: 14 }}>
          {calculateDuration(record.startTime, record.endTime, record.breakDuration)}
        </span>
      ),
    },
    {
      title: 'Break Duration',
      dataIndex: 'breakDuration',
      key: 'breakDuration',
      width: 130,
      align: 'center' as const,
      render: (minutes: number) => (
        <Tag color="orange" style={{ borderRadius: 6 }}>
          {minutes} min
        </Tag>
      ),
    },
    {
      title: 'Grace Time',
      dataIndex: 'graceTime',
      key: 'graceTime',
      width: 110,
      align: 'center' as const,
      render: (minutes: number) => (
        <Tag color="cyan" style={{ borderRadius: 6 }}>
          {minutes} min
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center' as const,
      render: (isActive: boolean, record: Shift) => (
        <Tooltip title={`Click to ${isActive ? 'deactivate' : 'activate'}`}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(record.id, isActive)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
            style={{
              background: isActive
                ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                : undefined,
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Shift) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/attendance/shifts/${record.id}`)}
            style={{
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
            onClick={() => navigate(`/admin/attendance/shifts/${record.id}/edit`)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.name)}
            style={{ borderRadius: 6 }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
        <PremiumCard style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </PremiumCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <PremiumCard
        hoverable={false}
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
                Shift Management
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Define and manage work shifts and timings
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/attendance/shifts/create')}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderColor: '#1890ff',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
              }}
            >
              Create Shift
            </Button>
          </div>

          {/* Search */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #bae7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <SearchOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <Input
              placeholder="Search shifts by name or description..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, borderRadius: 6 }}
              allowClear
            />
            <span style={{ color: '#666', fontWeight: 500 }}>
              Showing {filteredData.length} of {data.length} shifts
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error Loading Shifts"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
            locale={{
              emptyText: searchText
                ? 'No shifts match your search'
                : 'No shifts found. Click "Create Shift" to add one.',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} shifts`,
              style: { marginTop: 16 },
            }}
            style={{
              borderRadius: 8,
            }}
            rowClassName={(record) =>
              record.isActive ? 'shift-row-active' : 'shift-row-inactive'
            }
          />
        </Space>
      </PremiumCard>

      <style>{`
        .shift-row-active:hover {
          background-color: #f0f9ff !important;
          transition: all 0.3s ease;
        }
        .shift-row-inactive {
          opacity: 0.6;
        }
        .shift-row-inactive:hover {
          background-color: #fff1f0 !important;
          transition: all 0.3s ease;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%) !important;
          color: #1890ff !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #1890ff !important;
        }
      `}</style>
    </div>
  );
};

export default ShiftsListPage;
