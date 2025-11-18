import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Space,
  Input,
  Tag,
  Typography,
  message,
  Tooltip,
  Empty,
  Alert,
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getMyDocumentRequestsAsTarget } from '../../api/documentRequestsApi';
import { downloadDocument } from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';

const { Title, Text } = Typography;

interface DocumentRequest {
  id: string;
  requesterUserId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  fulfilledDocumentId?: string | null;
}

type StatusType = 'REQUESTED' | 'COMPLETED' | 'REJECTED';

/**
 * My Incoming Document Requests Page
 * Displays requests from others asking for documents
 */
export const MyIncomingRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'ALL'>('ALL');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; fileName: string; fileType: string | null; filePath: string; createdAt: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchText, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDocumentRequestsAsTarget();
      setRequests(response);
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

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (req) =>
          req.requesterUserId.toLowerCase().includes(searchText.toLowerCase()) ||
          req.message.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleUploadForRequest = (requestId: string) => {
    // Navigate to upload page with requestId as query param
    navigate(`/documents/upload?requestId=${requestId}`);
  };

  const openPreview = (docId: string, filename = 'Requested Document', createdAt?: string) => {
    setPreviewDoc({ id: docId, fileName: filename, fileType: null, filePath: '', createdAt: createdAt || new Date().toISOString() });
    setPreviewVisible(true);
  };

  const handleDownload = async (docId: string, filename = 'requested-document') => {
    try {
      const res = await downloadDocument(docId);
      const contentType = (res as any)?.headers?.['content-type'] || (res as any)?.headers?.get?.('content-type') || undefined;
      const blob = new Blob([res.data], contentType ? { type: contentType } : undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error('Download failed');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      REQUESTED: { color: 'orange', icon: <ClockCircleOutlined /> },
      COMPLETED: { color: 'green', icon: <CheckCircleOutlined /> },
      REJECTED: { color: 'red', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: 'default', icon: null };

    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const columns: ColumnsType<DocumentRequest> = [
    {
      title: 'Requester',
      dataIndex: 'requesterUserId',
      key: 'requesterUserId',
      width: 200,
      render: (userId) => <Text strong>{userId}</Text>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false,
      },
      render: (message) => (
        <Tooltip title={message}>
          <Text type="secondary">{message || '-'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Requested', value: 'REQUESTED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Requested Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => (
        <Text type="secondary">{dayjs(createdAt).format('MMM DD, YYYY HH:mm')}</Text>
      ),
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: (completedAt) => (
        <Text type="secondary">{completedAt ? dayjs(completedAt).format('MMM DD, YYYY HH:mm') : '-'}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => {
        if (record.status === 'COMPLETED' && record.fulfilledDocumentId) {
          return (
            <Space size={8}>
              <Tooltip title="View uploaded document">
                <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(record.fulfilledDocumentId!, 'Uploaded Document', record.completedAt || record.createdAt)} />
              </Tooltip>
              <Tooltip title="Download">
                <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record.fulfilledDocumentId!, 'uploaded-document')} />
              </Tooltip>
            </Space>
          );
        }

        if (record.status === 'REQUESTED') {
          return (
            <Space size={8}>
              <Button
                type="primary"
                size="small"
                icon={<UploadOutlined />}
                onClick={() => handleUploadForRequest(record.id)}
              >
                Upload
              </Button>
            </Space>
          );
        }

        return <Text type="secondary">-</Text>;
      },
    },
  ];

  const stats = {
    total: requests.length,
    requested: requests.filter((r) => r.status === 'REQUESTED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header Card with Gradient */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction="vertical" size={8}>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <InboxOutlined /> Incoming Document Requests
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
            Requests from others asking you to upload documents
          </Text>
        </Space>
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Stats and Filters */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>

          {/* Stats */}
          <Space size={16} wrap style={{ marginBottom: 16 }}>
            <Card size="small" style={{ minWidth: 140 }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Total</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#0a0d54' }}>{stats.total}</div>
              </div>
            </Card>
            <Card size="small" style={{ minWidth: 140 }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Pending</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>{stats.requested}</div>
              </div>
            </Card>
            <Card size="small" style={{ minWidth: 140 }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Completed</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{stats.completed}</div>
              </div>
            </Card>
          </Space>

          {/* Filters */}
          <Space size={12} wrap>
            <Input
              placeholder="Search requester or message..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Space.Compact>
              <Button
                type={statusFilter === 'ALL' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                type={statusFilter === 'REQUESTED' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('REQUESTED')}
              >
                Pending
              </Button>
              <Button
                type={statusFilter === 'COMPLETED' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
            </Space.Compact>
            <Button icon={<ReloadOutlined />} onClick={loadRequests}>
              Refresh
            </Button>
          </Space>
        </div>
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
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
            style: { marginTop: 16 },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={8}>
                    <Text type="secondary">No incoming requests found</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      You'll see requests here when someone asks you to upload a document
                    </Text>
                  </Space>
                }
              />
            ),
          }}
        />
        {/* Preview Modal */}
        {previewDoc && (
          <DocumentPreviewModal
            document={previewDoc}
            visible={previewVisible}
            onClose={() => setPreviewVisible(false)}
          />
        )}
      </Card>
    </div>
  );
};
