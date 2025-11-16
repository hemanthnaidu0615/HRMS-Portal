import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space } from 'antd';
import { FileOutlined, UploadOutlined } from '@ant-design/icons';
import { getOrganizationDocuments } from '../../api/documentsApi';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getOrganizationDocuments();
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
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
          </Space>
        </Card>
      </div>
    </div>
  );
};
