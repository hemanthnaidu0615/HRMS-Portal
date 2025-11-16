import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Space,
  Input,
  DatePicker,
  Select,
  Tag,
  Typography,
  message,
  Tooltip,
  Empty,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getMyDocuments, downloadDocument } from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Document {
  id: string;
  fileName: string;
  fileType: string | null;
  filePath: string;
  uploadedByUserId: string;
  createdAt: string;
}

/**
 * My Documents Page
 * Premium Ant Design implementation with filters, preview, and download
 */
export const MyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchText, fileTypeFilter, dateRange]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDocuments();
      setDocuments(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load documents';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Search filter
    if (searchText) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // File type filter
    if (fileTypeFilter) {
      filtered = filtered.filter((doc) => {
        const type = (doc.fileType || '').toLowerCase();
        return type.includes(fileTypeFilter.toLowerCase());
      });
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((doc) => {
        const docDate = dayjs(doc.createdAt);
        return docDate.isAfter(dateRange[0]) && docDate.isBefore(dateRange[1]);
      });
    }

    setFilteredDocuments(filtered);
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  const handleDownload = async (document: Document) => {
    try {
      message.loading({ content: 'Preparing download...', key: 'download' });
      const response = await downloadDocument(document.id);

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      link.click();
      window.URL.revokeObjectURL(url);

      message.success({ content: 'Download started!', key: 'download' });
    } catch (err: any) {
      message.error({ content: 'Download failed', key: 'download' });
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileOutlined style={{ fontSize: 18 }} />;

    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FilePdfOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />;
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return <FileImageOutlined style={{ fontSize: 18, color: '#52c41a' }} />;
    }
    if (type.includes('doc') || type.includes('word')) {
      return <FileTextOutlined style={{ fontSize: 18, color: '#1890ff' }} />;
    }
    return <FileOutlined style={{ fontSize: 18 }} />;
  };

  const getFileTypeTag = (fileType: string | null) => {
    if (!fileType) return <Tag>Unknown</Tag>;

    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <Tag color="red">PDF</Tag>;
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return <Tag color="green">Image</Tag>;
    }
    if (type.includes('doc') || type.includes('word')) return <Tag color="blue">Document</Tag>;
    return <Tag>{fileType}</Tag>;
  };

  const clearFilters = () => {
    setSearchText('');
    setFileTypeFilter(undefined);
    setDateRange(null);
  };

  const columns: ColumnsType<Document> = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: (a, b) => a.fileName.localeCompare(b.fileName),
      render: (fileName, record) => (
        <Space size={12}>
          {getFileIcon(record.fileType)}
          <Text strong style={{ fontSize: 14 }}>{fileName}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 120,
      render: (fileType) => getFileTypeTag(fileType),
    },
    {
      title: 'Uploaded Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => (
        <Text type="secondary">{dayjs(createdAt).format('MMM DD, YYYY HH:mm')}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                My Documents
              </Title>
              <Text type="secondary">
                View and manage your uploaded documents
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={() => navigate('/documents/upload')}
            >
              Upload Document
            </Button>
          </div>

          {/* Filters */}
          <Space size={12} wrap style={{ marginTop: 16 }}>
            <Input
              placeholder="Search documents..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="File Type"
              value={fileTypeFilter}
              onChange={setFileTypeFilter}
              style={{ width: 140 }}
              allowClear
            >
              <Select.Option value="pdf">PDF</Select.Option>
              <Select.Option value="image">Image</Select.Option>
              <Select.Option value="doc">Document</Select.Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 280 }}
            />
            {(searchText || fileTypeFilter || dateRange) && (
              <Button icon={<FilterOutlined />} onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={loadDocuments}>
              Refresh
            </Button>
          </Space>
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
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} documents`,
            style: { marginTop: 16 },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={8}>
                    <Text type="secondary">No documents found</Text>
                    <Button type="primary" icon={<UploadOutlined />} onClick={() => navigate('/documents/upload')}>
                      Upload Your First Document
                    </Button>
                  </Space>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      )}
    </div>
  );
};
