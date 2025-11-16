import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Select, Button, Tag, Spin, Row, Col, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';
import {
  getEmployeePermissions,
  updateEmployeePermissionGroups,
  getAllPermissionGroups,
  EmployeePermissionOverviewResponse,
  PermissionGroupResponse,
} from '../../api/employeePermissionsApi';

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
    <div className="p-6" style={{ background: '#dde4eb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} lg={18} xl={14}>
          <Card
            className="shadow-md"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#0a0d54', margin: 0 }}>
                Manage Employee Permissions
              </h2>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}`)}
              >
                Back
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0a0d54' }}>
                    Employee
                  </label>
                  <div className="text-lg font-semibold">{overview?.email}</div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0a0d54' }}>
                    Assigned Permission Groups
                  </label>
                  <Select
                    mode="multiple"
                    value={selectedGroupIds}
                    options={groupOptions}
                    onChange={(value) => setSelectedGroupIds(value)}
                    placeholder="Select permission groups"
                    size="large"
                    className="w-full"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0a0d54' }}>
                    Effective Permissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {overview?.effectivePermissions && overview.effectivePermissions.length > 0 ? (
                      overview.effectivePermissions.map((perm) => (
                        <Tag key={perm} color="#0a0d54">
                          {perm}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-gray-500">No permissions assigned</span>
                    )}
                  </div>
                </div>

                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    size="large"
                    style={{ background: '#0a0d54', borderColor: '#0a0d54' }}
                  >
                    Save
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => navigate(`/admin/employees/${employeeId}`)}
                    disabled={saving}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
