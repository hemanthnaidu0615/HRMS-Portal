import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Space, Input, Tag, Typography, message, Alert, Button, Empty, Tooltip } from 'antd';
import { SendOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getMyDocumentRequestsAsRequester } from '../../api/documentRequestsApi';
import { downloadDocument } from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';

const { Title, Text } = Typography;

interface DocumentRequest {
  id: string;
  targetEmployeeId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  fulfilledDocumentId?: string | null;
}

export const MyOutgoingRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; fileName: string; fileType: string | null; filePath: string; createdAt: string } | null>(null);

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
    if (searchText) {
      filtered = filtered.filter(
        (req) =>
          req.targetEmployeeId.toLowerCase().includes(searchText.toLowerCase()) ||
          req.message.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredRequests(filtered);
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
      width: 160,
      render: (_, record) => (
        record.status === 'COMPLETED' && record.fulfilledDocumentId ? (
          <Space size={8}>
            <Tooltip title="View">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(record.fulfilledDocumentId!, 'Requested Document', record.completedAt || record.createdAt)} />
            </Tooltip>
            <Tooltip title="Download">
              <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record.fulfilledDocumentId!, 'requested-document')} />
            </Tooltip>
          </Space>
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
      {/* Header Card with Gradient */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction="vertical" size={8}>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <SendOutlined /> My Outgoing Requests
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
            Document requests you've sent to others
          </Text>
        </Space>
      </Card>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>

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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/document-requests/create')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Request Document
            </Button>
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
