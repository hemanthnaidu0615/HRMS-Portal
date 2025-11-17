import { useEffect, useState } from 'react';
import { Card, Table, Button, Select, Input, Alert, Typography, Space, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { getOrgDocumentRequests, updateDocumentRequestStatus, createDocumentRequest } from '../../api/documentRequestsApi';
import { orgadminApi, Employee } from '../../api/orgadminApi';

const { Title } = Typography;

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
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [requestMessage, setRequestMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadRequests();
    loadEmployees();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getOrgDocumentRequests();
      setRequests(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await orgadminApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      // Keep page usable even if employees fail to load
      setCreateError(err.response?.data?.error || 'Failed to load employees for requests');
    }
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
      setRequestMessage('');
      setSelectedEmployeeId('');
      await loadRequests();
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
      await loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors: { [key: string]: string } = {
    REQUESTED: 'orange',
    COMPLETED: 'green',
    REJECTED: 'red',
  };

  const columns = [
    {
      title: 'Requester',
      dataIndex: 'requesterUserId',
      key: 'requesterUserId',
      render: (_: string, record: DocumentRequest) => {
        const fullName = `${record.requesterFirstName || ''} ${record.requesterLastName || ''}`.trim();
        return fullName || record.requesterEmail;
      },
    },
    {
      title: 'Target Employee',
      dataIndex: 'targetEmployeeId',
      key: 'targetEmployeeId',
      render: (_: string, record: DocumentRequest) => {
        const fullName = `${record.targetEmployeeFirstName || ''} ${record.targetEmployeeLastName || ''}`.trim();
        return fullName || record.targetEmployeeEmail;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'} style={{ borderRadius: 6 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: DocumentRequest, b: DocumentRequest) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: DocumentRequest) => {
        if (record.status !== 'REQUESTED') {
          return <span style={{ color: '#999' }}>-</span>;
        }

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={actionLoading === record.id}
              disabled={actionLoading !== null}
              onClick={() => handleStatusUpdate(record.id, 'COMPLETED')}
              style={{
                background: '#52c41a',
                borderColor: '#52c41a',
                borderRadius: 6
              }}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              loading={actionLoading === record.id}
              disabled={actionLoading !== null}
              onClick={() => handleStatusUpdate(record.id, 'REJECTED')}
              style={{ borderRadius: 6 }}
            >
              Reject
            </Button>
          </Space>
        );
      },
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
            <Title level={3}>Organization Document Requests</Title>

            {error && (
              <Alert message={error} type="error" showIcon closable />
            )}

            <Card
              title="Request Document from Employee"
              style={{
                background: '#f5f5f5',
                borderRadius: 8,
              }}
              bodyStyle={{ padding: 16 }}
            >
              {createError && (
                <Alert
                  message={createError}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: 16 }}
                />
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: 12,
                alignItems: 'end'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
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
                        value: emp.employeeId
                      };
                    })}
                    placeholder="Select employee"
                    style={{ width: '100%', borderRadius: 8 }}
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500
                  }}>
                    Message
                  </label>
                  <Input
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="e.g. Please upload your ID proof"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={handleCreateRequest}
                  loading={createLoading}
                  disabled={createLoading || !employees.length}
                  size="large"
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8
                  }}
                >
                  Request Document
                </Button>
              </div>
            </Card>

            <Table
              columns={columns}
              dataSource={requests}
              loading={loading}
              rowKey="id"
              locale={{ emptyText: 'No document requests yet. Create one using the form above to request documents from employees.' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
              }}
            />
          </Space>
        </Card>
      </div>
    </div>
  );
};
