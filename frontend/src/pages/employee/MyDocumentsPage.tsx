import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Space, Typography, Alert, Spin, message, Tabs, Input } from 'antd';
import {
  FileTextOutlined, EyeOutlined, EditOutlined, CloseCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined
} from '@ant-design/icons';
import { SignaturePad } from '../../components/SignaturePad';
import {
  getMyDocuments,
  signDocument,
  declineDocument,
  type DocumentToSign
} from '../../api/documentSigningApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const MyDocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentToSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentToSign | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureData: string) => {
    if (!selectedDocument) return;

    try {
      setSigning(true);
      await signDocument(selectedDocument.id, signatureData);

      message.success('Document signed successfully!');
      setShowSignModal(false);
      setSelectedDocument(null);
      loadDocuments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedDocument || !declineReason.trim()) {
      message.error('Please provide a reason for declining');
      return;
    }

    try {
      await declineDocument(selectedDocument.id, declineReason);

      message.success('Document declined');
      setShowDeclineModal(false);
      setSelectedDocument(null);
      setDeclineReason('');
      loadDocuments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to decline document');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'default', icon: <ClockCircleOutlined /> },
      SENT: { color: 'processing', icon: <ClockCircleOutlined /> },
      VIEWED: { color: 'warning', icon: <EyeOutlined /> },
      SIGNED: { color: 'success', icon: <EditOutlined /> },
      COMPLETED: { color: 'success', icon: <CheckCircleOutlined /> },
      DECLINED: { color: 'error', icon: <CloseCircleOutlined /> },
      EXPIRED: { color: 'default', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
      render: (text: string, record: DocumentToSign) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.documentType}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Sent Date',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Signed Date',
      dataIndex: 'signedAt',
      key: 'signedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Expires',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => {
        if (!date) return '-';
        const expiry = new Date(date);
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return <Text type="danger">Expired</Text>;
        if (daysLeft <= 3) return <Text type="warning">{daysLeft} days left</Text>;
        return expiry.toLocaleDateString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DocumentToSign) => (
        <Space>
          {(record.status === 'SENT' || record.status === 'VIEWED' || record.status === 'PENDING') && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedDocument(record);
                  setShowSignModal(true);
                }}
              >
                Sign
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedDocument(record);
                  setShowDeclineModal(true);
                }}
              >
                Decline
              </Button>
            </>
          )}
          {(record.status === 'SIGNED' || record.status === 'COMPLETED') && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.info('Download functionality coming soon')}
            >
              Download
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const pendingDocs = documents.filter(d => ['SENT', 'VIEWED', 'PENDING'].includes(d.status));
  const signedDocs = documents.filter(d => ['SIGNED', 'COMPLETED'].includes(d.status));

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>
              <FileTextOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              My Documents
            </Title>
            <Text type="secondary">
              View and sign your pending documents
            </Text>
          </div>

          {pendingDocs.length > 0 && (
            <Alert
              message={`You have ${pendingDocs.length} document(s) awaiting your signature`}
              type="warning"
              showIcon
              icon={<ClockCircleOutlined />}
            />
          )}

          <Tabs defaultActiveKey="all">
            <TabPane tab={`All Documents (${documents.length})`} key="all">
              <Table
                columns={columns}
                dataSource={documents}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Pending (${pendingDocs.length})`} key="pending">
              <Table
                columns={columns}
                dataSource={pendingDocs}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Signed (${signedDocs.length})`} key="signed">
              <Table
                columns={columns}
                dataSource={signedDocs}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* Sign Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Sign Document
          </Space>
        }
        open={showSignModal}
        onCancel={() => {
          setShowSignModal(false);
          setSelectedDocument(null);
        }}
        footer={null}
        width={700}
        centered
      >
        {selectedDocument && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message={`Document: ${selectedDocument.documentName}`}
              description={selectedDocument.description}
              type="info"
              showIcon
            />

            <div>
              <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>
                Please draw your signature below:
              </Text>
              {signing ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" tip="Signing document..." />
                </div>
              ) : (
                <SignaturePad onSave={handleSign} width={600} height={200} />
              )}
            </div>

            <Alert
              message="Legal Notice"
              description="By signing this document, you acknowledge that you have read and agree to its terms and conditions. Your signature will be legally binding."
              type="warning"
              showIcon
            />
          </Space>
        )}
      </Modal>

      {/* Decline Modal */}
      <Modal
        title="Decline Document"
        open={showDeclineModal}
        onOk={handleDecline}
        onCancel={() => {
          setShowDeclineModal(false);
          setSelectedDocument(null);
          setDeclineReason('');
        }}
        okText="Decline Document"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message="Are you sure you want to decline this document?"
            description="This action cannot be undone. The document sender will be notified."
            type="warning"
            showIcon
          />

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Reason for declining (required):
            </Text>
            <TextArea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please explain why you are declining this document..."
              style={{ minHeight: 100 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};
