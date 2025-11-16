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
import { getMyDocuments, getOrganizationDocuments, uploadEmployeeDocument, uploadMyDocument, uploadMyDocumentForRequest, uploadEmployeeDocumentForRequest } from '../api/documentsApi';
import http from '../api/http';
import { createDocumentRequest, getMyDocumentRequestsAsRequester, getMyDocumentRequestsAsTarget, getOrgDocumentRequests } from '../api/documentRequestsApi';
import { getEmployees } from '../api/employeeManagementApi';
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
  requesterUserId: string;
  targetEmployeeId: string;
  message: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  fulfilledDocumentId?: string;
}

interface EmployeeOption {
  id: string;
  email: string;
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
  const [fulfillModalVisible, setFulfillModalVisible] = useState(false);
  const [fulfillRequestId, setFulfillRequestId] = useState<string | null>(null);
  const [fulfillTargetEmployeeId, setFulfillTargetEmployeeId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Document filters
  const [fileTypeFilter, setFileTypeFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');

  // Request filters (for "My Requests")
  const [reqSearchText, setReqSearchText] = useState('');
  const [reqStatus, setReqStatus] = useState<string | undefined>();
  const [reqDateRange, setReqDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Request filters (for "Requests To Me")
  const [inReqSearchText, setInReqSearchText] = useState('');
  const [inReqStatus, setInReqStatus] = useState<string | undefined>();
  const [inReqDateRange, setInReqDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Request filters (for "Team/Org Requests")
  const [orgReqSearchText, setOrgReqSearchText] = useState('');
  const [orgReqStatus, setOrgReqStatus] = useState<string | undefined>();
  const [orgReqDateRange, setOrgReqDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Employees for dropdowns
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [employeeEmailById, setEmployeeEmailById] = useState<Record<string, string>>({});
  const [userEmailById, setUserEmailById] = useState<Record<string, string>>({});

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

  // Polling on request tabs to reflect cross-user updates
  useEffect(() => {
    if (["incoming-requests", "outgoing-requests", "org-requests"].includes(activeTab)) {
      const id = setInterval(() => {
        loadData();
      }, 5000);
      return () => clearInterval(id);
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-documents') {
        const docs = await getMyDocuments();
        setMyDocuments(docs);
      } else if (activeTab === 'org-documents' && roles.includes('orgadmin')) {
        const docs = await getOrganizationDocuments();
        setOrgDocuments(docs);
      } else if (activeTab === 'incoming-requests') {
        const reqs = await getMyDocumentRequestsAsTarget();
        setIncomingRequests(reqs);
      } else if (activeTab === 'outgoing-requests') {
        const reqs = await getMyDocumentRequestsAsRequester();
        setOutgoingRequests(reqs);
      } else if (activeTab === 'org-requests' && roles.includes('orgadmin')) {
        const reqs = await getOrgDocumentRequests();
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
      const emps = await getEmployees();
      const options: EmployeeOption[] = emps.map((e: any) => ({ id: e.employeeId ?? e.id, email: e.email }));
      setEmployees(options);
      const empEmailMap: Record<string, string> = {};
      const userEmailMap: Record<string, string> = {};
      emps.forEach((e: any) => {
        if (e.employeeId) empEmailMap[e.employeeId] = e.email;
        if (e.userId) userEmailMap[e.userId] = e.email;
      });
      setEmployeeEmailById(empEmailMap);
      setUserEmailById(userEmailMap);
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

  const filteredOutgoing = (() => {
    let list = outgoingRequests;
    if (reqStatus) list = list.filter(r => r.status === reqStatus);
    if (reqDateRange) {
      list = list.filter(r => {
        const date = dayjs(r.createdAt);
        return date.isAfter(reqDateRange[0]) && date.isBefore(reqDateRange[1]);
      });
    }
    if (reqSearchText) {
      list = list.filter(r => r.message?.toLowerCase().includes(reqSearchText.toLowerCase()));
    }
    return list;
  })();

  const filteredIncoming = (() => {
    let list = incomingRequests;
    if (inReqStatus) list = list.filter(r => r.status === inReqStatus);
    if (inReqDateRange) {
      list = list.filter(r => {
        const date = dayjs(r.createdAt);
        return date.isAfter(inReqDateRange[0]) && date.isBefore(inReqDateRange[1]);
      });
    }
    if (inReqSearchText) {
      list = list.filter(r => r.message?.toLowerCase().includes(inReqSearchText.toLowerCase()));
    }
    return list;
  })();

  const filteredOrg = (() => {
    let list = orgRequests;
    if (orgReqStatus) list = list.filter(r => r.status === orgReqStatus);
    if (orgReqDateRange) {
      list = list.filter(r => {
        const date = dayjs(r.createdAt);
        return date.isAfter(orgReqDateRange[0]) && date.isBefore(orgReqDateRange[1]);
      });
    }
    if (orgReqSearchText) {
      list = list.filter(r => r.message?.toLowerCase().includes(orgReqSearchText.toLowerCase()));
    }
    return list;
  })();

  const handleUpload = async (values: any) => {
    try {
      const { file, employeeId, requestId } = values;
      if (employeeId) {
        if (requestId) {
          await uploadEmployeeDocumentForRequest(employeeId, requestId, file[0].originFileObj);
        } else {
          await uploadEmployeeDocument(employeeId, file[0].originFileObj);
        }
      } else {
        if (requestId) {
          await uploadMyDocumentForRequest(requestId, file[0].originFileObj);
        } else {
          await uploadMyDocument(file[0].originFileObj);
        }
      }
      message.success('Document uploaded successfully');
      setUploadModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Upload failed');
    }
  };

  const openUploadModal = async () => {
    try {
      // Preload request options so user can optionally fulfill while uploading
      const promises: Promise<any>[] = [];
      promises.push(getMyDocumentRequestsAsTarget().then(setIncomingRequests).catch(() => {}));
      if (roles.includes('orgadmin')) {
        promises.push(getOrgDocumentRequests().then(setOrgRequests).catch(() => {}));
      }
      await Promise.all(promises);
    } finally {
      setUploadModalVisible(true);
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      await createDocumentRequest(values.targetEmployeeId, values.message);
      message.success('Document request created successfully');
      setRequestModalVisible(false);
      requestForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Request creation failed');
    }
  };

  const [fulfillForm] = Form.useForm();
  const handleFulfillUpload = async (vals: any) => {
    if (!fulfillRequestId) return;
    try {
      const file = vals.file?.[0]?.originFileObj;
      if (!file) {
        message.error('Please select a file');
        return;
      }
      if (fulfillTargetEmployeeId) {
        await uploadEmployeeDocumentForRequest(fulfillTargetEmployeeId, fulfillRequestId, file);
      } else {
        await uploadMyDocumentForRequest(fulfillRequestId, file);
      }
      message.success('Uploaded and request marked completed');
      setFulfillModalVisible(false);
      fulfillForm.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to upload');
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      setPreviewLoading(true);
      setPreviewDoc(doc);
      setPreviewVisible(true);
      const res = await http.get(`/api/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setPreviewUrl(url);
    } catch (e: any) {
      message.error('Failed to preview document. Try download instead.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'blue',
      COMPLETED: 'green',
      REJECTED: 'red',
    };
    return <Tag color={colors[status] || 'default'}>{status}</Tag>;
  };

  const downloadDocument = async (id: string, nameHint?: string) => {
    try {
      const res = await http.get(`/api/documents/${id}/download`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nameHint || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      message.error('Failed to download document');
    }
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
          <Button type="text" icon={<DownloadOutlined />} onClick={() => downloadDocument(record.id, record.fileName)}>
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
      title: 'Requested By',
      dataIndex: 'requesterUserId',
      key: 'requesterUserId',
      render: (id: string) => {
        const meId = (() => {
          try { return JSON.parse(localStorage.getItem('user') || '{}')?.id; } catch { return undefined; }
        })();
        return <Text>{userEmailById[id] || (meId && id === meId ? 'You' : '—')}</Text>;
      },
    },
    {
      title: 'Requested From',
      dataIndex: 'targetEmployeeId',
      key: 'targetEmployeeId',
      render: (id) => <Text>{employeeEmailById[id] || '—'}</Text>,
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
    {
      title: 'Actions',
      key: 'req_actions',
      render: (_, record) => (
        <Space>
          {record.fulfilledDocumentId && (
            <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadDocument(record.fulfilledDocumentId!, 'document')}>
              Open
            </Button>
          )}
          {activeTab === 'incoming-requests' && !record.fulfilledDocumentId && record.status === 'REQUESTED' && hasPermission('UPLOAD_OWN_DOCS') && (
            <Button
              type="link"
              onClick={() => {
                setFulfillRequestId(record.id);
                setFulfillTargetEmployeeId(null);
                setFulfillModalVisible(true);
              }}
            >
              Upload
            </Button>
          )}
          {activeTab === 'org-requests' && !record.fulfilledDocumentId && record.status === 'REQUESTED' && hasPermission('UPLOAD_FOR_OTHERS') && (
            <Button
              type="link"
              onClick={() => {
                setFulfillRequestId(record.id);
                setFulfillTargetEmployeeId(record.targetEmployeeId);
                setFulfillModalVisible(true);
              }}
            >
              Upload
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card variant="borderless">
        <div className="mb-6">
          <Title level={2}>Documents & Requests</Title>
          <Text type="secondary">
            Manage your documents and document requests
          </Text>
        </div>

        <Tabs
          items={[
            {
              key: 'my-documents',
              label: 'My Documents',
              children: (
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
                      onClick={openUploadModal}
                      >
                        Upload Document
                      </Button>
                      )}
                      <Button style={{ marginLeft: 8 }} onClick={loadData}>Refresh</Button>
                    </Col>
                  </Row>
                  <Table
                    columns={documentColumns}
                    dataSource={filteredDocs.length > 0 ? filteredDocs : myDocuments}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              ),
            },
            ...(roles.includes('orgadmin') ? [
              {
                key: 'org-documents',
                label: 'Organization Documents',
                children: (
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
                        onClick={openUploadModal}
                        >
                          Upload for Employee
                        </Button>
                        )}
                        <Button style={{ marginLeft: 8 }} onClick={loadData}>Refresh</Button>
                      </Col>
                    </Row>
                    <Table
                      columns={documentColumns}
                      dataSource={filteredDocs.length > 0 ? filteredDocs : orgDocuments}
                      rowKey="id"
                      loading={loading}
                    />
                  </Space>
                ),
              },
            ] : []),
            {
              key: 'incoming-requests',
              label: 'Requests To Me',
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Input
                        placeholder="Search by message..."
                        prefix={<SearchOutlined />}
                        value={inReqSearchText}
                        onChange={(e) => setInReqSearchText(e.target.value)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder="Filter by status"
                        style={{ width: '100%' }}
                        allowClear
                        value={inReqStatus}
                        onChange={setInReqStatus}
                      >
                        <Select.Option value="REQUESTED">Requested</Select.Option>
                        <Select.Option value="COMPLETED">Completed</Select.Option>
                        <Select.Option value="REJECTED">Rejected</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <RangePicker onChange={(dates) => setInReqDateRange(dates as any)} style={{ width: '100%' }} />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} className="text-right">
                      <Button onClick={loadData}>Refresh</Button>
                    </Col>
                  </Row>
                  <Table
                    columns={requestColumns}
                    dataSource={filteredIncoming}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              ),
            },
            {
              key: 'outgoing-requests',
              label: 'My Requests',
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Input
                        placeholder="Search by message..."
                        prefix={<SearchOutlined />}
                        value={reqSearchText}
                        onChange={(e) => setReqSearchText(e.target.value)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder="Filter by status"
                        style={{ width: '100%' }}
                        allowClear
                        value={reqStatus}
                        onChange={setReqStatus}
                      >
                        <Select.Option value="REQUESTED">Requested</Select.Option>
                        <Select.Option value="COMPLETED">Completed</Select.Option>
                        <Select.Option value="REJECTED">Rejected</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <RangePicker onChange={(dates) => setReqDateRange(dates as any)} style={{ width: '100%' }} />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} className="text-right">
                      {hasPermission('REQUEST_DOCS') && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setRequestModalVisible(true)}
                        >
                          New Request
                        </Button>
                      )}
                      <Button style={{ marginLeft: 8 }} onClick={loadData}>Refresh</Button>
                    </Col>
                  </Row>
                  <Table
                    columns={requestColumns}
                    dataSource={filteredOutgoing}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              ),
            },
            ...(roles.includes('orgadmin') ? [
              {
                key: 'org-requests',
                label: 'Team/Org Requests',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                          placeholder="Search by message..."
                          prefix={<SearchOutlined />}
                          value={orgReqSearchText}
                          onChange={(e) => setOrgReqSearchText(e.target.value)}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                          placeholder="Filter by status"
                          style={{ width: '100%' }}
                          allowClear
                          value={orgReqStatus}
                          onChange={setOrgReqStatus}
                        >
                          <Select.Option value="REQUESTED">Requested</Select.Option>
                          <Select.Option value="COMPLETED">Completed</Select.Option>
                          <Select.Option value="REJECTED">Rejected</Select.Option>
                        </Select>
                      </Col>
                      <Col xs={24} sm={24} md={8} lg={8}>
                        <RangePicker onChange={(dates) => setOrgReqDateRange(dates as any)} style={{ width: '100%' }} />
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={4} className="text-right">
                        <Button onClick={loadData}>Refresh</Button>
                      </Col>
                    </Row>
                    <Table
                      columns={requestColumns}
                      dataSource={filteredOrg}
                      rowKey="id"
                      loading={loading}
                    />
                  </Space>
                ),
              },
            ] : []),
          ]}
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); loadData(); }}
        />
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
          {/* Optional: allow fulfilling a pending request directly from this modal */}
          <Form.Item
            name="requestId"
            label="Fulfill Request (optional)"
          >
            <Select
              placeholder="Select a pending request to fulfill"
              allowClear
              showSearch
              optionFilterProp="label"
              options={[
                ...incomingRequests
                  .filter(r => r.status === 'REQUESTED')
                  .map(r => ({
                    value: r.id,
                    label: `From me: ${r.message || 'No message'}`,
                  })),
                ...(roles.includes('orgadmin') ? orgRequests
                  .filter(r => r.status === 'REQUESTED')
                  .map(r => ({
                    value: r.id,
                    label: `Org: ${r.message || 'No message'}`,
                  })) : []),
              ]}
            />
          </Form.Item>
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
        title="Upload Requested Document"
        open={fulfillModalVisible}
        onCancel={() => { setFulfillModalVisible(false); fulfillForm.resetFields(); }}
        footer={null}
      >
        <Form form={fulfillForm} onFinish={handleFulfillUpload} layout="vertical">
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
              <Button onClick={() => { setFulfillModalVisible(false); fulfillForm.resetFields(); }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Document Preview"
        open={previewVisible}
        onCancel={() => { setPreviewVisible(false); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}
        footer={null}
        width={800}
      >
        {previewLoading && <Text>Loading preview…</Text>}
        {!previewLoading && previewDoc && (
          <div>
            <div className="mb-3">
              <Text strong>{previewDoc.fileName}</Text>
              <span style={{ marginLeft: 8, color: '#666' }}>{previewDoc.fileType || ''}</span>
            </div>
            {previewUrl && previewDoc.fileType?.startsWith('image/') && (
              <img src={previewUrl} alt={previewDoc.fileName} style={{ maxWidth: '100%' }} />
            )}
            {previewUrl && previewDoc.fileType === 'application/pdf' && (
              <iframe title="preview" src={previewUrl} style={{ width: '100%', height: 600, border: 0 }} />
            )}
            {!previewUrl && (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="File Name">{previewDoc.fileName}</Descriptions.Item>
                <Descriptions.Item label="Type">{previewDoc.fileType || 'Unknown'}</Descriptions.Item>
                <Descriptions.Item label="Uploaded">{dayjs(previewDoc.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
