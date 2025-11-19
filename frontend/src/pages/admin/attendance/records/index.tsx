import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Input,
  DatePicker,
  Select,
  Card,
  Typography,
  Skeleton,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workHours: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
  location: string;
  notes?: string;
}

const RecordsListPage: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchText, selectedStatus, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await http.get('/api/attendance/records');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch attendance records';
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
        (record) =>
          record.employeeName.toLowerCase().includes(lowercased) ||
          record.location.toLowerCase().includes(lowercased)
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((record) => record.status === selectedStatus);
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((record) => {
        const recordDate = dayjs(record.date);
        return recordDate.isSameOrAfter(dateRange[0], 'day') && recordDate.isSameOrBefore(dateRange[1], 'day');
      });
    }

    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    Modal.confirm({
      title: 'Delete Attendance Record',
      content: `Are you sure you want to delete the attendance record for ${employeeName}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await http.delete(`/api/attendance/records/${id}`);
          message.success('Attendance record deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete attendance record');
        }
      },
    });
  };

  const handleExport = () => {
    message.success('Export functionality will be implemented soon!');
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Present: 'green',
      Absent: 'red',
      Late: 'orange',
      'Half Day': 'blue',
      Leave: 'purple',
    };
    return colors[status] || 'default';
  };

  const formatTime = (time: string): string => {
    if (!time) return '—';
    return dayjs(time).format('hh:mm A');
  };

  const formatWorkHours = (hours: number): string => {
    if (!hours) return '—';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => a.employeeName.localeCompare(b.employeeName),
      render: (name: string) => (
        <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => (
        <span style={{ fontWeight: 500 }}>{dayjs(date).format('MMM DD, YYYY')}</span>
      ),
    },
    {
      title: 'Check In',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 110,
      render: (time: string) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color="blue"
          style={{ borderRadius: 6, fontSize: 12, fontWeight: 500 }}
        >
          {formatTime(time)}
        </Tag>
      ),
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      width: 110,
      render: (time: string) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color="purple"
          style={{ borderRadius: 6, fontSize: 12, fontWeight: 500 }}
        >
          {formatTime(time)}
        </Tag>
      ),
    },
    {
      title: 'Work Hours',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 110,
      align: 'center' as const,
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => a.workHours - b.workHours,
      render: (hours: number) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {formatWorkHours(hours)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: 6, fontWeight: 500 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location: string) => (
        <Tooltip title={location}>
          <span style={{ fontSize: 13, color: '#666' }}>
            {location.length > 20 ? `${location.substring(0, 20)}...` : location}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: AttendanceRecord) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/attendance/records/${record.id}`)}
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
            onClick={() => navigate(`/admin/attendance/records/${record.id}/edit`)}
            style={{ borderRadius: 6 }}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.employeeName)}
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
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
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
                Attendance Records
              </Title>
              <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: 14 }}>
                Track and manage employee attendance records
              </p>
            </div>
            <Space wrap>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{
                  borderRadius: 6,
                  borderColor: '#1890ff',
                  color: '#1890ff',
                }}
              >
                Export
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/attendance/records/create')}
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  borderColor: '#1890ff',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                }}
              >
                Create Record
              </Button>
            </Space>
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
              placeholder="Search by employee or location..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250, borderRadius: 6 }}
              allowClear
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
              style={{ borderRadius: 6 }}
              format="MMM DD, YYYY"
            />
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: 150, borderRadius: 6 }}
            >
              <Select.Option value="Present">Present</Select.Option>
              <Select.Option value="Absent">Absent</Select.Option>
              <Select.Option value="Late">Late</Select.Option>
              <Select.Option value="Half Day">Half Day</Select.Option>
              <Select.Option value="Leave">Leave</Select.Option>
            </Select>
            {(searchText || selectedStatus || dateRange) && (
              <Button onClick={handleClearFilters} style={{ borderRadius: 6 }}>
                Clear Filters
              </Button>
            )}
            <span style={{ marginLeft: 'auto', color: '#666', fontWeight: 500 }}>
              Showing {filteredData.length} of {data.length} records
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error Loading Records"
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
              emptyText: searchText || selectedStatus || dateRange
                ? 'No records match your filters'
                : 'No attendance records found. Click "Create Record" to add one.',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
              style: { marginTop: 16 },
            }}
            style={{
              borderRadius: 8,
            }}
            rowClassName={() => 'attendance-record-row'}
          />
        </Space>
      </PremiumCard>

      <style>{`
        .attendance-record-row:hover {
          background-color: #f0f9ff !important;
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

export default RecordsListPage;
