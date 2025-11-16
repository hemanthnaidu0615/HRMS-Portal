import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Alert, Typography, Space, Upload } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadEmployeeDocument } from '../../api/documentsApi';

const { Title, Text } = Typography;

export const UploadEmployeeDocumentPage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (info: any) => {
    if (info.file) {
      setFile(info.file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!employeeId) {
      setError('Invalid employee ID');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await uploadEmployeeDocument(employeeId, file);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/documents/employee/${employeeId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={3}>Upload Employee Document</Title>
              <Text type="secondary">Employee ID: {employeeId}</Text>
            </div>

            {success ? (
              <Alert
                message="Document Uploaded"
                description="Document uploaded successfully! Redirecting..."
                type="success"
                showIcon
              />
            ) : (
              <form onSubmit={handleSubmit}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {error && (
                    <Alert message={error} type="error" showIcon closable />
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Select File
                    </label>
                    <Upload
                      beforeUpload={(file) => {
                        setFile(file);
                        return false; // Prevent auto upload
                      }}
                      maxCount={1}
                      onRemove={() => setFile(null)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        style={{ borderRadius: 8 }}
                      >
                        Choose File
                      </Button>
                    </Upload>
                    {file && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <FileOutlined />
                        <Text>Selected: {file.name}</Text>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      disabled={loading}
                      style={{
                        background: '#0a0d54',
                        borderColor: '#0a0d54',
                        borderRadius: 8
                      }}
                    >
                      Upload
                    </Button>
                    <Button
                      onClick={() => navigate('/documents/org')}
                      style={{ borderRadius: 8 }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Space>
              </form>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
};
