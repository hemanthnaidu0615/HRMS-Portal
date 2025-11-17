import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Tooltip, Modal, Input, Upload, message, Tag, Popconfirm } from 'antd';
import {
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  getOrganizationDocuments,
  downloadDocument,
  approveDocument,
  rejectDocument,
  deleteDocument,
  replaceDocument,
} from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { useAuth } from '../../auth/useAuth';

const { Title } = Typography;
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; fileName: string; fileType: string | null; filePath: string; createdAt: string } | null>(null);
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
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getOrganizationDocuments();
      setDocuments(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (doc: Document) => {
    setPreviewDoc({ id: doc.id, fileName: doc.fileName, fileType: doc.fileType || null, filePath: doc.filePath, createdAt: doc.createdAt });
    setPreviewVisible(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const res = await downloadDocument(doc.id);
      const contentType = (res as any)?.headers?.['content-type'] || (res as any)?.headers?.get?.('content-type') || undefined;
      const blob = new Blob([res.data], contentType ? { type: contentType } : undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error('Failed to download document');
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      setActionLoading(docId);
      await approveDocument(docId);
      message.success('Document approved successfully');
      await loadDocuments();
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
      await loadDocuments();
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
      await loadDocuments();
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
      await loadDocuments();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to replace document');
    } finally {
      setActionLoading(null);
    }
  };

  const getApprovalStatusTag = (status?: string, reason?: string) => {
    if (!status) return <Tag color="default">Pending</Tag>;
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
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      sorter: (a: Document, b: Document) => a.employeeId.localeCompare(b.employeeId),
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: (a: Document, b: Document) => a.fileName.localeCompare(b.fileName),
      render: (text: string) => (
        <Space>
          <FileOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'File Type',
      dataIndex: 'fileType',
      key: 'fileType',
    },
    {
      title: 'Approval Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status: string, record: Document) => getApprovalStatusTag(status, record.rejectionReason),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Document, b: Document) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 400,
      render: (record: Document) => (
        <Space size={4} wrap>
          <Tooltip title="View">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(record)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
          </Tooltip>

          {roles.includes('orgadmin') && (
            <>
              {record.approvalStatus !== 'APPROVED' && (
                <Tooltip title="Approve">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(record.id)}
                    loading={actionLoading === record.id}
                    style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 6 }}
                  >
                    Approve
                  </Button>
                </Tooltip>
              )}

              {record.approvalStatus !== 'APPROVED' && (
                <Tooltip title="Reject">
                  <Button
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => openRejectModal(record.id)}
                    loading={actionLoading === record.id}
                    style={{ borderRadius: 6 }}
                  >
                    Reject
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Replace">
                <Button
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => openReplaceModal(record.id)}
                  style={{ borderRadius: 6 }}
                >
                  Replace
                </Button>
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
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={actionLoading === record.id}
                    style={{ borderRadius: 6 }}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
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
              <Title level={3} style={{ margin: 0 }}>Organization Documents</Title>
              {roles.includes('orgadmin') && (
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => navigate('/documents/upload')}
                >
                  Upload Document
                </Button>
              )}
            </div>

            {error && (
              <Alert message={error} type="error" showIcon closable />
            )}

            <Table
              columns={columns}
              dataSource={documents}
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
        </Space>
      </Modal>
    </div>
  );
};
