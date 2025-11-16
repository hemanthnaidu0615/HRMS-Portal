import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Typography, message, Alert, Empty, Tooltip } from 'antd';
import { BankOutlined, PlusOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { superadminApi, Organization } from '../../api/superadminApi';

const { Title, Text } = Typography;

export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const columns: ColumnsType<Organization> = [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <Space>
          <BankOutlined style={{ color: '#0a0d54' }} />
          <Text strong>{name}</Text>
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
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<UserAddOutlined />}
          onClick={() => navigate(`/superadmin/orgadmin/${record.id}`)}
        >
          Add Admin
        </Button>
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
