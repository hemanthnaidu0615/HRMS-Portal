import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Tag, Skeleton, Alert, Typography, Space, Descriptions, Popconfirm, Modal, Input, message, Select, DatePicker } from 'antd';
import {
  EditOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  UndoOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { getEmployeeDetails, EmployeeDetailResponse } from '../../../api/employeeManagementApi';
import { orgadminApi } from '../../../api/orgadminApi';
import { roleApi } from '../../../api/roleApi';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Role {
  id: string;
  name: string;
}

export const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reset password modal
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Update roles modal
  const [updateRolesModalVisible, setUpdateRolesModalVisible] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Probation extend modal
  const [extendProbationModalVisible, setExtendProbationModalVisible] = useState(false);
  const [newProbationEndDate, setNewProbationEndDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeDetails(employeeId!);
      setEmployee(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleApi.getRoles();
      setRoles(data);
    } catch (err: any) {
      message.error('Failed to load roles');
    }
  };

  const handleDelete = async () => {
    if (!employeeId) return;

    try {
      setActionLoading(true);
      await orgadminApi.deleteEmployee(employeeId);
      message.success('Employee deleted successfully');
      navigate('/admin/employees');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!employeeId) return;

    try {
      setActionLoading(true);
      await orgadminApi.reactivateEmployee(employeeId);
      message.success('Employee reactivated successfully');
      await loadEmployee();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to reactivate employee');
    } finally {
      setActionLoading(false);
    }
  };

  const openResetPasswordModal = () => {
    setNewPassword('');
    setResetPasswordModalVisible(true);
  };

  const handleResetPassword = async () => {
    if (!employeeId || !newPassword.trim()) {
      message.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      message.error('Password must be at least 6 characters');
      return;
    }

    try {
      setActionLoading(true);
      await orgadminApi.resetEmployeePassword(employeeId, newPassword);
      message.success('Password reset successfully');
      setResetPasswordModalVisible(false);
      setNewPassword('');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const openUpdateRolesModal = async () => {
    await loadRoles();
    setSelectedRoleIds([]);
    setUpdateRolesModalVisible(true);
  };

  const handleUpdateRoles = async () => {
    if (!employeeId) return;

    try {
      setActionLoading(true);
      await orgadminApi.updateEmployeeRoles(employeeId, selectedRoleIds);
      message.success('Employee roles updated successfully');
      setUpdateRolesModalVisible(false);
      setSelectedRoleIds([]);
      await loadEmployee();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update roles');
    } finally {
      setActionLoading(false);
    }
  };

  const openExtendProbationModal = () => {
    setNewProbationEndDate(null);
    setExtendProbationModalVisible(true);
  };

  const handleExtendProbation = async () => {
    if (!employeeId || !newProbationEndDate) {
      message.error('Please select a new end date');
      return;
    }

    try {
      setActionLoading(true);
      await orgadminApi.extendProbation(employeeId, newProbationEndDate.format('YYYY-MM-DD'));
      message.success('Probation period extended successfully');
      setExtendProbationModalVisible(false);
      setNewProbationEndDate(null);
      await loadEmployee();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to extend probation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteProbation = async () => {
    if (!employeeId) return;

    try {
      setActionLoading(true);
      await orgadminApi.completeProbation(employeeId);
      message.success('Probation completed successfully');
      await loadEmployee();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to complete probation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminateProbation = async () => {
    if (!employeeId) return;

    try {
      setActionLoading(true);
      await orgadminApi.terminateProbation(employeeId);
      message.success('Probation terminated');
      await loadEmployee();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to terminate probation');
    } finally {
      setActionLoading(false);
    }
  };

  const employmentTypeColors: Record<string, string> = {
    internal: 'green',
    client: 'blue',
    contract: 'orange',
    bench: 'red'
  };

  const isDeleted = employee?.deletedAt != null;

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Alert message={error || 'Employee not found'} type="error" showIcon />
        </Card>
      </div>
    );
  }

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
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Employee Details
                {isDeleted && <Tag color="error" style={{ marginLeft: 8 }}>Deleted</Tag>}
              </Title>
            </div>
            <Space wrap>
              {!isDeleted && (
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/employees/${employeeId}/assignment`)}
                    style={{ borderRadius: 8 }}
                  >
                    Edit Assignment
                  </Button>
                  <Button
                    icon={<TeamOutlined />}
                    onClick={openUpdateRolesModal}
                    style={{ borderRadius: 8 }}
                  >
                    Update Roles
                  </Button>
                  <Button
                    icon={<LockOutlined />}
                    onClick={openResetPasswordModal}
                    style={{ borderRadius: 8 }}
                  >
                    Reset Password
                  </Button>
                </>
              )}
              <Button
                icon={<HistoryOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
                style={{ borderRadius: 8 }}
              >
                View History
              </Button>
              {!isDeleted && (
                <Button
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => navigate(`/orgadmin/employees/${employeeId}/permissions`)}
                  style={{ borderRadius: 8 }}
                >
                  Permissions
                </Button>
              )}

              {!isDeleted ? (
                <Popconfirm
                  title="Delete employee"
                  description="Are you sure you want to delete this employee?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={actionLoading}
                    style={{ borderRadius: 8 }}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  type="primary"
                  icon={<UndoOutlined />}
                  onClick={handleReactivate}
                  loading={actionLoading}
                  style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}
                >
                  Reactivate
                </Button>
              )}

              <Button
                icon={<ArrowLeftOutlined />}
                type="primary"
                onClick={() => navigate('/admin/employees')}
                style={{
                  background: '#0a0d54',
                  borderColor: '#0a0d54',
                  borderRadius: 8
                }}
              >
                Back
              </Button>
            </Space>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
            <Descriptions.Item label="Employment Type">
              {employee.employmentType ? (
                <Tag color={employmentTypeColors[employee.employmentType] || 'default'} style={{ borderRadius: 6 }}>
                  {employee.employmentType}
                </Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {employee.departmentName ? (
                <Tag color="blue" style={{ borderRadius: 6 }}>{employee.departmentName}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              {employee.positionName ? (
                <Tag color="green" style={{ borderRadius: 6 }}>{employee.positionName}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Reports To">{employee.reportsToEmail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Client ID">{employee.clientId || '—'}</Descriptions.Item>
            <Descriptions.Item label="Project ID">{employee.projectId || '—'}</Descriptions.Item>
            <Descriptions.Item label="Contract End Date">{employee.contractEndDate || '—'}</Descriptions.Item>
          </Descriptions>

          {/* Probation Section */}
          {employee.isProbation && (
            <Card
              title="Probation Period"
              extra={<Tag color="orange">Active</Tag>}
              style={{ borderRadius: 8, border: '1px solid #fa8c16' }}
            >
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Start Date">
                  {employee.probationStartDate ? new Date(employee.probationStartDate).toLocaleDateString() : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString() : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={employee.probationStatus === 'extended' ? 'orange' : 'blue'}>
                    {employee.probationStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Actions">
                  <Space>
                    <Button
                      size="small"
                      onClick={openExtendProbationModal}
                      style={{ borderRadius: 6 }}
                    >
                      Extend
                    </Button>
                    <Popconfirm
                      title="Complete probation?"
                      description="This will mark the probation as successfully completed."
                      onConfirm={handleCompleteProbation}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="primary" size="small" style={{ borderRadius: 6 }}>
                        Complete
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Terminate probation?"
                      description="This will terminate the probation period."
                      onConfirm={handleTerminateProbation}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger size="small" style={{ borderRadius: 6 }}>
                        Terminate
                      </Button>
                    </Popconfirm>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Space>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Employee Password"
        open={resetPasswordModalVisible}
        onOk={handleResetPassword}
        onCancel={() => {
          setResetPasswordModalVisible(false);
          setNewPassword('');
        }}
        confirmLoading={actionLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Password
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Space>
      </Modal>

      {/* Update Roles Modal */}
      <Modal
        title="Update Employee Roles"
        open={updateRolesModalVisible}
        onOk={handleUpdateRoles}
        onCancel={() => {
          setUpdateRolesModalVisible(false);
          setSelectedRoleIds([]);
        }}
        confirmLoading={actionLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            mode="multiple"
            placeholder="Select roles"
            value={selectedRoleIds}
            onChange={setSelectedRoleIds}
            style={{ width: '100%' }}
            options={roles.map(role => ({
              label: role.name,
              value: role.id,
            }))}
            size="large"
          />
        </Space>
      </Modal>

      {/* Extend Probation Modal */}
      <Modal
        title="Extend Probation Period"
        open={extendProbationModalVisible}
        onOk={handleExtendProbation}
        onCancel={() => {
          setExtendProbationModalVisible(false);
          setNewProbationEndDate(null);
        }}
        confirmLoading={actionLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              New End Date
            </label>
            <DatePicker
              value={newProbationEndDate}
              onChange={setNewProbationEndDate}
              style={{ width: '100%' }}
              size="large"
              placeholder="Select new end date"
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};
