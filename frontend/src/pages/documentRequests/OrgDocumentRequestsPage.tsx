import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Select, Input, Alert, Typography, Space, Tag,
  Tabs, Empty, Badge, Modal, message, Tooltip
} from 'antd';
import {
  CheckOutlined, CloseOutlined, FileTextOutlined, InboxOutlined,
  SendOutlined, BankOutlined, UserOutlined, MailOutlined
} from '@ant-design/icons';
import {
  getMyDocumentRequestsAsTarget,
  getMyDocumentRequestsAsRequester,
  getOrgDocumentRequests,
  updateDocumentRequestStatus,
  createDocumentRequest
} from '../../api/documentRequestsApi';
import { orgadminApi, Employee } from '../../api/orgadminApi';

const { Title, Text } = Typography;

interface DocumentRequest {
  id: string;
  requesterUserId: string;
  requesterEmail: string;
  requesterFirstName: string | null;
  requesterLastName: string | null;
  targetEmployeeId: string;
  targetEmployeeEmail: string;
  targetEmployeeFirstName: string | null;
  targetEmployeeLastName: string | null;
  message: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export const OrgDocumentRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('incoming');

  // Document request states for each tab
  const [incomingRequests, setIncomingRequests] = useState<DocumentRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<DocumentRequest[]>([]);
  const [orgRequests, setOrgRequests] = useState<DocumentRequest[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create request modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [requestMessage, setRequestMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadRequestsForTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadRequestsForTab = async (tab: string) => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'incoming') {
        const response = await getMyDocumentRequestsAsTarget();
        setIncomingRequests(Array.isArray(response) ? response : []);
      } else if (tab === 'outgoing') {
        const response = await getMyDocumentRequestsAsRequester();
        setOutgoingRequests(Array.isArray(response) ? response : []);
      } else if (tab === 'org') {
        const response = await getOrgDocumentRequests();
        setOrgRequests(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await orgadminApi.getEmployees();
      const employeesList = Array.isArray(data) ? data : (data.content || []);
      setEmployees(Array.isArray(employeesList) ? employeesList : []);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setEmployees([]);
    }
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
    setSelectedEmployeeId('');
    setRequestMessage('');
    setCreateError('');
  };

  const handleCreateRequest = async () => {
    if (!selectedEmployeeId || !requestMessage.trim()) {
      setCreateError('Please select an employee and enter a message');
      return;
    }

    try {
      setCreateError('');
      setCreateLoading(true);
      await createDocumentRequest(selectedEmployeeId, requestMessage.trim());
      message.success('Document request created successfully');
      setCreateModalVisible(false);
      setRequestMessage('');
      setSelectedEmployeeId('');
      // Refresh outgoing requests
      await loadRequestsForTab('outgoing');
      setActiveTab('outgoing');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      setActionLoading(requestId);
      await updateDocumentRequestStatus(requestId, status);
      message.success(`Request ${status.toLowerCase()} successfully`);
      await loadRequestsForTab(activeTab);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors: { [key: string]: string } = {
    REQUESTED: 'orange',
    COMPLETED: 'green',
    REJECTED: 'red',
  };

  const getStatusTag = (status: string) => (
    <Tag color={statusColors[status] || 'default'}>
      {status}
    </Tag>
  );

  const getNameDisplay = (firstName: string | null, lastName: string | null, email: string) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    return fullName || email;
  };

  const incomingColumns = [
    {
      title: 'From',
      dataIndex: 'requesterEmail',
      key: 'requesterEmail',
      render: (_: string, record: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {getNameDisplay(record.requesterFirstName, record.requesterLastName, record.requesterEmail)}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.requesterEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Requested', value: 'REQUESTED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: any, record: DocumentRequest) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: DocumentRequest, b: DocumentRequest) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (record: DocumentRequest) => {
        if (record.status !== 'REQUESTED') {
          return <Text type="secondary">—</Text>;
        }

        return (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              loading={actionLoading === record.id}
              disabled={actionLoading !== null}
              onClick={() => handleStatusUpdate(record.id, 'COMPLETED')}
              style={{ color: '#52c41a' }}
            >
              Complete
            </Button>
            <Button
              type="link"
              danger
              size="small"
              icon={<CloseOutlined />}
              loading={actionLoading === record.id}
              disabled={actionLoading !== null}
              onClick={() => handleStatusUpdate(record.id, 'REJECTED')}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  const outgoingColumns = [
    {
      title: 'To',
      dataIndex: 'targetEmployeeEmail',
      key: 'targetEmployeeEmail',
      render: (_: string, record: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {getNameDisplay(record.targetEmployeeFirstName, record.targetEmployeeLastName, record.targetEmployeeEmail)}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.targetEmployeeEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Requested', value: 'REQUESTED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: any, record: DocumentRequest) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: DocumentRequest, b: DocumentRequest) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Tooltip>
      ),
    },
  ];

  const orgColumns = [
    {
      title: 'Requester',
      dataIndex: 'requesterEmail',
      key: 'requesterEmail',
      render: (_: string, record: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {getNameDisplay(record.requesterFirstName, record.requesterLastName, record.requesterEmail)}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.requesterEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'targetEmployeeEmail',
      key: 'targetEmployeeEmail',
      render: (_: string, record: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {getNameDisplay(record.targetEmployeeFirstName, record.targetEmployeeLastName, record.targetEmployeeEmail)}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.targetEmployeeEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Requested', value: 'REQUESTED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: any, record: DocumentRequest) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a: DocumentRequest, b: DocumentRequest) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'incoming',
      label: (
        <span>
          <InboxOutlined /> Incoming Requests
          <Badge
            count={incomingRequests.filter(r => r.status === 'REQUESTED').length}
            style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }}
          />
        </span>
      ),
      children: (
        <div>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {incomingRequests.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">No incoming document requests</Text>
                </div>
              }
            />
          ) : (
            <Table
              columns={incomingColumns}
              dataSource={incomingRequests}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No requests found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
              }}
              scroll={{ x: 900 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'outgoing',
      label: (
        <span>
          <SendOutlined /> My Requests
          <Badge
            count={outgoingRequests.length}
            style={{ marginLeft: 8, backgroundColor: '#1890ff' }}
            showZero
          />
        </span>
      ),
      children: (
        <div>
          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {outgoingRequests.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">No outgoing requests</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button
                      type="primary"
                      icon={<MailOutlined />}
                      onClick={openCreateModal}
                    >
                      Create Your First Request
                    </Button>
                  </div>
                </div>
              }
            />
          ) : (
            <Table
              columns={outgoingColumns}
              dataSource={outgoingRequests}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No requests found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
              }}
              scroll={{ x: 900 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'org',
      label: (
        <span>
          <BankOutlined /> Organization Requests
          <Badge
            count={orgRequests.length}
            style={{ marginLeft: 8, backgroundColor: '#52c41a' }}
            showZero
          />
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Viewing based on your permissions"
            description="You're seeing requests you have permission to access (own team, department, or full organization)"
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {orgRequests.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">No organization requests available</Text>
                </div>
              }
            />
          ) : (
            <Table
              columns={orgColumns}
              dataSource={orgRequests}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No requests found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
              }}
              scroll={{ x: 1100 }}
            />
          )}
        </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Document Requests
              </Title>
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={openCreateModal}
              >
                Request Document
              </Button>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />
          </Space>
        </Card>
      </div>

      {/* Create Request Modal */}
      <Modal
        title="Request Document from Employee"
        open={createModalVisible}
        onOk={handleCreateRequest}
        onCancel={() => {
          setCreateModalVisible(false);
          setSelectedEmployeeId('');
          setRequestMessage('');
          setCreateError('');
        }}
        confirmLoading={createLoading}
        okText="Send Request"
        cancelText="Cancel"
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {createError && (
            <Alert message={createError} type="error" showIcon closable />
          )}

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Employee
            </label>
            <Select
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              options={employees.map(emp => {
                const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                const displayName = fullName || emp.email;
                return {
                  label: displayName,
                  value: emp.employeeId,
                  searchableText: `${displayName} ${emp.email}`
                };
              })}
              placeholder="Select employee"
              style={{ width: '100%' }}
              size="large"
              showSearch
              filterOption={(input, option: any) =>
                (option?.searchableText ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Message / Document Type
            </label>
            <Input.TextArea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="e.g., Please upload your ID proof, tax documents, or educational certificates"
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};
