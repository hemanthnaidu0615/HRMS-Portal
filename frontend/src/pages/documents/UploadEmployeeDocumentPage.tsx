import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Checkbox,
  AutoComplete,
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
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { uploadEmployeeDocument } from '../../api/documentsApi';
import { searchEmployees } from '../../api/employeeApi';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

interface Employee {
  id: string;
  name: string;
  email: string;
  departmentName?: string;
}

/**
 * Upload Employee Document Page - Premium UI
 * Features: Employee selection, drag & drop, file preview, category selection, notify checkbox
 */
export const UploadEmployeeDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId: routeEmployeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [notifyEmployee, setNotifyEmployee] = useState(true);

  useEffect(() => {
    // If employeeId is in route params, pre-select it
    if (routeEmployeeId) {
      form.setFieldsValue({ employeeId: routeEmployeeId });
      loadEmployeeDetails(routeEmployeeId);
    }
  }, [routeEmployeeId]);

  const loadEmployeeDetails = async (empId: string) => {
    try {
      // In a real app, you'd fetch employee details
      // For now, we'll just set it
      setSelectedEmployee({
        id: empId,
        name: 'Employee',
        email: '',
      });
    } catch (err) {
      console.error('Failed to load employee details');
    }
  };

  const handleSearchEmployees = async (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) {
      setEmployees([]);
      return;
    }

    try {
      const results = await searchEmployees(searchValue);
      setEmployees(results);
    } catch (err) {
      console.error('Failed to search employees');
      setEmployees([]);
    }
  };

  const handleSelectEmployee = (value: string) => {
    const employee = employees.find(emp => emp.id === value);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

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

    try {
      await form.validateFields();
    } catch {
      message.warning('Please fill in all required fields');
      return;
    }

    const values = form.getFieldsValue();
    if (!values.employeeId) {
      message.warning('Please select an employee');
      return;
    }

    setUploading(true);
    setTotalCount(fileList.length);
    setUploadedCount(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        if (file.originFileObj) {
          await uploadEmployeeDocument(values.employeeId, file.originFileObj);
          setUploadedCount(i + 1);
        }
      }

      message.success(
        fileList.length === 1
          ? 'Document uploaded successfully!'
          : `${fileList.length} documents uploaded successfully!`
      );
      setSuccess(true);

      setTimeout(() => {
        navigate('/documents/org');
      }, 2000);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to upload document(s)');
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
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction="vertical" size={8}>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <UploadOutlined /> Upload Employee Document
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
            Upload documents for your team members
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
                    ? 'Document uploaded successfully'
                    : `${fileList.length} documents uploaded successfully`}
                </Text>
                {notifyEmployee && (
                  <Alert
                    message="Employee Notified"
                    description="The employee has been notified about the uploaded document(s)."
                    type="info"
                    showIcon
                    style={{ marginTop: 24 }}
                  />
                )}
                <div style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate('/documents/org')}
                  >
                    View All Documents
                  </Button>
                </div>
              </div>
            ) : (
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* Drag & Drop Upload Zone */}
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 64, color: '#f5576c' }} />
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
                          '0%': '#f093fb',
                          '100%': '#f5576c',
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
                <FileTextOutlined /> Upload Details
              </Title>

              <Form form={form} layout="vertical" initialValues={{ category: 'Other' }}>
                <Form.Item
                  label="Select Employee"
                  name="employeeId"
                  rules={[{ required: true, message: 'Please select an employee' }]}
                  tooltip="Search and select the employee to upload documents for"
                >
                  <Select
                    showSearch
                    placeholder="Search employee by name or ID..."
                    size="large"
                    onSearch={handleSearchEmployees}
                    onChange={handleSelectEmployee}
                    filterOption={false}
                    notFoundContent={<Text type="secondary">Type to search employees</Text>}
                    disabled={!!routeEmployeeId}
                    suffixIcon={<UserOutlined />}
                  >
                    {employees.map(emp => (
                      <Select.Option key={emp.id} value={emp.id}>
                        <Space>
                          <UserOutlined />
                          <div>
                            <div>{emp.name}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {emp.email} {emp.departmentName && `• ${emp.departmentName}`}
                            </Text>
                          </div>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedEmployee && (
                  <Alert
                    message={`Uploading for: ${selectedEmployee.name}`}
                    description={selectedEmployee.email}
                    type="info"
                    showIcon
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Form.Item
                  label="Document Name"
                  name="documentName"
                  tooltip="Give the document a memorable name"
                >
                  <Input
                    placeholder="e.g., Employment Contract 2024"
                    prefix={<FileTextOutlined />}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                  tooltip="Categorize the document for easy organization"
                >
                  <Select
                    placeholder="Select document category"
                    size="large"
                    options={[
                      { value: 'ID Proof', label: 'ID Proof' },
                      { value: 'Educational', label: 'Educational' },
                      { value: 'Experience', label: 'Experience' },
                      { value: 'Contract', label: 'Contract' },
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
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Checkbox
                    checked={notifyEmployee}
                    onChange={(e) => setNotifyEmployee(e.target.checked)}
                  >
                    <Space>
                      <BellOutlined />
                      <Text>Notify employee via email</Text>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Form>

              <Alert
                message="Permission Required"
                description="You can only upload documents for employees within your authorization scope."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              {/* Action Buttons */}
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  size="large"
                  onClick={() => navigate('/documents/org')}
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
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
