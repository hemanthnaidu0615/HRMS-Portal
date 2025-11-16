import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { roleApi, Permission, RoleDetail } from '../../../api/roleApi';
import { PermissionCheckboxGrid } from '../../../components/roles/PermissionCheckboxGrid';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export const EditRolePage = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingRole, setFetchingRole] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [role, setRole] = useState<RoleDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    if (!roleId) return;

    setFetchingRole(true);
    try {
      const [roleData, allPermissions] = await Promise.all([
        roleApi.getRoleDetail(Number(roleId)),
        roleApi.getAllPermissions(),
      ]);

      setRole(roleData);
      setPermissions(allPermissions);

      // Pre-fill form
      form.setFieldsValue({
        name: roleData.name,
        description: roleData.description || '',
      });

      // Pre-select role's current permissions
      setSelectedPermissionIds(roleData.permissions.map(p => p.id));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load role');
      navigate('/admin/roles');
    } finally {
      setFetchingRole(false);
    }
  };

  const handleSubmit = async (values: { name: string; description?: string }) => {
    if (!roleId) return;

    if (selectedPermissionIds.length === 0) {
      message.warning('Please select at least one permission');
      return;
    }

    setLoading(true);
    try {
      await roleApi.updateRole(Number(roleId), {
        name: values.name,
        description: values.description,
        permissionIds: selectedPermissionIds,
      });
      message.success('Role updated successfully');
      navigate('/admin/roles');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRole) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/roles')}
        >
          Back to Roles
        </Button>
      </Space>

      <Card title={`Edit Role: ${role.name}`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Role Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter role name' },
              { min: 2, message: 'Role name must be at least 2 characters' },
              { max: 100, message: 'Role name must not exceed 100 characters' },
            ]}
          >
            <Input placeholder="e.g. Team Lead, Department Manager, HR Manager" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description must not exceed 500 characters' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Brief description of this role's responsibilities"
            />
          </Form.Item>

          <Form.Item label="Permissions" required>
            <PermissionCheckboxGrid
              permissions={permissions}
              selectedPermissionIds={selectedPermissionIds}
              onChange={setSelectedPermissionIds}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Update Role
              </Button>
              <Button onClick={() => navigate('/admin/roles')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
