import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Typography, message, Alert, Empty, Tooltip, Popconfirm, Tag } from 'antd';
import { BankOutlined, PlusOutlined, UserAddOutlined, ReloadOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { superadminApi } from '../../api/superadminApi';

const { Title, Text } = Typography;

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  deletedAt?: string | null;
}

export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const columns: ColumnsType<Organization> = [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <BankOutlined style={{ color: record.deletedAt ? '#ff4d4f' : '#0a0d54' }} />
          <Text strong style={{ textDecoration: record.deletedAt ? 'line-through' : 'none' }}>
            {name}
          </Text>
          {record.deletedAt && <Tag color="error">Deleted</Tag>}
        </Space>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
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
      render: (_, record) => (
        <Space size={4}>
          {!record.deletedAt && (
            <Tooltip title="Add Admin">
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
          )}

          {!record.deletedAt ? (
            <Popconfirm
              title="Delete organization"
              description="Are you sure you want to delete this organization?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={actionLoading === record.id}
                  style={{ borderRadius: 6 }}
                >
                  Delete
                </Button>
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
    <div style={{ padding: 0 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                <BankOutlined /> Organizations
              </Title>
              <Text type="secondary">Manage all organizations in the system</Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadOrganizations}>
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

        {error && (
          <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />
        )}

        <Table
          columns={columns}
          dataSource={organizations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} organizations`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={8}>
                    <Text type="secondary">No organizations found</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/superadmin/create-organization')}>
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
  );
};
