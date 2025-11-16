import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Tooltip } from 'antd';
import { FileOutlined, UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { getOrganizationDocuments, downloadDocument } from '../../api/documentsApi';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { useAuth } from '../../auth/useAuth';

const { Title } = Typography;

interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  createdAt: string;
}

export const OrgDocumentsPage = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; fileName: string; fileType: string | null; filePath: string; createdAt: string } | null>(null);

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
      // ignore
    }
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
      title: 'File Path',
      dataIndex: 'filePath',
      key: 'filePath',
      ellipsis: true,
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
      render: (record: Document) => (
        <Space size={8}>
          <Tooltip title="View">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openPreview(record)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
          </Tooltip>
          {(roles.includes('orgadmin') || roles.includes('superadmin')) && (
            <Button
              type="primary"
              size="small"
              icon={<UploadOutlined />}
              onClick={() => navigate(`/documents/employee/${record.employeeId}/upload`)}
              style={{
                background: '#0a0d54',
                borderColor: '#0a0d54',
                borderRadius: 6
              }}
            >
              Upload for Employee
            </Button>
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
            <Title level={3}>Organization Documents</Title>

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
    </div>
  );
};
