import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Typography,
  Alert,
  Space,
  Progress,
  message,
  Form,
  Input,
  Select,
  Row,
  Col,
  List,
  Tag,
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  FileWordOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { uploadMyDocument, uploadMyDocumentForRequest } from '../../api/documentsApi';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

interface FileWithDetails extends UploadFile {
  category?: string;
  description?: string;
  documentName?: string;
}

/**
 * Upload My Document Page - Premium UI
 * Features: Drag & drop, file preview, category selection, multiple files, progress tracking
 */
export const UploadMyDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<FileWithDetails[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const getFileIcon = (fileName: string, size: number = 24) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') return <FilePdfOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) {
      return <FileImageOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return <FileWordOutlined style={{ fontSize: size, color: '#1890ff' }} />;
    }
    if (['xls', 'xlsx'].includes(ext || '')) {
      return <FileExcelOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    }
    if (['txt', 'md'].includes(ext || '')) {
      return <FileTextOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
    }
    return <FileOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setTotalCount(fileList.length);
    setUploadedCount(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        if (file.originFileObj) {
          try {
            if (requestId) {
              await uploadMyDocumentForRequest(requestId, file.originFileObj);
            } else {
              await uploadMyDocument(file.originFileObj);
            }
            setUploadedCount(i + 1);
          } catch (err: any) {
            console.error('Upload error for file:', file.name, err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed';
            throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
          }
        }
      }

      message.success(
        fileList.length === 1
          ? 'Document uploaded successfully!'
          : `${fileList.length} documents uploaded successfully!`
      );
      setSuccess(true);

      setTimeout(() => {
        navigate(requestId ? '/document-requests/me' : '/documents/me');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      message.error(err.message || err.response?.data?.error || 'Failed to upload document(s)');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (file: UploadFile) => {
    setFileList(fileList.filter(f => f.uid !== file.uid));
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: any) => setFileList(newFileList),
    beforeUpload: (file: UploadFile) => {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        message.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    multiple: true,
    showUploadList: false,
    accept: '*/*',
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction="vertical" size={8}>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <UploadOutlined /> Upload Document
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
            {requestId
              ? 'Upload a document to fulfill the request'
              : 'Upload documents to your personal collection'}
          </Text>
        </Space>
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          {/* Upload Zone Card */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 24 }}
          >
            {requestId && (
              <Alert
                message="Document Request"
                description="This upload will fulfill a document request and automatically mark it as completed."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {success ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    animation: 'scaleIn 0.5s ease-out',
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: 48, color: 'white' }} />
                </div>
                <Title level={3} style={{ color: '#52c41a', marginBottom: 8 }}>
                  Upload Successful!
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {fileList.length === 1
                    ? 'Your document has been uploaded successfully'
                    : `${fileList.length} documents uploaded successfully`}
                </Text>
                <div style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate(requestId ? '/document-requests/me' : '/documents/me')}
                  >
                    View Documents
                  </Button>
                </div>
              </div>
            ) : (
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* Drag & Drop Upload Zone */}
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 64, color: '#667eea' }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                    Click or drag files to this area to upload
                  </p>
                  <p className="ant-upload-hint" style={{ fontSize: 14 }}>
                    Support for single or multiple file upload. Maximum file size: 10MB per file.
                    <br />
                    All file types are supported (PDF, DOC, XLS, images, etc.)
                  </p>
                </Dragger>

                {/* File Preview List */}
                {fileList.length > 0 && (
                  <Card
                    title={
                      <Space>
                        <FileTextOutlined />
                        <Text strong>Selected Files ({fileList.length})</Text>
                      </Space>
                    }
                    size="small"
                    style={{ borderRadius: 8 }}
                  >
                    <List
                      dataSource={fileList}
                      renderItem={(file) => (
                        <List.Item
                          actions={[
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveFile(file)}
                              disabled={uploading}
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={getFileIcon(file.name, 32)}
                            title={
                              <Text strong style={{ fontSize: 14 }}>
                                {file.name}
                              </Text>
                            }
                            description={
                              <Space size={8}>
                                {file.size && <Text type="secondary">{formatFileSize(file.size)}</Text>}
                                <Tag color="blue">{file.name.split('.').pop()?.toUpperCase()}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Text strong>Uploading...</Text>
                        <Text type="secondary">
                          {uploadedCount} / {totalCount} files
                        </Text>
                      </Row>
                      <Progress
                        percent={Math.round((uploadedCount / totalCount) * 100)}
                        status="active"
                        strokeColor={{
                          '0%': '#667eea',
                          '100%': '#764ba2',
                        }}
                      />
                    </Space>
                  </Card>
                )}
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {/* Document Details Form */}
          {!success && (
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                marginBottom: 24,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Title level={4} style={{ marginBottom: 24 }}>
                <FileTextOutlined /> Document Details
              </Title>

              <Form form={form} layout="vertical" initialValues={{ category: 'Other' }}>
                <Form.Item
                  label="Document Name"
                  name="documentName"
                  tooltip="Give your document a memorable name"
                >
                  <Input
                    placeholder="e.g., My Resume 2024"
                    prefix={<FileTextOutlined />}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                  tooltip="Categorize your document for easy organization"
                >
                  <Select
                    placeholder="Select document category"
                    size="large"
                    options={[
                      { value: 'ID Proof', label: 'ID Proof' },
                      { value: 'Educational', label: 'Educational' },
                      { value: 'Experience', label: 'Experience' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Description"
                  name="description"
                  tooltip="Add notes or description about this document"
                >
                  <TextArea
                    placeholder="Add any notes or description..."
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Form>

              <Alert
                message="Privacy Notice"
                description="Your documents are stored securely and are only visible to authorized personnel."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              {/* Action Buttons */}
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  size="large"
                  onClick={() => navigate(requestId ? '/document-requests/me' : '/documents/me')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={fileList.length === 0}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  {uploading ? 'Uploading...' : `Upload ${fileList.length > 0 ? `(${fileList.length})` : ''}`}
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
