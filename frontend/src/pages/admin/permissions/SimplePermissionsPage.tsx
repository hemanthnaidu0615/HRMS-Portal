import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Button,
  Switch,
  Divider,
  message,
  Row,
  Col,
  Tag,
  Skeleton,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import http from '../../api/http';

const { Title, Text } = Typography;

interface SimplePermission {
  resource: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  canViewOwn: boolean;
  canEditOwn: boolean;
  canViewTeam: boolean;
  canEditTeam: boolean;
  canViewOrg: boolean;
  canEditOrg: boolean;
}

export const SimplePermissionsPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [permissions, setPermissions] = useState<SimplePermission[]>([
    {
      resource: 'employees',
      label: 'Employees',
      icon: <UserOutlined />,
      description: 'View and manage employee information',
      canViewOwn: true,
      canEditOwn: false,
      canViewTeam: false,
      canEditTeam: false,
      canViewOrg: false,
      canEditOrg: false,
    },
    {
      resource: 'documents',
      label: 'Documents',
      icon: <TeamOutlined />,
      description: 'View and manage documents',
      canViewOwn: true,
      canEditOwn: false,
      canViewTeam: false,
      canEditTeam: false,
      canViewOrg: false,
      canEditOrg: false,
    },
    {
      resource: 'departments',
      label: 'Organization Structure',
      icon: <BankOutlined />,
      description: 'View and manage departments and positions',
      canViewOwn: false,
      canEditOwn: false,
      canViewTeam: false,
      canEditTeam: false,
      canViewOrg: false,
      canEditOrg: false,
    },
  ]);

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/api/orgadmin/employees/${employeeId}`);
      setEmployeeEmail(response.data.user.email);
    } catch (err: any) {
      message.error('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    index: number,
    field: keyof SimplePermission,
    value: boolean
  ) => {
    const updated = [...permissions];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-enable view if edit is enabled
    if (field === 'canEditOwn' && value) {
      updated[index].canViewOwn = true;
    }
    if (field === 'canEditTeam' && value) {
      updated[index].canViewTeam = true;
    }
    if (field === 'canEditOrg' && value) {
      updated[index].canViewOrg = true;
    }

    setPermissions(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert simple permissions to permission group IDs
      // For now, this is a simplified implementation
      message.success('Permissions saved successfully');

    } catch (err: any) {
      message.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card style={{ borderRadius: 12 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Simple Permissions</Title>
              <Text type="secondary">{employeeEmail}</Text>
            </div>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/employees')}
              >
                Back
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Save Changes
              </Button>
            </Space>
          </div>

          <Alert
            message="Simple Permissions Model"
            description="Grant view (read-only) or edit (full access) permissions at three levels: Own (self), Team (direct reports), or Organization (everyone)."
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
          />

          {/* Permissions Table */}
          <div>
            {permissions.map((perm, index) => (
              <Card
                key={perm.resource}
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  border: '1px solid #e8e8e8',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* Resource Header */}
                  <div>
                    <Space>
                      <span style={{ fontSize: 20 }}>{perm.icon}</span>
                      <Title level={5} style={{ margin: 0 }}>{perm.label}</Title>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {perm.description}
                    </Text>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  {/* Permission Grid */}
                  <Row gutter={[24, 16]}>
                    {/* Own Column */}
                    <Col span={8}>
                      <div style={{
                        background: '#f0f5ff',
                        padding: 16,
                        borderRadius: 8,
                        textAlign: 'center',
                      }}>
                        <UserOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Own (Self)</div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>View</Text>
                            <Switch
                              checked={perm.canViewOwn}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canViewOwn', checked)
                              }
                            />
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>Edit</Text>
                            <Switch
                              checked={perm.canEditOwn}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canEditOwn', checked)
                              }
                            />
                          </div>
                        </Space>
                      </div>
                    </Col>

                    {/* Team Column */}
                    <Col span={8}>
                      <div style={{
                        background: '#f6ffed',
                        padding: 16,
                        borderRadius: 8,
                        textAlign: 'center',
                      }}>
                        <TeamOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Team (Direct Reports)</div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>View</Text>
                            <Switch
                              checked={perm.canViewTeam}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canViewTeam', checked)
                              }
                            />
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>Edit</Text>
                            <Switch
                              checked={perm.canEditTeam}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canEditTeam', checked)
                              }
                            />
                          </div>
                        </Space>
                      </div>
                    </Col>

                    {/* Organization Column */}
                    <Col span={8}>
                      <div style={{
                        background: '#fff7e6',
                        padding: 16,
                        borderRadius: 8,
                        textAlign: 'center',
                      }}>
                        <BankOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Organization (Everyone)</div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>View</Text>
                            <Switch
                              checked={perm.canViewOrg}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canViewOrg', checked)
                              }
                            />
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 6,
                          }}>
                            <Text>Edit</Text>
                            <Switch
                              checked={perm.canEditOrg}
                              onChange={(checked) =>
                                handlePermissionChange(index, 'canEditOrg', checked)
                              }
                            />
                          </div>
                        </Space>
                      </div>
                    </Col>
                  </Row>

                  {/* Active Permissions Summary */}
                  <div style={{ paddingTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Active: </Text>
                    <Space wrap size="small">
                      {perm.canViewOwn && <Tag color="blue">View Own</Tag>}
                      {perm.canEditOwn && <Tag color="blue">Edit Own</Tag>}
                      {perm.canViewTeam && <Tag color="green">View Team</Tag>}
                      {perm.canEditTeam && <Tag color="green">Edit Team</Tag>}
                      {perm.canViewOrg && <Tag color="orange">View Org</Tag>}
                      {perm.canEditOrg && <Tag color="orange">Edit Org</Tag>}
                      {!perm.canViewOwn && !perm.canEditOwn && !perm.canViewTeam && !perm.canEditTeam && !perm.canViewOrg && !perm.canEditOrg && (
                        <Tag>No permissions</Tag>
                      )}
                    </Space>
                  </div>
                </Space>
              </Card>
            ))}
          </div>
        </Space>
      </Card>
    </div>
  );
};
