import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Select, Button, Tag, Skeleton, Typography, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import {
  getEmployeePermissions,
  updateEmployeePermissionGroups,
  getAllPermissionGroups,
  EmployeePermissionOverviewResponse,
  PermissionGroupResponse,
} from '../../api/employeePermissionsApi';

const { Title, Text } = Typography;

export const EmployeePermissionsPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overview, setOverview] = useState<EmployeePermissionOverviewResponse | null>(null);
  const [allGroups, setAllGroups] = useState<PermissionGroupResponse[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, groupsData] = await Promise.all([
        getEmployeePermissions(employeeId!),
        getAllPermissionGroups(),
      ]);
      setOverview(permissionsData);
      setAllGroups(groupsData);
      setSelectedGroupIds(permissionsData.assignedGroups.map((g) => g.groupId));
    } catch (err: any) {
      message.error('Failed to load employee permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateEmployeePermissionGroups(employeeId!, selectedGroupIds);
      setOverview(updated);
      message.success('Permission groups updated successfully');
    } catch (err: any) {
      message.error('Failed to update permission groups');
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = allGroups.map((g) => ({
    label: g.name,
    value: g.id,
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Manage Employee Permissions</Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/employees/${employeeId}`)}
              style={{ borderRadius: 8 }}
            >
              Back
            </Button>
          </div>

          {loading ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Skeleton.Input active style={{ width: '100%' }} />
              <Skeleton.Input active style={{ width: '100%' }} />
              <Skeleton paragraph={{ rows: 3 }} active />
            </Space>
          ) : (
            <>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Employee
                </Text>
                <Title level={5} style={{ margin: 0 }}>{overview?.email}</Title>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 500
                }}>
                  Assigned Permission Groups
                </label>
                <Select
                  mode="multiple"
                  value={selectedGroupIds}
                  options={groupOptions}
                  onChange={setSelectedGroupIds}
                  placeholder="Select permission groups"
                  style={{ width: '100%', borderRadius: 8 }}
                  size="large"
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                  Effective Permissions
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {overview?.effectivePermissions && overview.effectivePermissions.length > 0 ? (
                    overview.effectivePermissions.map((perm) => (
                      <Tag
                        key={perm}
                        color="blue"
                        style={{ borderRadius: 6, padding: '4px 12px' }}
                      >
                        {perm}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">No permissions assigned</Text>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  disabled={saving}
                  style={{
                    background: '#0a0d54',
                    borderColor: '#0a0d54',
                    borderRadius: 8
                  }}
                >
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => navigate(`/admin/employees/${employeeId}`)}
                  disabled={saving}
                  style={{ borderRadius: 8 }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};
