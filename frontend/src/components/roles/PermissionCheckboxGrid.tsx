import { Checkbox, Card, Typography, Row, Col, Space } from 'antd';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

export interface Permission {
  id: string;
  code: string;
  description?: string;
}

interface PermissionCheckboxGridProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  onChange: (selectedIds: string[]) => void;
}

interface GroupedPermissions {
  [resource: string]: {
    [action: string]: Permission[];
  };
}

/**
 * Permission Checkbox Grid Component
 * Displays permissions grouped by resource, with checkboxes for each action:scope combination
 */
export const PermissionCheckboxGrid: React.FC<PermissionCheckboxGridProps> = ({
  permissions,
  selectedPermissionIds,
  onChange,
}) => {
  const [groupedPerms, setGroupedPerms] = useState<GroupedPermissions>({});

  useEffect(() => {
    // Group permissions by resource and action
    const grouped: GroupedPermissions = {};

    permissions.forEach(perm => {
      const [resource, action, scope] = perm.code.split(':');
      if (!grouped[resource]) grouped[resource] = {};
      if (!grouped[resource][action]) grouped[resource][action] = [];
      grouped[resource][action].push(perm);
    });

    setGroupedPerms(grouped);
  }, [permissions]);

  const handlePermissionChange = (permId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedPermissionIds, permId]
      : selectedPermissionIds.filter(id => id !== permId);
    onChange(newSelected);
  };

  const handleSelectAllForResource = (resource: string, checked: boolean) => {
    const resourcePermIds = permissions
      .filter(p => p.code.startsWith(resource + ':'))
      .map(p => p.id);

    const newSelected = checked
      ? [...new Set([...selectedPermissionIds, ...resourcePermIds])]
      : selectedPermissionIds.filter(id => !resourcePermIds.includes(id));

    onChange(newSelected);
  };

  const isResourceFullySelected = (resource: string): boolean => {
    const resourcePermIds = permissions
      .filter(p => p.code.startsWith(resource + ':'))
      .map(p => p.id);
    return resourcePermIds.every(id => selectedPermissionIds.includes(id));
  };

  const resourceLabels: Record<string, string> = {
    employees: 'Employee Management',
    documents: 'Document Management',
    departments: 'Departments',
    positions: 'Positions',
    roles: 'Role Management',
    leaves: 'Leave Management',
    timesheets: 'Timesheet Management',
    payroll: 'Payroll Management',
  };

  const actionLabels: Record<string, string> = {
    view: 'View',
    edit: 'Edit',
    create: 'Create',
    delete: 'Delete',
    approve: 'Approve',
    submit: 'Submit',
    run: 'Run',
    assign: 'Assign',
    request: 'Request',
    upload: 'Upload',
    cancel: 'Cancel',
  };

  const scopeLabels: Record<string, string> = {
    own: 'Own',
    team: 'Team',
    department: 'Dept',
    organization: 'Org',
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {Object.entries(groupedPerms).map(([resource, actions]) => (
        <Card
          key={resource}
          size="small"
          title={
            <Space>
              <Checkbox
                checked={isResourceFullySelected(resource)}
                onChange={(e) => handleSelectAllForResource(resource, e.target.checked)}
              />
              <Text strong>{resourceLabels[resource] || resource}</Text>
            </Space>
          }
          style={{ border: '1px solid #e8edf2' }}
        >
          {Object.entries(actions).map(([action, perms]) => (
            <Row key={action} gutter={[16, 8]} style={{ marginBottom: 8 }}>
              <Col span={4}>
                <Text type="secondary">{actionLabels[action] || action}:</Text>
              </Col>
              <Col span={20}>
                <Space size="large">
                  {perms
                    .sort((a, b) => {
                      const scopeOrder = ['own', 'team', 'department', 'organization'];
                      const [, , scopeA] = a.code.split(':');
                      const [, , scopeB] = b.code.split(':');
                      return scopeOrder.indexOf(scopeA) - scopeOrder.indexOf(scopeB);
                    })
                    .map(perm => {
                      const [, , scope] = perm.code.split(':');
                      return (
                        <Checkbox
                          key={perm.id}
                          checked={selectedPermissionIds.includes(perm.id)}
                          onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                        >
                          {scopeLabels[scope] || scope}
                        </Checkbox>
                      );
                    })}
                </Space>
              </Col>
            </Row>
          ))}
        </Card>
      ))}
    </Space>
  );
};
