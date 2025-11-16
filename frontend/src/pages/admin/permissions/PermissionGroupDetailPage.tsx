import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, Alert, Typography, Space, Skeleton, Tag, Descriptions } from 'antd';
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { getPermissionGroup, PermissionGroupResponse, PermissionResponse } from '../../../api/permissionsApi';

const { Title } = Typography;

export const PermissionGroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<PermissionGroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await getPermissionGroup(groupId!);
      setGroup(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load permission group');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Space>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert message={error || 'Permission group not found'} type="error" showIcon />
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/permissions/groups')}
              style={{ borderRadius: 8 }}
            >
              Back to Groups
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Permission Code',
      dataIndex: 'code',
      key: 'code',
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
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>{group.name}</Title>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/permissions/groups')}
                style={{ borderRadius: 8 }}
              >
                Back
              </Button>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Description">{group.description || '—'}</Descriptions.Item>
              <Descriptions.Item label="Permission Count">
                <Tag color="green" style={{ borderRadius: 6 }}>
                  {group.permissions.length} permissions
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>

        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>Permissions</Title>
            <Table
              columns={columns}
              dataSource={group.permissions}
              rowKey="code"
              locale={{ emptyText: 'No permissions assigned to this group' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} permissions`,
              }}
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};
