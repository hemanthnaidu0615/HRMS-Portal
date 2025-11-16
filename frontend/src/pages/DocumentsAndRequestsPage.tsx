import { useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Button,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Card,
  DatePicker,
  Row,
  Col,
  Typography,
  Descriptions,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../auth/useAuth';
import { documentsApi } from '../api/documentsApi';
import { documentRequestsApi } from '../api/documentRequestsApi';
import { employeeManagementApi } from '../api/employeeManagementApi';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface Document {
  id: string;
  employeeId: string;
  uploadedBy: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
}

interface DocumentRequest {
  id: string;
  requesterId: string;
  targetEmployeeId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  fulfilledDocumentId?: string;
}

interface Employee {
  id: string;
  email: string;
  departmentName?: string;
  positionName?: string;
}

export const DocumentsAndRequestsPage = () => {
  const { roles, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('my-documents');

  // Documents state
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [orgDocuments, setOrgDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState<DocumentRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<DocumentRequest[]>([]);
  const [orgRequests, setOrgRequests] = useState<DocumentRequest[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Filters
  const [fileTypeFilter, setFileTypeFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');

  // Employees for dropdowns
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [form] = Form.useForm();
  const [requestForm] = Form.useForm();

  useEffect(() => {
    loadData();
    if (roles.includes('orgadmin')) {
      loadEmployees();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fileTypeFilter, dateRange, searchText, myDocuments, orgDocuments, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-documents') {
        const docs = await documentsApi.getMyDocuments();
        setMyDocuments(docs);
      } else if (activeTab === 'org-documents' && roles.includes('orgadmin')) {
        const docs = await documentsApi.getOrganizationDocuments();
        setOrgDocuments(docs);
      } else if (activeTab === 'incoming-requests') {
        const reqs = await documentRequestsApi.getRequestsForMe();
        setIncomingRequests(reqs);
      } else if (activeTab === 'outgoing-requests') {
        const reqs = await documentRequestsApi.getMyRequests();
        setOutgoingRequests(reqs);
      } else if (activeTab === 'org-requests' && roles.includes('orgadmin')) {
        const reqs = await documentRequestsApi.getOrgRequests();
        setOrgRequests(reqs);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const emps = await employeeManagementApi.getEmployees();
      setEmployees(emps);
    } catch (error) {
      console.error('Failed to load employees', error);
    }
  };

  const applyFilters = () => {
    let docs = activeTab === 'my-documents' ? myDocuments : orgDocuments;

    if (fileTypeFilter) {
      docs = docs.filter(d => d.fileType?.includes(fileTypeFilter));
    }

    if (dateRange) {
      docs = docs.filter(d => {
        const date = dayjs(d.createdAt);
        return date.isAfter(dateRange[0]) && date.isBefore(dateRange[1]);
      });
    }

    if (searchText) {
      docs = docs.filter(d => d.fileName.toLowerCase().includes(searchText.toLowerCase()));
    }

    setFilteredDocs(docs);
  };

  const handleUpload = async (values: any) => {
    try {
      const { file, employeeId } = values;
      if (employeeId) {
        await documentsApi.uploadEmployeeDocument(employeeId, file[0].originFileObj);
      } else {
        await documentsApi.uploadMyDocument(file[0].originFileObj);
      }
      message.success('Document uploaded successfully');
      setUploadModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Upload failed');
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      await documentRequestsApi.createRequest(values);
      message.success('Document request created successfully');
      setRequestModalVisible(false);
      requestForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Request creation failed');
    }
  };

  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
    setPreviewVisible(true);
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'blue',
      COMPLETED: 'green',
      REJECTED: 'red',
    };
    return <Tag color={colors[status] || 'default'}>{status}</Tag>;
  };

  const documentColumns: ColumnsType<Document> = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (type) => <Tag>{type || 'Unknown'}</Tag>,
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            Preview
          </Button>
          <Button
            type="text"
            icon={<DownloadOutlined />}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const requestColumns: ColumnsType<DocumentRequest> = [
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <div>
      <Card bordered={false}>
        <div className="mb-6">
          <Title level={2}>Documents & Requests</Title>
          <Text type="secondary">
            Manage your documents and document requests
          </Text>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} onTabClick={() => loadData()}>
          <TabPane tab="My Documents" key="my-documents">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder="Search files..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Filter by type"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={setFileTypeFilter}
                  >
                    <Select.Option value="pdf">PDF</Select.Option>
                    <Select.Option value="image">Image</Select.Option>
                    <Select.Option value="doc">Document</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={8} lg={6}>
                  <RangePicker onChange={(dates) => setDateRange(dates as any)} style={{ width: '100%' }} />
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} className="text-right">
                  {hasPermission('UPLOAD_OWN_DOCS') && (
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => setUploadModalVisible(true)}
                    >
                      Upload Document
                    </Button>
                  )}
                </Col>
              </Row>
              <Table
                columns={documentColumns}
                dataSource={filteredDocs.length > 0 ? filteredDocs : myDocuments}
                rowKey="id"
                loading={loading}
              />
            </Space>
          </TabPane>

          {roles.includes('orgadmin') && (
            <TabPane tab="Organization Documents" key="org-documents">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Search files..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Select
                      placeholder="Filter by type"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={setFileTypeFilter}
                    >
                      <Select.Option value="pdf">PDF</Select.Option>
                      <Select.Option value="image">Image</Select.Option>
                      <Select.Option value="doc">Document</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={6}>
                    <RangePicker onChange={(dates) => setDateRange(dates as any)} style={{ width: '100%' }} />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} className="text-right">
                    {hasPermission('UPLOAD_FOR_OTHERS') && (
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setUploadModalVisible(true)}
                      >
                        Upload for Employee
                      </Button>
                    )}
                  </Col>
                </Row>
                <Table
                  columns={documentColumns}
                  dataSource={filteredDocs.length > 0 ? filteredDocs : orgDocuments}
                  rowKey="id"
                  loading={loading}
                />
              </Space>
            </TabPane>
          )}

          <TabPane tab="Incoming Requests" key="incoming-requests">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Table
                columns={requestColumns}
                dataSource={incomingRequests}
                rowKey="id"
                loading={loading}
              />
            </Space>
          </TabPane>

          <TabPane tab="My Requests" key="outgoing-requests">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="text-right mb-4">
                {hasPermission('REQUEST_DOCS') && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setRequestModalVisible(true)}
                  >
                    New Request
                  </Button>
                )}
              </div>
              <Table
                columns={requestColumns}
                dataSource={outgoingRequests}
                rowKey="id"
                loading={loading}
              />
            </Space>
          </TabPane>

          {roles.includes('orgadmin') && (
            <TabPane tab="Organization Requests" key="org-requests">
              <Table
                columns={requestColumns}
                dataSource={orgRequests}
                rowKey="id"
                loading={loading}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      <Modal
        title="Upload Document"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleUpload} layout="vertical">
          {activeTab === 'org-documents' && hasPermission('UPLOAD_FOR_OTHERS') && (
            <Form.Item
              name="employeeId"
              label="Employee"
              rules={[{ required: true, message: 'Please select an employee' }]}
            >
              <Select placeholder="Select employee" showSearch filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }>
                {employees.map(emp => (
                  <Select.Option key={emp.id} value={emp.id} label={emp.email}>
                    {emp.email}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="file"
            label="File"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: 'Please select a file' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Upload
              </Button>
              <Button onClick={() => {
                setUploadModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Document Request"
        open={requestModalVisible}
        onCancel={() => {
          setRequestModalVisible(false);
          requestForm.resetFields();
        }}
        footer={null}
      >
        <Form form={requestForm} onFinish={handleCreateRequest} layout="vertical">
          <Form.Item
            name="targetEmployeeId"
            label="Request From"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select placeholder="Select employee" showSearch filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }>
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id} label={emp.email}>
                  {emp.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea rows={4} placeholder="Describe what document you need..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Request
              </Button>
              <Button onClick={() => {
                setRequestModalVisible(false);
                requestForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Document Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewDoc && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="File Name">{previewDoc.fileName}</Descriptions.Item>
            <Descriptions.Item label="Type">{previewDoc.fileType}</Descriptions.Item>
            <Descriptions.Item label="Path">{previewDoc.filePath}</Descriptions.Item>
            <Descriptions.Item label="Uploaded">
              {dayjs(previewDoc.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};
