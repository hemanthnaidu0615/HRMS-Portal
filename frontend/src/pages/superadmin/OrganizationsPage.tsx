import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Card, Space, Typography, message, Alert, Empty, Tooltip,
  Popconfirm, Tag, Statistic, Row, Col, Badge, Spin
} from 'antd';
import {
  BankOutlined, PlusOutlined, UserAddOutlined, ReloadOutlined, DeleteOutlined,
  UndoOutlined, TeamOutlined, UserOutlined, FileOutlined, ApartmentOutlined,
  AppstoreOutlined, MailOutlined, PhoneOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CrownOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { superadminApi, OrgAdmin } from '../../api/superadminApi';

const { Title, Text } = Typography;

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  deletedAt?: string | null;
  employeeCount?: number;
  departmentCount?: number;
  activeUserCount?: number;
  documentCount?: number;
  orgAdminCount?: number;
}

export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [orgAdminsCache, setOrgAdminsCache] = useState<Record<string, OrgAdmin[]>>({});
  const [loadingOrgAdmins, setLoadingOrgAdmins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await superadminApi.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load organizations';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    try {
      setActionLoading(orgId);
      await superadminApi.deleteOrganization(orgId);
      message.success('Organization deleted successfully');
      await loadOrganizations();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete organization');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (orgId: string) => {
    try {
      setActionLoading(orgId);
      await superadminApi.reactivateOrganization(orgId);
      message.success('Organization reactivated successfully');
      await loadOrganizations();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to reactivate organization');
    } finally {
      setActionLoading(null);
    }
  };

  const loadOrgAdmins = async (orgId: string) => {
    // Return cached data if available
    if (orgAdminsCache[orgId]) {
      return;
    }

    try {
      setLoadingOrgAdmins(prev => ({ ...prev, [orgId]: true }));
      const admins = await superadminApi.getOrgAdmins(orgId);
      setOrgAdminsCache(prev => ({ ...prev, [orgId]: admins }));
    } catch (err: any) {
      message.error(`Failed to load org admins: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingOrgAdmins(prev => ({ ...prev, [orgId]: false }));
    }
  };

  const handleExpand = async (expanded: boolean, record: Organization) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
      await loadOrgAdmins(record.id);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
    }
  };

  const expandedRowRender = (record: Organization) => {
    const admins = orgAdminsCache[record.id] || [];
    const isLoading = loadingOrgAdmins[record.id];

    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="Loading org admins..." />
        </div>
      );
    }

    if (admins.length === 0) {
      return (
        <Card style={{ margin: '12px 48px', background: '#fafafa' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={8}>
                <Text type="secondary">No org admins found for this organization</Text>
                <Button
                  type="primary"
                  size="small"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate(`/superadmin/orgadmin/${record.id}`)}
                >
                  Add First Org Admin
                </Button>
              </Space>
            }
          />
        </Card>
      );
    }

    const adminColumns: ColumnsType<OrgAdmin> = [
      {
        title: 'Name',
        key: 'name',
        render: (_, admin) => (
          <Space>
            <CrownOutlined style={{ fontSize: 16, color: '#faad14' }} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'N/A'}
              </div>
              {admin.designation && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {admin.designation}
                </Text>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (email) => (
          <Space>
            <MailOutlined style={{ color: '#1890ff' }} />
            <Text copyable>{email}</Text>
          </Space>
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        render: (phone) =>
          phone ? (
            <Space>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text>{phone}</Text>
            </Space>
          ) : (
            <Text type="secondary">-</Text>
          ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 120,
        render: (_, admin) => (
          <Space direction="vertical" size={4}>
            {admin.enabled ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Active
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Disabled
              </Tag>
            )}
            {admin.mustChangePassword && (
              <Tag color="warning" style={{ fontSize: 11 }}>
                Must Change Password
              </Tag>
            )}
          </Space>
        ),
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (date) => dayjs(date).format('MMM DD, YYYY'),
      },
    ];

    return (
      <Card
        style={{ margin: '12px 48px', background: '#fafafa' }}
        title={
          <Space>
            <CrownOutlined style={{ color: '#faad14' }} />
            <Text strong>Organization Admins ({admins.length})</Text>
          </Space>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => navigate(`/superadmin/orgadmin/${record.id}`)}
          >
            Add Admin
          </Button>
        }
      >
        <Table
          columns={adminColumns}
          dataSource={admins}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  // Calculate totals
  const activeOrgs = organizations.filter(org => !org.deletedAt);
  const totalEmployees = activeOrgs.reduce((sum, org) => sum + (org.employeeCount || 0), 0);
  const totalDepartments = activeOrgs.reduce((sum, org) => sum + (org.departmentCount || 0), 0);
  const totalActiveUsers = activeOrgs.reduce((sum, org) => sum + (org.activeUserCount || 0), 0);
  const totalDocuments = activeOrgs.reduce((sum, org) => sum + (org.documentCount || 0), 0);

  const columns: ColumnsType<Organization> = [
    {
      title: 'Organization',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <BankOutlined style={{ fontSize: 18, color: record.deletedAt ? '#ff4d4f' : '#0a0d54' }} />
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: 15,
              textDecoration: record.deletedAt ? 'line-through' : 'none',
              color: record.deletedAt ? '#999' : '#000'
            }}>
              {name}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Created {dayjs(record.createdAt).format('MMM DD, YYYY')}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Employees',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 120,
      align: 'center' as const,
      sorter: (a, b) => (a.employeeCount || 0) - (b.employeeCount || 0),
      render: (count: number) => (
        <Statistic
          value={count || 0}
          valueStyle={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}
          prefix={<TeamOutlined />}
        />
      ),
    },
    {
      title: 'Departments',
      dataIndex: 'departmentCount',
      key: 'departmentCount',
      width: 130,
      align: 'center' as const,
      sorter: (a, b) => (a.departmentCount || 0) - (b.departmentCount || 0),
      render: (count: number) => (
        <Statistic
          value={count || 0}
          valueStyle={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}
          prefix={<ApartmentOutlined />}
        />
      ),
    },
    {
      title: 'Active Users',
      dataIndex: 'activeUserCount',
      key: 'activeUserCount',
      width: 130,
      align: 'center' as const,
      sorter: (a, b) => (a.activeUserCount || 0) - (b.activeUserCount || 0),
      render: (count: number) => (
        <Statistic
          value={count || 0}
          valueStyle={{ fontSize: 18, fontWeight: 600, color: '#722ed1' }}
          prefix={<UserOutlined />}
        />
      ),
    },
    {
      title: 'Documents',
      dataIndex: 'documentCount',
      key: 'documentCount',
      width: 130,
      align: 'center' as const,
      sorter: (a, b) => (a.documentCount || 0) - (b.documentCount || 0),
      render: (count: number) => (
        <Statistic
          value={count || 0}
          valueStyle={{ fontSize: 18, fontWeight: 600, color: '#fa8c16' }}
          prefix={<FileOutlined />}
        />
      ),
    },
    {
      title: 'Org Admins',
      dataIndex: 'orgAdminCount',
      key: 'orgAdminCount',
      width: 130,
      align: 'center' as const,
      sorter: (a, b) => (a.orgAdminCount || 0) - (b.orgAdminCount || 0),
      render: (count: number) => (
        <Badge
          count={count || 0}
          showZero
          style={{
            backgroundColor: count > 0 ? '#faad14' : '#d9d9d9',
            fontWeight: 600,
            fontSize: 14,
            padding: '4px 12px',
            height: 'auto',
          }}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) =>
        value === 'active' ? !record.deletedAt : !!record.deletedAt,
      render: (_, record) =>
        record.deletedAt ? (
          <Tag color="error">Inactive</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size={4}>
          {!record.deletedAt && (
            <>
              <Tooltip title="Manage Modules">
                <Button
                  type="default"
                  size="small"
                  icon={<AppstoreOutlined />}
                  onClick={() => navigate(`/superadmin/organizations/${record.id}/modules`)}
                  style={{ borderRadius: 6, borderColor: '#722ed1', color: '#722ed1' }}
                >
                  Modules
                </Button>
              </Tooltip>
              <Tooltip title="Add Organization Admin">
                <Button
                  type="primary"
                  size="small"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate(`/superadmin/orgadmin/${record.id}`)}
                  style={{ borderRadius: 6 }}
                >
                  Add Admin
                </Button>
              </Tooltip>
            </>
          )}

          {!record.deletedAt ? (
            <Popconfirm
              title="Delete organization"
              description="This will deactivate the organization and all its users."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={actionLoading === record.id}
                  style={{ borderRadius: 6 }}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Reactivate">
              <Button
                type="primary"
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleReactivate(record.id)}
                loading={actionLoading === record.id}
                style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 6 }}
              >
                Reactivate
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
                <BankOutlined style={{ marginRight: 12 }} />
                Organizations
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Manage all organizations in the system
              </Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadOrganizations} size="large">
                Refresh
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/superadmin/create-organization')}
              >
                Create Organization
              </Button>
            </Space>
          </div>
        </div>

        {/* System-wide Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Active Organizations"
                value={activeOrgs.length}
                prefix={<BankOutlined style={{ color: '#0a0d54' }} />}
                valueStyle={{ color: '#0a0d54', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Total Employees"
                value={totalEmployees}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Total Departments"
                value={totalDepartments}
                prefix={<ApartmentOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Active Users"
                value={totalActiveUsers}
                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Organizations Table */}
        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 16 }}
            />
          )}

          <Table
            columns={columns}
            dataSource={organizations}
            rowKey="id"
            loading={loading}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: handleExpand,
              rowExpandable: (record) => !record.deletedAt, // Only allow expansion for active orgs
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} organizations`,
            }}
            scroll={{ x: 1300 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" size={8}>
                      <Text type="secondary">No organizations found</Text>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/superadmin/create-organization')}
                      >
                        Create First Organization
                      </Button>
                    </Space>
                  }
                />
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};
