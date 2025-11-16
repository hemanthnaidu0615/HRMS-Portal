import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Upload, Button, Typography, Alert, Space, Progress, message as antdMessage } from 'antd';
import { UploadOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { uploadMyDocument, uploadMyDocumentForRequest } from '../../api/documentsApi';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export const UploadMyDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      if (requestId) {
        await uploadMyDocumentForRequest(requestId, file);
        antdMessage.success('Document uploaded and request fulfilled!');
      } else {
        await uploadMyDocument(file);
        antdMessage.success('Document uploaded successfully!');
      }
      setUploadProgress(100);
      setSuccess(true);
      clearInterval(progressInterval);

      setTimeout(() => {
        navigate(requestId ? '/document-requests/me' : '/documents/me');
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      const errorMsg = err.response?.data?.error || 'Failed to upload document';
      setError(errorMsg);
      antdMessage.error(errorMsg);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          maxWidth: 600,
          margin: '0 auto',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
            <UploadOutlined /> Upload Document
          </Title>
          <Text type="secondary">
            {requestId
              ? 'Upload a document to fulfill the request'
              : 'Upload a document to your personal collection'}
          </Text>
        </div>

        {requestId && (
          <Alert
            message="Document Request"
            description="This upload will fulfill a document request and automatically mark it as completed."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {error && (
          <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#52c41a', marginBottom: 8 }}>
              Upload Successful!
            </Title>
            <Text type="secondary">Redirecting...</Text>
          </div>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Dragger
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="*/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: 48, color: '#0a0d54' }} />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for a single file upload. PDF, images, and documents are supported.</p>
            </Dragger>

            {uploading && <Progress percent={uploadProgress} status="active" />}

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate(requestId ? '/document-requests/me' : '/documents/me')} disabled={uploading}>
                Cancel
              </Button>
              <Button type="primary" icon={<UploadOutlined />} onClick={handleUpload} loading={uploading} disabled={fileList.length === 0}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
};
