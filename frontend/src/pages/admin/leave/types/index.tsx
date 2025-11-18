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
  Switch,
  Tooltip,
  Badge,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import http from '../../../../api/http';
import { PremiumCard } from '../../../../components/PremiumCard';
import { EmptyState } from '../../../../components/EmptyState';

const { Title, Text } = Typography;

interface LeaveType {
  id: string;
  name: string;
  code: string;
  maxDays: number;
  carryForward: boolean;
  carryForwardLimit?: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

const LeaveTypesListPage: React.FC = () => {
  const [data, setData] = useState<LeaveType[]>([]);
  const [filteredData, setFilteredData] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchText]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get('/api/leave/types');
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await http.patch(`/api/leave/types/${id}`, { isActive: !currentStatus });
      message.success(`Leave type ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update leave type status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Leave Type',
      content: (
        <div>
          <p>Are you sure you want to delete the leave type <strong>{name}</strong>?</p>
          <p style={{ color: '#ff4d4f', fontSize: 12 }}>
            This action cannot be undone and may affect existing leave applications.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await http.delete(`/api/leave/types/${id}`);
          message.success('Leave type deleted successfully');
          fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete leave type');
        }
      },
    });
  };

  const getTypeColor = (code: string) => {
    const colors: any = {
      'AL': '#52c41a',
      'SL': '#1890ff',
      'CL': '#fa8c16',
      'PL': '#eb2f96',
      'ML': '#722ed1',
    };
    return colors[code] || '#666';
  };

  const columns: ColumnsType<LeaveType> = [
    {
      title: 'Leave Type',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: getTypeColor(record.code),
              }}
            />
            <Text strong style={{ fontSize: 15 }}>
              {text}
            </Text>
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <Tag
          color={getTypeColor(text)}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 4,
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Max Days',
      dataIndex: 'maxDays',
      key: 'maxDays',
      width: 120,
      align: 'center',
      render: (days) => (
        <Badge
          count={days}
          style={{
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            fontSize: 14,
            padding: '0 12px',
            height: 28,
            lineHeight: '28px',
          }}
          showZero
        />
      ),
      sorter: (a, b) => a.maxDays - b.maxDays,
    },
    {
      title: (
        <Space>
          <span>Carry Forward</span>
          <Tooltip title="Whether unused leaves can be carried forward to the next period">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'carryForward',
      key: 'carryForward',
      width: 150,
      align: 'center',
      render: (carryForward, record) => (
        <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
          <Tag
            icon={carryForward ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={carryForward ? 'success' : 'default'}
          >
            {carryForward ? 'Yes' : 'No'}
          </Tag>
          {carryForward && record.carryForwardLimit && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Max: {record.carryForwardLimit} days
            </Text>
          )}
        </Space>
      ),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.carryForward === value,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive, record) => (
        <Tooltip title={`Click to ${isActive ? 'deactivate' : 'activate'}`}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleActive(record.id, isActive)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
            style={{
              background: isActive
                ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                : undefined,
            }}
          />
        </Tooltip>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/leave/types/${record.id}/edit`)}
              style={{
                color: '#1890ff',
              }}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.name)}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                <CalendarOutlined style={{ marginRight: 12 }} />
                Leave Types
              </Title>
              <Text type="secondary">Configure and manage leave type settings</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/leave/types/create')}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                height: 44,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
              }}
            >
              Create Leave Type
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Space>
              <CalendarOutlined style={{ fontSize: 32, color: '#fff' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Total Types
                </Text>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {data.length}
                </Title>
              </div>
            </Space>
          </PremiumCard>
        </Col>
        <Col xs={24} sm={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
          >
            <Space>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Active Types
                </Text>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {data.filter((t) => t.isActive).length}
                </Title>
              </div>
            </Space>
          </PremiumCard>
        </Col>
        <Col xs={24} sm={8}>
          <PremiumCard
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
          >
            <Space>
              <CloseCircleOutlined style={{ fontSize: 32, color: '#fff' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  Inactive Types
                </Text>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {data.filter((t) => !t.isActive).length}
                </Title>
              </div>
            </Space>
          </PremiumCard>
        </Col>
      </Row>

      {/* Table Card */}
      <PremiumCard
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Search Bar */}
        <div style={{ padding: '20px 20px 0 20px' }}>
          <Input
            size="large"
            placeholder="Search by name or code..."
            prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 8, marginBottom: 20 }}
            allowClear
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leave types`,
            style: { padding: '16px 24px' },
          }}
          locale={{
            emptyText: (
              <EmptyState
                icon={<CalendarOutlined />}
                title="No Leave Types"
                subtitle="No leave types found. Create one to get started."
                action={{
                  text: 'Create Leave Type',
                  icon: <PlusOutlined />,
                  onClick: () => navigate('/admin/leave/types/create'),
                }}
              />
            ),
          }}
          style={{
            borderRadius: 0,
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </PremiumCard>

      <style>
        {`
          .table-row-light {
            background: #ffffff;
          }
          .table-row-dark {
            background: #fafafa;
          }
          .ant-table-tbody > tr:hover > td {
            background: #e6f7ff !important;
          }
        `}
      </style>
    </div>
  );
};

export default LeaveTypesListPage;
