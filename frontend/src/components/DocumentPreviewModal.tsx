import React, { useState, useEffect } from 'react';
import { Modal, Spin, Alert, Button, Space, Typography, Descriptions } from 'antd';
import { DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDownloadUrl } from '../api/documentsApi';

const { Text } = Typography;

interface Document {
  id: string;
  fileName: string;
  fileType: string | null;
  filePath: string;
  uploadedByUserId?: string;
  createdAt: string;
}

interface DocumentPreviewModalProps {
  document: Document | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * Premium Document Preview Modal
 * Preview PDFs, images, and display document metadata
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible && document) {
      loadDocumentUrl();
    } else {
      setDocumentUrl(null);
      setError(null);
    }
  }, [visible, document]);

  const loadDocumentUrl = async () => {
    if (!document) return;

    try {
      setLoading(true);
      setError(null);
      const url = await getDownloadUrl(document.id);
      setDocumentUrl(url);
    } catch (err: any) {
      setError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      const link = window.document.createElement('a');
      link.href = documentUrl;
      link.download = document?.fileName || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const isPDF = document?.fileType?.toLowerCase().includes('pdf') || document?.fileName?.toLowerCase().endsWith('.pdf');
  const isImage =
    document?.fileType?.toLowerCase().includes('image') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(document?.fileName || '');

  const renderPreview = () => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
          }}
        >
          <Space direction="vertical" align="center" size={16}>
            <Spin size="large" />
            <Text type="secondary">Loading document...</Text>
          </Space>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error Loading Document"
          description={error}
          type="error"
          showIcon
        />
      );
    }

    if (!documentUrl) {
      return (
        <Alert
          message="No Document"
          description="No document URL available"
          type="warning"
          showIcon
        />
      );
    }

    // PDF Preview
    if (isPDF) {
      return (
        <div style={{ marginTop: 16 }}>
          <iframe
            src={documentUrl}
            style={{
              width: '100%',
              height: '60vh',
              border: '1px solid #e8edf2',
              borderRadius: 8,
            }}
            title={document?.fileName}
          />
        </div>
      );
    }

    // Image Preview
    if (isImage) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: 8,
            padding: 24,
            minHeight: 400,
            marginTop: 16,
          }}
        >
          <img
            src={documentUrl}
            alt={document?.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      );
    }

    // Other file types
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 64,
          background: '#fafafa',
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <Space direction="vertical" size={24}>
          <FileOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>
              Preview not available
            </div>
            <Text type="secondary">
              This file type cannot be previewed. Please download to view.
            </Text>
          </div>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Download File
          </Button>
        </Space>
      </div>
    );
  };

  if (!document) return null;

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Document Preview</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={920}
      footer={
        <Space>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!documentUrl}
            loading={loading}
          >
            Download
          </Button>
        </Space>
      }
      styles={{
        body: { padding: '16px 24px' },
      }}
    >
      {/* Document Metadata */}
      <Descriptions
        bordered
        size="small"
        column={2}
        style={{
          background: '#ffffff',
          borderRadius: 8,
        }}
      >
        <Descriptions.Item label="File Name" span={2}>
          <Text strong>{document.fileName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="File Type">
          <Text>{document.fileType || 'Unknown'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Uploaded Date">
          <Text>{dayjs(document.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
        </Descriptions.Item>
      </Descriptions>

      {/* Preview */}
      {renderPreview()}
    </Modal>
  );
};

export default DocumentPreviewModal;
