import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Alert,
  Typography,
  Space,
  message,
  Row,
  Col,
  Empty,
  Breadcrumb,
  Dropdown,
  Tag,
  Statistic,
  Input,
  Select,
  Modal,
  Tooltip,
} from 'antd';
import {
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  getOrganizationDocuments,
  downloadDocument,
  deleteDocument,
  approveDocument,
} from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { useAuth } from '../../auth/useAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  createdAt: string;
  approvalStatus?: string;
  category?: string;
  department?: string;
  fileSize?: number;
}

/**
 * Organization Documents Page - Premium UI
 * Features: Folder structure, card grid, department filters, admin controls
 */
export const OrgDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes('orgadmin');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchText, categoryFilter, departmentFilter, statusFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const docs = await getOrganizationDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (searchText) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.employeeId.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }

    if (departmentFilter) {
      filtered = filtered.filter((doc) => doc.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((doc) => doc.approvalStatus === statusFilter);
    }

    setFilteredDocs(filtered);
  };

  const openPreview = (doc: Document) => {
    setPreviewDoc({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType || null,
      filePath: doc.filePath,
      createdAt: doc.createdAt,
    });
    setPreviewVisible(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const res = await downloadDocument(doc.id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Document downloaded successfully');
    } catch (e) {
      message.error('Failed to download document');
    }
  };

  const handleDelete = async (docId: string) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteDocument(docId);
          message.success('Document deleted successfully');
          loadDocuments();
        } catch (err: any) {
          message.error(err.response?.data?.error || 'Failed to delete document');
        }
      },
    });
  };

  const handleApprove = async (docId: string) => {
    try {
      await approveDocument(docId);
      message.success('Document approved successfully');
      loadDocuments();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to approve document');
    }
  };

  const getFileIcon = (fileType: string, size: number = 40) => {
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
    return <FileTextOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
      default:
        return <Tag icon={<ClockCircleOutlined />} color="default">Pending</Tag>;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getDocumentActions = (doc: Document) => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View',
        onClick: () => openPreview(doc),
      },
      {
        key: 'download',
        icon: <DownloadOutlined />,
        label: 'Download',
        onClick: () => handleDownload(doc),
      },
      ...(isAdmin && doc.approvalStatus !== 'APPROVED' ? [{
        key: 'approve',
        icon: <CheckCircleOutlined />,
        label: 'Approve',
        onClick: () => handleApprove(doc.id),
      }] : []),
      ...(isAdmin ? [{
        type: 'divider' as const,
      }, {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDelete(doc.id),
      }] : []),
    ],
  });

  // Calculate stats
  const totalDocs = documents.length;
  const pendingDocs = documents.filter(d => d.approvalStatus === 'PENDING' || !d.approvalStatus).length;
  const approvedDocs = documents.filter(d => d.approvalStatus === 'APPROVED').length;
  const totalStorage = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

  // Get unique departments
  const departments = Array.from(new Set(documents.map(d => d.department).filter(Boolean)));

  return (
    <div style={{ padding: 0 }}>
      {/* Header Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={8}>
              <Breadcrumb
                items={[
                  { title: <HomeOutlined style={{ color: 'rgba(255,255,255,0.8)' }} /> },
                  { title: <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Organization</Text> },
                  { title: <Text style={{ color: 'white' }}>Documents</Text> },
                ]}
                style={{ marginBottom: 8 }}
              />
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                <FolderOutlined /> Organization Documents
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
                Manage and access organization-wide documents
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {isAdmin && (
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => navigate('/documents/upload')}
                  style={{
                    background: 'white',
                    color: '#4facfe',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  Upload Document
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Documents</Text>}
              value={totalDocs}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Pending Approval</Text>}
              value={pendingDocs}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Approved</Text>}
              value={approvedDocs}
              valueStyle={{ color: '#fff', fontWeight: 600 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Storage Used</Text>}
              value={formatFileSize(totalStorage)}
              valueStyle={{ color: '#fff', fontWeight: 600, fontSize: 20 }}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }} bodyStyle={{ padding: 24 }}>
        {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />}

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={18}>
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
                <Select.Option value="Contract">Contract</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
              <Select
                placeholder="Department"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                style={{ width: 140 }}
                allowClear
              >
                {departments.map(dept => (
                  <Select.Option key={dept} value={dept}>{dept}</Select.Option>
                ))}
              </Select>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                allowClear
              >
                <Select.Option value="PENDING">Pending</Select.Option>
                <Select.Option value="APPROVED">Approved</Select.Option>
              </Select>
              {(searchText || categoryFilter || departmentFilter || statusFilter) && (
                <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setCategoryFilter(undefined); setDepartmentFilter(undefined); setStatusFilter(undefined); }}>
                  Clear
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Document Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Text type="secondary">Loading documents...</Text>
          </div>
        ) : filteredDocs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={8}>
                <Text type="secondary" style={{ fontSize: 16 }}>No documents found</Text>
                {isAdmin && (
                  <Button type="primary" icon={<UploadOutlined />} onClick={() => navigate('/documents/upload')} size="large">
                    Upload Document
                  </Button>
                )}
              </Space>
            }
            style={{ padding: '60px 0' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredDocs.map((doc) => (
              <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: 16 }}
                >
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
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    {getStatusBadge(doc.approvalStatus)}
                  </div>
                  <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <TeamOutlined /> {doc.employeeId}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> {dayjs(doc.createdAt).fromNow()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Size: {formatFileSize(doc.fileSize)}
                    </Text>
                  </Space>
                  <Dropdown menu={getDocumentActions(doc)} trigger={['click']}>
                    <Button block icon={<MoreOutlined />}>
                      Actions
                    </Button>
                  </Dropdown>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      )}
    </div>
  );
};
