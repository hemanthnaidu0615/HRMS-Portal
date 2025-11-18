import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Button,
  Switch,
  message,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  getEmployeeSimplePermissions,
  updateEmployeeSimplePermissions,
  ResourcePermission,
} from '../../../api/simplePermissionsApi';

const { Title, Text } = Typography;

// Helper to get icon based on resource name
const getResourceIcon = (resource: string): React.ReactNode => {
  switch (resource) {
    case 'employees':
      return <UserOutlined style={{ color: '#1890ff' }} />;
    case 'documents':
      return <FileTextOutlined style={{ color: '#52c41a' }} />;
    case 'departments':
      return <BankOutlined style={{ color: '#fa8c16' }} />;
    default:
      return <TeamOutlined style={{ color: '#722ed1' }} />;
  }
};

export const SimplePermissionsPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [permissions, setPermissions] = useState<ResourcePermission[]>([]);

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const loadEmployee = async () => {
    if (!employeeId) {
      message.error('Employee ID is required');
      navigate('/admin/employees');
      return;
    }

    try {
      setLoading(true);
      const data = await getEmployeeSimplePermissions(employeeId);
      setEmployeeEmail(data.email);
      setEmployeeName(`${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email);
      setPermissions(data.permissions);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to load employee permissions');
      console.error('Load permissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    index: number,
    field: keyof ResourcePermission,
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
    if (!employeeId) return;

    try {
      setSaving(true);

      const request = {
        permissions: permissions.map(p => ({
          resource: p.resource,
          canViewOwn: p.canViewOwn,
          canEditOwn: p.canEditOwn,
          canViewTeam: p.canViewTeam,
          canEditTeam: p.canEditTeam,
          canViewOrg: p.canViewOrg,
          canEditOrg: p.canEditOrg,
        })),
      };

      const updatedData = await updateEmployeeSimplePermissions(employeeId, request);
      setPermissions(updatedData.permissions);
      message.success('Permissions saved successfully');

    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to save permissions');
      console.error('Save permissions error:', err);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Resource',
      dataIndex: 'label',
      key: 'resource',
      width: 200,
      render: (_: any, record: ResourcePermission) => (
        <Space>
          <span style={{ fontSize: 18 }}>{getResourceIcon(record.resource)}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{record.label}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
          Own
        </div>
      ),
      children: [
        {
          title: <Tooltip title="View own data"><EyeOutlined /></Tooltip>,
          dataIndex: 'canViewOwn',
          key: 'canViewOwn',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canViewOwn}
              onChange={(checked) => handlePermissionChange(index, 'canViewOwn', checked)}
            />
          ),
        },
        {
          title: <Tooltip title="Edit own data"><EditOutlined /></Tooltip>,
          dataIndex: 'canEditOwn',
          key: 'canEditOwn',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canEditOwn}
              onChange={(checked) => handlePermissionChange(index, 'canEditOwn', checked)}
            />
          ),
        },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <TeamOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          Team
        </div>
      ),
      children: [
        {
          title: <Tooltip title="View team data"><EyeOutlined /></Tooltip>,
          dataIndex: 'canViewTeam',
          key: 'canViewTeam',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canViewTeam}
              onChange={(checked) => handlePermissionChange(index, 'canViewTeam', checked)}
            />
          ),
        },
        {
          title: <Tooltip title="Edit team data"><EditOutlined /></Tooltip>,
          dataIndex: 'canEditTeam',
          key: 'canEditTeam',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canEditTeam}
              onChange={(checked) => handlePermissionChange(index, 'canEditTeam', checked)}
            />
          ),
        },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <BankOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
          Organization
        </div>
      ),
      children: [
        {
          title: <Tooltip title="View org data"><EyeOutlined /></Tooltip>,
          dataIndex: 'canViewOrg',
          key: 'canViewOrg',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canViewOrg}
              onChange={(checked) => handlePermissionChange(index, 'canViewOrg', checked)}
            />
          ),
        },
        {
          title: <Tooltip title="Edit org data"><EditOutlined /></Tooltip>,
          dataIndex: 'canEditOrg',
          key: 'canEditOrg',
          width: 70,
          align: 'center' as const,
          render: (_: any, record: ResourcePermission, index: number) => (
            <Switch
              size="small"
              checked={record.canEditOrg}
              onChange={(checked) => handlePermissionChange(index, 'canEditOrg', checked)}
            />
          ),
        },
      ],
    },
    {
      title: 'Active Permissions',
      key: 'summary',
      render: (_: any, record: ResourcePermission) => {
        const activeTags = [];
        if (record.canViewOwn) activeTags.push(<Tag key="vo" color="blue">View Own</Tag>);
        if (record.canEditOwn) activeTags.push(<Tag key="eo" color="blue">Edit Own</Tag>);
        if (record.canViewTeam) activeTags.push(<Tag key="vt" color="green">View Team</Tag>);
        if (record.canEditTeam) activeTags.push(<Tag key="et" color="green">Edit Team</Tag>);
        if (record.canViewOrg) activeTags.push(<Tag key="vor" color="orange">View Org</Tag>);
        if (record.canEditOrg) activeTags.push(<Tag key="eor" color="orange">Edit Org</Tag>);

        return (
          <Space wrap size="small">
            {activeTags.length > 0 ? activeTags : <Tag>No access</Tag>}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>Manage Permissions</Title>
          <Text strong style={{ fontSize: 16 }}>{employeeName}</Text>
          {employeeName !== employeeEmail && (
            <>
              <Text type="secondary" style={{ margin: '0 8px' }}>•</Text>
              <Text type="secondary">{employeeEmail}</Text>
            </>
          )}
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Control view and edit access at three levels: Own (self), Team (direct reports), Organization (all)
            </Text>
          </div>
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
          >
            Save Changes
          </Button>
        </Space>
      </div>

      {/* Permissions Table */}
      <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
        <Table
          dataSource={permissions}
          columns={columns}
          loading={loading}
          pagination={false}
          rowKey="resource"
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
};
