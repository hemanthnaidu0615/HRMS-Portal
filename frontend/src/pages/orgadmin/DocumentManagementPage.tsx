import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Upload, Space, Typography, Tag, message, Tabs, Progress
} from 'antd';
import {
  FileTextOutlined, PlusOutlined, UploadOutlined, SendOutlined,
  EyeOutlined, DownloadOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Document {
  id: string;
  documentName: string;
  documentType: string;
  status: string;
  employee: { firstName: string; lastName: string; email: string };
  sentAt: string;
  signedAt?: string;
  viewedAt?: string;
}

export const DocumentManagementPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get organization documents
      // const response = await axios.get('/api/orgadmin/documents', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      // });
      // setDocuments(response.data || []);
      setDocuments([]);
    } catch (err) {
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDocument = async (values: any) => {
    try {
      // TODO: Implement send document API
      message.success('Document sent successfully!');
      setShowSendModal(false);
      form.resetFields();
      loadDocuments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to send document');
    }
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'default',
      SENT: 'processing',
      VIEWED: 'warning',
      SIGNED: 'success',
      COMPLETED: 'success',
      DECLINED: 'error',
      EXPIRED: 'default',
    };
    return <Tag color={colors[status] || 'default'}>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_: any, record: Document) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.employee.firstName} {record.employee.lastName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.employee.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Document',
      dataIndex: 'documentName',
      key: 'documentName',
      render: (text: string, record: Document) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.documentType}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Sent',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Viewed',
      dataIndex: 'viewedAt',
      key: 'viewedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Signed',
      dataIndex: 'signedAt',
      key: 'signedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button size="small" icon={<DownloadOutlined />}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const pendingDocs = documents.filter(d => ['SENT', 'VIEWED'].includes(d.status));
  const completedDocs = documents.filter(d => ['SIGNED', 'COMPLETED'].includes(d.status));

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2}>
                <FileTextOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                Document Management
              </Title>
              <Text type="secondary">
                Manage and track employee documents
              </Text>
            </div>
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="large"
              onClick={() => setShowSendModal(true)}
            >
              Send Document
            </Button>
          </div>

          <Tabs defaultActiveKey="all">
            <TabPane tab={`All Documents (${documents.length})`} key="all">
              <Table
                columns={columns}
                dataSource={documents}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Pending (${pendingDocs.length})`} key="pending">
              <Table
                columns={columns}
                dataSource={pendingDocs}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Completed (${completedDocs.length})`} key="completed">
              <Table
                columns={columns}
                dataSource={completedDocs}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* Send Document Modal */}
      <Modal
        title="Send Document for Signature"
        open={showSendModal}
        onCancel={() => {
          setShowSendModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSendDocument}>
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select placeholder="Select employee" showSearch>
              {/* TODO: Load employees from API */}
              <Option value="1">John Doe</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="documentType"
            label="Document Type"
            rules={[{ required: true, message: 'Please select document type' }]}
          >
            <Select placeholder="Select document type">
              <Option value="OFFER_LETTER">Offer Letter</Option>
              <Option value="EMPLOYMENT_CONTRACT">Employment Contract</Option>
              <Option value="NDA">Non-Disclosure Agreement</Option>
              <Option value="EMPLOYEE_HANDBOOK">Employee Handbook</Option>
              <Option value="CODE_OF_CONDUCT">Code of Conduct</Option>
              <Option value="TAX_FORM">Tax Form</Option>
              <Option value="CUSTOM">Custom Document</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="documentName"
            label="Document Name"
            rules={[{ required: true, message: 'Please enter document name' }]}
          >
            <Input placeholder="e.g., Employment Contract 2024" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Brief description of the document..."
            />
          </Form.Item>

          <Form.Item
            name="file"
            label="Upload Document"
            rules={[{ required: true, message: 'Please upload a document' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File (PDF)</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="expiryDays" label="Expires In (Days)" initialValue={30}>
            <Select>
              <Option value={7}>7 days</Option>
              <Option value={14}>14 days</Option>
              <Option value={30}>30 days</Option>
              <Option value={60}>60 days</Option>
              <Option value={90}>90 days</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <Button onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Send Document
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
