import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag } from 'antd';
import { EyeOutlined, SafetyOutlined } from '@ant-design/icons';
import { getPermissionGroups, PermissionGroupResponse } from '../../../api/permissionsApi';

const { Title } = Typography;

export const PermissionGroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PermissionGroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getPermissionGroups();
      setGroups(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load permission groups');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: PermissionGroupResponse, b: PermissionGroupResponse) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Space>
          <SafetyOutlined />
          <Tag color="blue" style={{ borderRadius: 6 }}>{text}</Tag>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '—',
    },
    {
      title: 'Permission Count',
      key: 'permissionCount',
      render: (record: PermissionGroupResponse) => (
        <Tag color="green" style={{ borderRadius: 6 }}>
          {record.permissions.length} permissions
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: PermissionGroupResponse) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/permissions/groups/${record.id}`)}
          style={{
            background: '#0a0d54',
            borderColor: '#0a0d54',
            borderRadius: 6
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>Permission Groups</Title>

          {error && (
            <Alert message={error} type="error" showIcon closable />
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table
              columns={columns}
              dataSource={groups}
              rowKey="id"
              locale={{ emptyText: 'No permission groups found' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} groups`,
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
