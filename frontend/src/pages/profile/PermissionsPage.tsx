import { useEffect, useState } from 'react';
import { Card, Typography, Space, Alert, Tag, Row, Col, Empty } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getMyPermissions } from '../../api/permissionsApi';

const { Title, Text } = Typography;

export const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await getMyPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const groupPermissionsByResource = (perms: string[]) => {
    const grouped: { [key: string]: string[] } = {};

    perms.forEach(perm => {
      const parts = perm.split(':');
      const resource = parts[0] || 'other';
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    });

    return grouped;
  };

  const getPermissionColor = (permission: string) => {
    if (permission.includes(':view:')) return 'blue';
    if (permission.includes(':create:')) return 'green';
    if (permission.includes(':update:')) return 'orange';
    if (permission.includes(':delete:')) return 'red';
    if (permission.includes(':upload:')) return 'purple';
    if (permission.includes(':manage:')) return 'cyan';
    return 'default';
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text>Loading permissions...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByResource(permissions);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>
              <SafetyCertificateOutlined /> My Permissions
            </Title>
            <Text type="secondary">
              View all permissions granted to your account
            </Text>
          </div>

          {permissions.length === 0 ? (
            <Card style={{ borderRadius: 12 }}>
              <Empty
                description="No permissions assigned"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <>
              <Card
                style={{
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="auto">
                    <Title level={3} style={{ color: 'white', margin: 0 }}>
                      <CheckCircleOutlined /> {permissions.length} Permissions Active
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                      You have access to {Object.keys(groupedPermissions).length} resource types
                    </Text>
                  </Col>
                </Row>
              </Card>

              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <Card
                  key={resource}
                  title={
                    <Space>
                      <SafetyCertificateOutlined />
                      <span style={{ textTransform: 'capitalize' }}>{resource}</span>
                      <Tag color="blue">{perms.length} permissions</Tag>
                    </Space>
                  }
                  style={{ borderRadius: 12 }}
                >
                  <Space wrap size="small">
                    {perms.map((perm, index) => (
                      <Tag
                        key={index}
                        color={getPermissionColor(perm)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: '13px',
                        }}
                      >
                        {perm}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              ))}
            </>
          )}
        </Space>
      </div>
    </div>
  );
};
