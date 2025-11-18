import { useEffect, useState } from 'react';
import { Card, Typography, Space, Alert, Tag, Row, Col, Empty, Badge, Divider, Descriptions } from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  TeamOutlined,
  ApartmentOutlined,
  BankOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getMyPermissions } from '../../api/permissionsApi';

const { Title, Text, Paragraph } = Typography;

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
    if (permission.includes(':edit:')) return 'orange';
    if (permission.includes(':delete:')) return 'red';
    if (permission.includes(':upload:')) return 'purple';
    if (permission.includes(':approve:')) return 'cyan';
    return 'default';
  };

  const getActionIcon = (action: string) => {
    if (action === 'view') return <EyeOutlined />;
    if (action === 'create') return <PlusOutlined />;
    if (action === 'edit') return <EditOutlined />;
    if (action === 'delete') return <DeleteOutlined />;
    if (action === 'upload') return <UploadOutlined />;
    return <CheckCircleOutlined />;
  };

  const getScopeIcon = (scope: string) => {
    if (scope === 'own') return <UserOutlined style={{ color: '#1890ff' }} />;
    if (scope === 'team') return <TeamOutlined style={{ color: '#52c41a' }} />;
    if (scope === 'department') return <ApartmentOutlined style={{ color: '#faad14' }} />;
    if (scope === 'organization') return <BankOutlined style={{ color: '#f5222d' }} />;
    return null;
  };

  const getScopeDescription = (scope: string) => {
    if (scope === 'own') return 'Your own data only';
    if (scope === 'team') return 'Your direct reports and their teams';
    if (scope === 'department') return 'All employees in your department';
    if (scope === 'organization') return 'All employees in the organization';
    return scope;
  };

  const getScopeBadgeColor = (scope: string) => {
    if (scope === 'own') return 'blue';
    if (scope === 'team') return 'green';
    if (scope === 'department') return 'orange';
    if (scope === 'organization') return 'red';
    return 'default';
  };

  const parsePermission = (perm: string) => {
    const parts = perm.split(':');
    return {
      resource: parts[0] || '',
      action: parts[1] || '',
      scope: parts[2] || '',
    };
  };

  const getResourceDescription = (resource: string) => {
    const descriptions: { [key: string]: string } = {
      employees: 'Employee profiles, personal data, and employment details',
      documents: 'Uploaded documents and files',
      'document-requests': 'Document request workflow',
      departments: 'Organizational departments',
      positions: 'Job positions and titles',
      vendors: 'Vendor companies and contracts',
      clients: 'Client companies',
      projects: 'Client projects',
      roles: 'System roles',
      permissions: 'Permission management',
      'audit-logs': 'System audit trail',
    };
    return descriptions[resource] || resource;
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

  // Calculate scope stats
  const scopeStats = {
    own: permissions.filter(p => p.includes(':own')).length,
    team: permissions.filter(p => p.includes(':team')).length,
    department: permissions.filter(p => p.includes(':department')).length,
    organization: permissions.filter(p => p.includes(':organization')).length,
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header Card with Gradient */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction="vertical" size={8}>
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            <SafetyCertificateOutlined /> My Permissions
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 15 }}>
            View all permissions and access levels granted to your account
          </Text>
        </Space>
      </Card>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {permissions.length === 0 ? (
            <Card style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <Empty
                description="No permissions assigned"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#111' }}>{permissions.length}</div>
                    <Text type="secondary">Total Permissions</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                    <BankOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#111' }}>{Object.keys(groupedPermissions).length}</div>
                    <Text type="secondary">Resource Types</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                    <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#111' }}>{scopeStats.team}</div>
                    <Text type="secondary">Team Scope</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                    <ApartmentOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#111' }}>{scopeStats.department}</div>
                    <Text type="secondary">Department Scope</Text>
                  </Card>
                </Col>
              </Row>

              {/* Scope Legend */}
              <Card
                title="Permission Scopes"
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Space>
                        <UserOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                        <div>
                          <Text strong>Own</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>Your own data only</Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <TeamOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                        <div>
                          <Text strong>Team</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>Your direct reports & their teams</Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <ApartmentOutlined style={{ fontSize: 18, color: '#faad14' }} />
                        <div>
                          <Text strong>Department</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>All in your department</Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space>
                        <BankOutlined style={{ fontSize: 18, color: '#f5222d' }} />
                        <div>
                          <Text strong>Organization</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>All in organization</Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Space>
              </Card>

              {/* Permissions by Resource */}
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <Card
                  key={resource}
                  title={
                    <div>
                      <Space>
                        <SafetyCertificateOutlined />
                        <span style={{ textTransform: 'capitalize', fontSize: 16, fontWeight: 600 }}>
                          {resource.replace(/-/g, ' ')}
                        </span>
                        <Badge count={perms.length} style={{ backgroundColor: '#52c41a' }} />
                      </Space>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
                          {getResourceDescription(resource)}
                        </Text>
                      </div>
                    </div>
                  }
                  style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {perms.map((perm, index) => {
                      const parsed = parsePermission(perm);
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Space>
                            {getActionIcon(parsed.action)}
                            <Text strong style={{ textTransform: 'capitalize' }}>
                              {parsed.action}
                            </Text>
                            <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                              {perm}
                            </Text>
                          </Space>
                          <Space>
                            {getScopeIcon(parsed.scope)}
                            <Tag color={getScopeBadgeColor(parsed.scope)} style={{ margin: 0 }}>
                              {parsed.scope.toUpperCase()}
                            </Tag>
                          </Space>
                        </div>
                      );
                    })}
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
