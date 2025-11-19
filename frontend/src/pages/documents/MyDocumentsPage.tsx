import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Typography,
  message,
  Tooltip,
  Empty,
  Row,
  Col,
  Dropdown,
  Upload,
  Statistic,
  Badge,
  Modal,
  Checkbox,
  Radio,
  DatePicker,
  Progress,
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
  DeleteOutlined,
  AppstoreOutlined,
  BarsOutlined,
  MoreOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getMyDocuments, downloadDocument, deleteDocument, uploadMyDocument } from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Document {
  id: string;
  fileName: string;
  fileType: string | null;
  filePath: string;
  uploadedByUserId: string;
  createdAt: string;
  fileSize?: number;
  category?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

type ViewMode = 'grid' | 'list';

/**
 * My Documents Page - Premium UI
 * Features: Card grid, stats, drag & drop upload, bulk actions, advanced filters
 */
export const MyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchText, categoryFilter, statusFilter, dateRange]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getMyDocuments();
      setDocuments(response);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (searchText) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

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

  const handleDelete = async (documentId: string) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteDocument(documentId);
          message.success('Document deleted successfully');
          loadDocuments();
        } catch (err: any) {
          message.error(err.response?.data?.error || 'Failed to delete document');
        }
      },
    });
  };

  const handleBulkDownload = () => {
    if (selectedDocIds.length === 0) {
      message.warning('Please select documents to download');
      return;
    }
    selectedDocIds.forEach(id => {
      const doc = documents.find(d => d.id === id);
      if (doc) handleDownload(doc);
    });
    setSelectedDocIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedDocIds.length === 0) {
      message.warning('Please select documents to delete');
      return;
    }
    Modal.confirm({
      title: 'Delete Documents',
      content: `Are you sure you want to delete ${selectedDocIds.length} document(s)? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await Promise.all(selectedDocIds.map(id => deleteDocument(id)));
          message.success('Documents deleted successfully');
          setSelectedDocIds([]);
          loadDocuments();
        } catch (err: any) {
          message.error('Failed to delete some documents');
        }
      },
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setCategoryFilter(undefined);
    setStatusFilter(undefined);
    setDateRange(null);
  };

  const getFileIcon = (fileType: string | null, size: number = 32) => {
    if (!fileType) return <FileOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;

    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FilePdfOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return <FileImageOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    }
    if (type.includes('sheet') || type.includes('xls') || type.includes('excel')) {
      return <FileExcelOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    }
    if (type.includes('doc') || type.includes('word')) {
      return <FileWordOutlined style={{ fontSize: size, color: '#1890ff' }} />;
    }
    return <FileOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
      case 'rejected':
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      default:
        return <Tag icon={<ClockCircleOutlined />} color="default">Pending</Tag>;
    }
  };

  const getCategoryBadge = (category?: string) => {
    const colors: Record<string, string> = {
      'ID Proof': 'blue',
      'Educational': 'purple',
      'Experience': 'green',
      'Other': 'default',
    };
    return <Tag color={colors[category || 'Other'] || 'default'}>{category || 'Other'}</Tag>;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getDocumentActions = (doc: Document): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View',
      onClick: () => handlePreview(doc),
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: () => handleDownload(doc),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(doc.id),
    },
  ];

  // Calculate stats
  const totalDocs = documents.length;
  const pendingDocs = documents.filter(d => d.status === 'pending' || !d.status).length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const totalStorage = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

  // Stats Cards
  const renderStatsCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Statistic
            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Documents</Text>}
            value={totalDocs}
            valueStyle={{ color: '#fff', fontWeight: 600 }}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
          }}
        >
          <Statistic
            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Pending Approval</Text>}
            value={pendingDocs}
            valueStyle={{ color: '#fff', fontWeight: 600 }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
          }}
        >
          <Statistic
            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Approved</Text>}
            value={approvedDocs}
            valueStyle={{ color: '#fff', fontWeight: 600 }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
          }}
        >
          <Statistic
            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Storage Used</Text>}
            value={formatFileSize(totalStorage)}
            valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 20 }}
            prefix={<FolderOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  // Document Card for Grid View
  const renderDocumentCard = (doc: Document) => {
    const isSelected = selectedDocIds.includes(doc.id);
    return (
      <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
        <Badge.Ribbon text={getStatusBadge(doc.status)} style={{ top: -5 }}>
          <Card
            hoverable
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: isSelected
                ? '0 4px 20px rgba(24, 144, 255, 0.3)'
                : '0 2px 8px rgba(0,0,0,0.08)',
              border: isSelected ? '2px solid #1890ff' : 'none',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: 16 }}
            onClick={() => {
              if (selectedDocIds.length > 0) {
                setSelectedDocIds(prev =>
                  prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                );
              }
            }}
          >
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <Checkbox
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedDocIds(prev =>
                    prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                  );
                }}
              />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              {getFileIcon(doc.fileType, 48)}
            </div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <Tooltip title={doc.fileName}>
                <Text strong style={{ fontSize: 14 }}>
                  {doc.fileName.length > 20 ? `${doc.fileName.substring(0, 20)}...` : doc.fileName}
                </Text>
              </Tooltip>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              {getCategoryBadge(doc.category)}
            </div>
            <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {dayjs(doc.createdAt).fromNow()}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Size: {formatFileSize(doc.fileSize)}
              </Text>
            </Space>
            <Dropdown menu={{ items: getDocumentActions(doc) }} trigger={['click']}>
              <Button
                block
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                Actions
              </Button>
            </Dropdown>
          </Card>
        </Badge.Ribbon>
      </Col>
    );
  };

  // Document List Item for List View
  const renderDocumentListItem = (doc: Document) => {
    const isSelected = selectedDocIds.includes(doc.id);
    return (
      <Card
        key={doc.id}
        bordered={false}
        style={{
          marginBottom: 12,
          borderRadius: 12,
          boxShadow: isSelected
            ? '0 4px 20px rgba(24, 144, 255, 0.3)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          border: isSelected ? '2px solid #1890ff' : 'none',
          transition: 'all 0.3s ease',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="none">
            <Checkbox
              checked={isSelected}
              onChange={() => {
                setSelectedDocIds(prev =>
                  prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                );
              }}
            />
          </Col>
          <Col flex="none">
            {getFileIcon(doc.fileType, 32)}
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={2}>
              <Text strong style={{ fontSize: 14 }}>{doc.fileName}</Text>
              <Space size={8}>
                {getCategoryBadge(doc.category)}
                {getStatusBadge(doc.status)}
              </Space>
            </Space>
          </Col>
          <Col flex="none">
            <Space direction="vertical" size={2} align="end">
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(doc.createdAt).fromNow()}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatFileSize(doc.fileSize)}
              </Text>
            </Space>
          </Col>
          <Col flex="none">
            <Dropdown menu={{ items: getDocumentActions(doc) }} trigger={['click']}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Col>
        </Row>
      </Card>
    );
  };

  // Drag & Drop Upload Zone
  const uploadProps = {
    name: 'file',
    multiple: true,
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        await uploadMyDocument(formData);
        onSuccess?.(null, file);
        message.success(`${file.name} uploaded successfully`);
        loadDocuments();
      } catch (err: any) {
        onError?.(err);
        message.error(`${file.name} upload failed`);
      }
    },
    showUploadList: false,
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={8}>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                <FileTextOutlined /> My Documents
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
                Manage your documents with ease
              </Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={() => navigate('/documents/upload')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Upload Document
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Main Content Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {/* Filters and Actions Bar */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Space size={12} wrap>
              <Input
                placeholder="Search documents..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 240 }}
                allowClear
              />
              <Select
                placeholder="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 140 }}
                allowClear
              >
                <Select.Option value="ID Proof">ID Proof</Select.Option>
                <Select.Option value="Educational">Educational</Select.Option>
                <Select.Option value="Experience">Experience</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                allowClear
              >
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="approved">Approved</Select.Option>
                <Select.Option value="rejected">Rejected</Select.Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 280 }}
              />
              {(searchText || categoryFilter || statusFilter || dateRange) && (
                <Button icon={<FilterOutlined />} onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </Space>
          </Col>
          <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
            <Space size={12}>
              {selectedDocIds.length > 0 && (
                <>
                  <Text type="secondary">{selectedDocIds.length} selected</Text>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleBulkDownload}
                  >
                    Download
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="grid">
                  <AppstoreOutlined />
                </Radio.Button>
                <Radio.Button value="list">
                  <BarsOutlined />
                </Radio.Button>
              </Radio.Group>
              <Button icon={<ReloadOutlined />} onClick={loadDocuments} />
            </Space>
          </Col>
        </Row>

        {/* Drag & Drop Upload Zone */}
        <Upload.Dragger {...uploadProps} style={{ marginBottom: 24 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#667eea' }} />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint">
            Support for single or bulk upload. Maximum file size: 10MB
          </p>
        </Upload.Dragger>

        {/* Documents Display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Progress type="circle" percent={66} status="active" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={8}>
                <Text type="secondary" style={{ fontSize: 16 }}>No documents found</Text>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => navigate('/documents/upload')}
                  size="large"
                >
                  Upload Your First Document
                </Button>
              </Space>
            }
            style={{ padding: '60px 0' }}
          />
        ) : viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredDocuments.map(renderDocumentCard)}
          </Row>
        ) : (
          <div>
            {filteredDocuments.map(renderDocumentListItem)}
          </div>
        )}
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
