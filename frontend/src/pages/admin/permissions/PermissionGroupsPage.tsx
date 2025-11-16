import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPermissionGroups, PermissionGroupResponse } from '../../../api/permissionsApi';

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

  const columns: ColumnsType<PermissionGroupResponse> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="#1890ff">{name}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '—',
    },
    {
      title: 'Permission Count',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any[]) => (
        <Tag color="#52c41a">{permissions.length} permissions</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/permissions/groups/${record.id}`)}
          style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} xl={20}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#0a0d54' }}>
              Permission Groups
            </h2>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                className="mb-4"
              />
            )}

            <Table
              columns={columns}
              dataSource={groups}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} permission groups`,
              }}
              locale={{ emptyText: 'No permission groups found' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
