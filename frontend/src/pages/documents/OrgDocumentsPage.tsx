import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Alert, Typography, Space, Tooltip, Modal, Input,
  Upload, message, Tag, Popconfirm, Tabs, Empty, Badge
} from 'antd';
import {
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SwapOutlined,
  FolderOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  getMyDocuments,
  getOrganizationDocuments,
  downloadDocument,
  approveDocument,
  rejectDocument,
  deleteDocument,
  replaceDocument,
} from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { useAuth } from '../../auth/useAuth';
import { exportToExcelCSV, formatDateForExport } from '../../utils/exportUtils';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  createdAt: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export const OrgDocumentsPage = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [activeTab, setActiveTab] = useState('my');

  // Document states for each tab
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [orgDocuments, setOrgDocuments] = useState<Document[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    fileName: string;
    fileType: string | null;
    filePath: string;
    createdAt: string
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Replace modal state
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [replaceDocId, setReplaceDocId] = useState<string | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocumentsForTab(activeTab);
  }, [activeTab]);

  const loadDocumentsForTab = async (tab: string) => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'my') {
        const docs = await getMyDocuments();
        setMyDocuments(Array.isArray(docs) ? docs : []);
      } else if (tab === 'org') {
        const docs = await getOrganizationDocuments();
        setOrgDocuments(Array.isArray(docs) ? docs : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDocuments = (): Document[] => {
    if (activeTab === 'my') return myDocuments;
    if (activeTab === 'org') return orgDocuments;
    return [];
  };

  const openPreview = (doc: Document) => {
    setPreviewDoc({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType || null,
      filePath: doc.filePath,
      createdAt: doc.createdAt
    });
    setPreviewVisible(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const res = await downloadDocument(doc.id);
      const contentType = (res as any)?.headers?.['content-type'] ||
                         (res as any)?.headers?.get?.('content-type') || undefined;
      const blob = new Blob([res.data], contentType ? { type: contentType } : undefined);
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

  const handleApprove = async (docId: string) => {
    try {
      setActionLoading(docId);
      await approveDocument(docId);
      message.success('Document approved successfully');
      await loadDocumentsForTab(activeTab);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to approve document');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (docId: string) => {
    setRejectDocId(docId);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectDocId || !rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(rejectDocId);
      await rejectDocument(rejectDocId, rejectionReason.trim());
      message.success('Document rejected');
      setRejectModalVisible(false);
      setRejectDocId(null);
      setRejectionReason('');
      await loadDocumentsForTab(activeTab);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to reject document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      setActionLoading(docId);
      await deleteDocument(docId);
      message.success('Document deleted successfully');
      await loadDocumentsForTab(activeTab);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete document');
    } finally {
      setActionLoading(null);
    }
  };

  const openReplaceModal = (docId: string) => {
    setReplaceDocId(docId);
    setReplaceFile(null);
    setReplaceModalVisible(true);
  };

  const handleReplace = async () => {
    if (!replaceDocId || !replaceFile) {
      message.error('Please select a file');
      return;
    }

    try {
      setActionLoading(replaceDocId);
      await replaceDocument(replaceDocId, replaceFile);
      message.success('Document replaced successfully');
      setReplaceModalVisible(false);
      setReplaceDocId(null);
      setReplaceFile(null);
      await loadDocumentsForTab(activeTab);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to replace document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportToCSV = () => {
    const documentsToExport = activeTab === 'my' ? myDocuments : orgDocuments;

    if (documentsToExport.length === 0) {
      message.warning('No documents to export');
      return;
    }

    // Define field mapping for export
    const fieldMapping: Record<string, string | ((doc: Document) => any)> = {
      'Document ID': 'id',
      'Employee ID': 'employeeId',
      'File Name': 'fileName',
      'File Type': 'fileType',
      'Uploaded At': (doc: Document) => formatDateForExport(doc.createdAt),
      'Approval Status': (doc: Document) => doc.approvalStatus || 'PENDING',
      'Approved By': (doc: Document) => doc.approvedBy || '',
      'Approved At': (doc: Document) => formatDateForExport(doc.approvedAt),
      'Rejection Reason': (doc: Document) => doc.rejectionReason || '',
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${activeTab === 'my' ? 'my' : 'organization'}-documents-${timestamp}.csv`;

    exportToExcelCSV(documentsToExport, filename, fieldMapping);
    message.success(`Exported ${documentsToExport.length} documents to CSV`);
  };

  const getApprovalStatusTag = (status?: string, reason?: string) => {
    if (!status || status === 'PENDING') return <Tag color="warning">Pending</Tag>;
    if (status === 'APPROVED') return <Tag color="success">Approved</Tag>;
    if (status === 'REJECTED') return (
      <Tooltip title={reason || 'No reason provided'}>
        <Tag color="error">Rejected</Tag>
      </Tooltip>
    );
    return <Tag color="default">{status}</Tag>;
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: (a: Document, b: Document) => a.fileName.localeCompare(b.fileName),
      render: (text: string, record: Document) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.fileType || 'Unknown type'}
            </Text>
          </div>
        </Space>
      ),
    },
    ...(activeTab !== 'my' ? [{
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 280,
      sorter: (a: Document, b: Document) => a.employeeId.localeCompare(b.employeeId),
      render: (id: string) => <Text code>{id}</Text>,
    }] : []),
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 120,
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: any, record: Document) =>
        (record.approvalStatus || 'PENDING') === value,
      render: (status: string, record: Document) =>
        getApprovalStatusTag(status, record.rejectionReason),
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: Document, b: Document) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (record: Document) => (
        <Space size={4} wrap>
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openPreview(record)}
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

          {roles.includes('orgadmin') && activeTab === 'org' && (
            <>
              {record.approvalStatus !== 'APPROVED' && (
                <Tooltip title="Approve">
                  <Button
                    type="link"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(record.id)}
                    loading={actionLoading === record.id}
                    style={{ color: '#52c41a' }}
                  >
                    Approve
                  </Button>
                </Tooltip>
              )}

              {record.approvalStatus !== 'APPROVED' && (
                <Tooltip title="Reject">
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => openRejectModal(record.id)}
                    loading={actionLoading === record.id}
                  >
                    Reject
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Replace">
                <Button
                  type="text"
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => openReplaceModal(record.id)}
                />
              </Tooltip>

              <Popconfirm
                title="Delete document"
                description="Are you sure you want to delete this document?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={actionLoading === record.id}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'my',
      label: (
        <span>
          <UserOutlined /> My Documents
          <Badge
            count={myDocuments.length}
            style={{ marginLeft: 8, backgroundColor: '#1890ff' }}
            showZero
          />
        </span>
      ),
      children: (
        <div>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {myDocuments.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">No documents uploaded yet</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => navigate('/documents/upload-mine')}
                    >
                      Upload Your First Document
                    </Button>
                  </div>
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={myDocuments}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No documents found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} documents`,
              }}
              scroll={{ x: 900 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'org',
      label: (
        <span>
          <BankOutlined /> Organization Documents
          <Badge
            count={orgDocuments.length}
            style={{ marginLeft: 8, backgroundColor: '#52c41a' }}
            showZero
          />
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Viewing based on your permissions"
            description="You're seeing documents you have permission to access (own team, department, or full organization)"
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {orgDocuments.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">No organization documents available</Text>
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={orgDocuments}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No documents found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} documents`,
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                <FolderOutlined style={{ marginRight: 8 }} />
                Documents
              </Title>
              <Space>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportToCSV}
                  disabled={
                    (activeTab === 'my' && myDocuments.length === 0) ||
                    (activeTab === 'org' && orgDocuments.length === 0)
                  }
                >
                  Export CSV
                </Button>
                <Button
                  type="default"
                  icon={<UploadOutlined />}
                  onClick={() => navigate('/documents/upload-mine')}
                >
                  Upload My Document
                </Button>
                {roles.includes('orgadmin') && (
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => navigate('/documents/upload')}
                  >
                    Upload for Employee
                  </Button>
                )}
              </Space>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />

            {previewDoc && (
              <DocumentPreviewModal
                document={previewDoc}
                visible={previewVisible}
                onClose={() => setPreviewVisible(false)}
              />
            )}
          </Space>
        </Card>
      </div>

      {/* Reject Modal */}
      <Modal
        title="Reject Document"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectDocId(null);
          setRejectionReason('');
        }}
        confirmLoading={actionLoading === rejectDocId}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Please provide a reason for rejecting this document:</Text>
          <TextArea
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </Space>
      </Modal>

      {/* Replace Modal */}
      <Modal
        title="Replace Document"
        open={replaceModalVisible}
        onOk={handleReplace}
        onCancel={() => {
          setReplaceModalVisible(false);
          setReplaceDocId(null);
          setReplaceFile(null);
        }}
        confirmLoading={actionLoading === replaceDocId}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Upload a new file to replace the existing document:</Text>
          <Upload
            beforeUpload={(file) => {
              setReplaceFile(file);
              return false;
            }}
            maxCount={1}
            onRemove={() => setReplaceFile(null)}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          {replaceFile && (
            <Text type="secondary">Selected: {replaceFile.name}</Text>
          )}
        </Space>
      </Modal>
    </div>
  );
};
