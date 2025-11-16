import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Input, Tag, Typography, message, Alert, Button, Empty, Tooltip } from 'antd';
import { SendOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getMyDocumentRequestsAsRequester } from '../../api/documentRequestsApi';

const { Title, Text } = Typography;

interface DocumentRequest {
  id: string;
  targetEmployeeId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export const MyOutgoingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchText]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDocumentRequestsAsRequester();
      setRequests(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load requests';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];
    if (searchText) {
      filtered = filtered.filter(
        (req) =>
          req.targetEmployeeId.toLowerCase().includes(searchText.toLowerCase()) ||
          req.message.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredRequests(filtered);
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      REQUESTED: { color: 'orange', icon: <ClockCircleOutlined /> },
      COMPLETED: { color: 'green', icon: <CheckCircleOutlined /> },
      REJECTED: { color: 'red', icon: <CloseCircleOutlined /> },
    };
    const { color, icon } = config[status] || { color: 'default', icon: null };
    return <Tag color={color} icon={icon}>{status}</Tag>;
  };

  const columns: ColumnsType<DocumentRequest> = [
    {
      title: 'Target Employee',
      dataIndex: 'targetEmployeeId',
      key: 'targetEmployeeId',
      width: 200,
      render: (id) => <Text strong>{id}</Text>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: { showTitle: false },
      render: (msg) => <Tooltip title={msg}><Text type="secondary">{msg || '-'}</Text></Tooltip>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: getStatusTag,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>,
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: (date) => <Text type="secondary">{date ? dayjs(date).format('MMM DD, YYYY HH:mm') : '-'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        record.status === 'COMPLETED' ? (
          <Button type="text" size="small" icon={<EyeOutlined />} disabled>View</Button>
        ) : <Text type="secondary">-</Text>
      ),
    },
  ];

  const stats = {
    total: requests.length,
    requested: requests.filter((r) => r.status === 'REQUESTED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div style={{ padding: 0 }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
              <SendOutlined /> My Outgoing Requests
            </Title>
            <Text type="secondary">Document requests you've sent to others</Text>
          </div>

          <Space size={16} wrap style={{ marginBottom: 16 }}>
            {[
              { label: 'Total', value: stats.total, color: '#0a0d54' },
              { label: 'Pending', value: stats.requested, color: '#faad14' },
              { label: 'Completed', value: stats.completed, color: '#52c41a' },
            ].map((stat) => (
              <Card key={stat.label} size="small" style={{ minWidth: 140 }}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{stat.label}</Text>
                  <div style={{ fontSize: 24, fontWeight: 600, color: stat.color }}>{stat.value}</div>
                </div>
              </Card>
            ))}
          </Space>

          <Space size={12} wrap>
            <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 280 }} allowClear />
            <Button icon={<ReloadOutlined />} onClick={loadRequests}>Refresh</Button>
          </Space>
        </div>

        {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />}

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} requests` }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={8}>
                    <Text type="secondary">No outgoing requests found</Text>
                  </Space>
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};
