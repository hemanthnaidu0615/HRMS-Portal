import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Alert, Row, Col, Button, Tag, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPermissionGroup, PermissionGroupResponse, PermissionResponse } from '../../../api/permissionsApi';

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

  const columns: ColumnsType<PermissionResponse> = [
    {
      title: 'Permission Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="#1890ff">{code}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '—',
    },
  ];

  if (loading) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Row justify="center">
          <Col xs={24} xl={18}>
            <Card className="shadow-md">
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
        <Row justify="center">
          <Col xs={24} xl={18}>
            <Card className="shadow-md">
              <Alert
                message={error || 'Permission group not found'}
                type="error"
                showIcon
                className="mb-4"
              />
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/permissions/groups')}
              >
                Back to Groups
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center" gutter={[16, 16]}>
        <Col xs={24} xl={18}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#0a0d54', margin: 0 }}>
                {group.name}
              </h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/permissions/groups')}
              >
                Back
              </Button>
            </div>

            <div className="mb-6">
              <div className="mb-2">
                <span className="font-semibold" style={{ color: '#0a0d54' }}>Description: </span>
                {group.description || '—'}
              </div>
              <div>
                <Tag color="#52c41a">{group.permissions.length} permissions</Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={18}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
            title={
              <h3 className="text-lg font-semibold" style={{ color: '#0a0d54', margin: 0 }}>
                Permissions
              </h3>
            }
          >
            <Table
              columns={columns}
              dataSource={group.permissions}
              rowKey="code"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} permissions`,
              }}
              locale={{ emptyText: 'No permissions assigned to this group' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
