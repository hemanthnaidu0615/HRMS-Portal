import React, { useState, useEffect } from 'react';
import { Modal, Spin, Alert, Button, Space } from 'antd';
import { DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
}

/**
 * Premium Document Preview Modal
 * Preview PDFs, images, and other documents
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  documentUrl,
  documentName,
  documentType,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && documentUrl) {
      setLoading(true);
      setError(null);
      // Simulate loading - in real app, this would load the document
      setTimeout(() => setLoading(false), 500);
    }
  }, [open, documentUrl]);

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isPDF = documentType?.includes('pdf') || documentName?.endsWith('.pdf');
  const isImage =
    documentType?.includes('image') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(documentName || '');

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
            <div style={{ color: '#64748b' }}>Loading document...</div>
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
          description="No document URL provided"
          type="warning"
          showIcon
        />
      );
    }

    // PDF Preview
    if (isPDF) {
      return (
        <iframe
          src={documentUrl}
          style={{
            width: '100%',
            height: '70vh',
            border: 'none',
            borderRadius: 8,
          }}
          title={documentName}
        />
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
          }}
        >
          <img
            src={documentUrl}
            alt={documentName}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 8,
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
        }}
      >
        <Space direction="vertical" size={24}>
          <FileOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>
              Preview not available
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              This file type cannot be previewed. Please download to view.
            </div>
          </div>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Download File
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>{documentName || 'Document Preview'}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={
        <Space>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!documentUrl}
          >
            Download
          </Button>
        </Space>
      }
      styles={{
        body: { padding: 24 },
      }}
    >
      {renderPreview()}
    </Modal>
  );
};

export default DocumentPreviewModal;
