import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Skeleton,
  Alert,
  Typography,
  Space,
  Descriptions,
  Popconfirm,
  Modal,
  Input,
  message,
  Select,
  DatePicker,
  Tabs,
  Empty,
  Divider,
} from 'antd';
import {
  EditOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  UndoOutlined,
  LockOutlined,
  TeamOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  ContactsOutlined,
  BankOutlined,
  IdcardOutlined,
  DollarOutlined,
  GlobalOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { getEmployeeDetails, EmployeeDetailResponse } from '../../../api/employeeManagementApi';
import { orgadminApi } from '../../../api/orgadminApi';
import { roleApi } from '../../../api/roleApi';
import { createDocumentRequest } from '../../../api/documentRequestsApi';
import dayjs from 'dayjs';
import type { Role } from '../../../api/roleApi';

const { Title } = Typography;

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

  // Request document modal
  const [requestDocumentModalVisible, setRequestDocumentModalVisible] = useState(false);
  const [documentRequestMessage, setDocumentRequestMessage] = useState('');

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
      const data = await roleApi.getAllRoles();
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
    if (!employeeId || !newPassword.trim() || newPassword.length < 6) {
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
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to extend probation';
      message.error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to complete probation';
      message.error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to terminate probation';
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const openRequestDocumentModal = () => {
    setDocumentRequestMessage('');
    setRequestDocumentModalVisible(true);
  };

  const handleRequestDocument = async () => {
    if (!employeeId || !documentRequestMessage.trim()) {
      message.error('Please enter a message for the document request');
      return;
    }

    try {
      setActionLoading(true);
      await createDocumentRequest(employeeId, documentRequestMessage.trim());
      message.success('Document request sent successfully');
      setRequestDocumentModalVisible(false);
      setDocumentRequestMessage('');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to create document request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const employmentTypeColors: Record<string, string> = {
    internal: 'green',
    client: 'blue',
    contract: 'orange',
    consultant: 'purple',
    intern: 'cyan',
  };

  const employmentStatusColors: Record<string, string> = {
    active: 'green',
    on_notice: 'orange',
    resigned: 'red',
    terminated: 'volcano',
    suspended: 'magenta',
    on_leave: 'blue',
  };

  const isDeleted = employee?.deletedAt != null;

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Alert message={error || 'Employee not found'} type="error" showIcon />
        </Card>
      </div>
    );
  }

  const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim() || employee.email;
  const initials = fullName
    ? `${employee.firstName?.[0] || ''}${employee.middleName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
    : employee.email.substring(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      {/* Premium Header Card with Photo */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid rgba(255,255,255,0.3)',
              fontSize: 36,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            title="Click to upload photo"
          >
            {initials}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#fff',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <EditOutlined />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Title level={2} style={{ margin: 0, color: '#fff' }}>
                {fullName}
              </Title>
              {isDeleted && <Tag color="error">Deleted</Tag>}
            </div>
              {employee.employeeCode && (
                <Tag style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none' }}>
                  {employee.employeeCode}
                </Tag>
              )}
              {employee.employmentType && (
                <Tag style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, border: 'none' }}>
                  {employee.employmentType}
                </Tag>
              )}
              {employee.employmentStatus && (
                <Tag style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, border: 'none' }}>
                  {employee.employmentStatus}
                </Tag>
              )}
              {employee.departmentName && (
                <Tag icon={<BankOutlined />} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, border: 'none' }}>
                  {employee.departmentName}
                </Tag>
              )}
              {employee.positionName && (
                <Tag icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, border: 'none' }}>
                  {employee.positionName}
                </Tag>
              )}
            </Space>
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
              {employee.email}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Actions</Title>
            <Space wrap>
              {!isDeleted && (
                <>
                  <Button
                    icon={<FolderOutlined />}
                    onClick={() => navigate('/documents')}
                    style={{ borderRadius: 8 }}
                  >
                    View Documents
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={openRequestDocumentModal}
                    style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}
                  >
                    Request Document
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/employees/${employeeId}/assignment`)}
                    style={{ borderRadius: 8 }}
                  >
                    Edit Assignment
                  </Button>
                  <Button
                    icon={<SafetyCertificateOutlined />}
                    onClick={() => navigate(`/admin/permissions/employee/${employeeId}`)}
                    style={{ borderRadius: 8 }}
                  >
                    Permissions
                  </Button>
                  <Button icon={<TeamOutlined />} onClick={openUpdateRolesModal} style={{ borderRadius: 8 }}>
                    Roles
                  </Button>
                  <Button icon={<LockOutlined />} onClick={openResetPasswordModal} style={{ borderRadius: 8 }}>
                    Reset Password
                  </Button>
                </>
              )}
              <Button
                icon={<HistoryOutlined />}
                onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
                style={{ borderRadius: 8 }}
              >
                History
              </Button>

              {!isDeleted ? (
                <Popconfirm
                  title="Delete employee"
                  description="Are you sure you want to delete this employee?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />} loading={actionLoading} style={{ borderRadius: 8 }}>
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
                style={{ background: '#0a0d54', borderColor: '#0a0d54', borderRadius: 8 }}
              >
                Back
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Tabbed Content Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <UserOutlined /> Overview
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Descriptions title="Basic Information" bordered column={2}>
                      <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
                      <Descriptions.Item label="Employee Code">
                        {employee.employeeCode ? (
                          <Tag color="blue" style={{ borderRadius: 6 }}>{employee.employeeCode}</Tag>
                        ) : '—'}
                      </Descriptions.Item>
                      {employee.firstName && (
                        <Descriptions.Item label="First Name">{employee.firstName}</Descriptions.Item>
                      )}
                      {employee.middleName && (
                        <Descriptions.Item label="Middle Name">{employee.middleName}</Descriptions.Item>
                      )}
                      {employee.lastName && (
                        <Descriptions.Item label="Last Name">{employee.lastName}</Descriptions.Item>
                      )}
                      <Descriptions.Item label="Joining Date">
                        {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Employment Type">
                        {employee.employmentType ? (
                          <Tag color={employmentTypeColors[employee.employmentType] || 'default'}>
                            {employee.employmentType}
                          </Tag>
                        ) : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Employment Status">
                        {employee.employmentStatus ? (
                          <Tag color={employmentStatusColors[employee.employmentStatus] || 'default'}>
                            {employee.employmentStatus}
                          </Tag>
                        ) : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Department">
                        {employee.departmentName ? (
                          <>
                            {employee.departmentName}
                            {employee.departmentCode && ` (${employee.departmentCode})`}
                          </>
                        ) : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Position">{employee.positionName || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Reports To">
                        {(() => {
                          if (!employee.reportsToEmployeeId) return '—';
                          const managerName = `${employee.reportsToFirstName || ''} ${employee.reportsToLastName || ''}`.trim();
                          return managerName || employee.reportsToEmail || '—';
                        })()}
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                ),
              },
              {
                key: '2',
                label: (
                  <span>
                    <IdcardOutlined /> Personal & Contact
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Descriptions title="Personal Details" bordered column={2}>
                      <Descriptions.Item label="Date of Birth">
                        {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">{employee.gender || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Nationality">{employee.nationality || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Marital Status">{employee.maritalStatus || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Blood Group">{employee.bloodGroup || '—'}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="Contact Information" bordered column={2}>
                      <Descriptions.Item label="Personal Email">{employee.personalEmail || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Phone Number">{employee.phoneNumber || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Work Phone">{employee.workPhone || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Alternate Phone">{employee.alternatePhone || '—'}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="Current Address" bordered column={2}>
                      <Descriptions.Item label="Address Line 1">{employee.currentAddressLine1 || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Address Line 2">{employee.currentAddressLine2 || '—'}</Descriptions.Item>
                      <Descriptions.Item label="City">{employee.currentCity || '—'}</Descriptions.Item>
                      <Descriptions.Item label="State/Province">{employee.currentState || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Country">{employee.currentCountry || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Postal Code">{employee.currentPostalCode || '—'}</Descriptions.Item>
                    </Descriptions>

                    {!employee.sameAsCurrentAddress && (
                      <Descriptions title="Permanent Address" bordered column={2}>
                        <Descriptions.Item label="Address Line 1">{employee.permanentAddressLine1 || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Address Line 2">{employee.permanentAddressLine2 || '—'}</Descriptions.Item>
                        <Descriptions.Item label="City">{employee.permanentCity || '—'}</Descriptions.Item>
                        <Descriptions.Item label="State/Province">{employee.permanentState || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Country">{employee.permanentCountry || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Postal Code">{employee.permanentPostalCode || '—'}</Descriptions.Item>
                      </Descriptions>
                    )}
                    {employee.sameAsCurrentAddress && (
                      <Alert message="Permanent address is same as current address" type="info" showIcon />
                    )}
                  </Space>
                ),
              },
              {
                key: '3',
                label: (
                  <span>
                    <ContactsOutlined /> Emergency Contacts
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {(employee.emergencyContactName || employee.emergencyContactPhone) ? (
                      <>
                        <Descriptions title="Primary Emergency Contact" bordered column={2}>
                          <Descriptions.Item label="Name">{employee.emergencyContactName || '—'}</Descriptions.Item>
                          <Descriptions.Item label="Relationship">{employee.emergencyContactRelationship || '—'}</Descriptions.Item>
                          <Descriptions.Item label="Phone" span={2}>{employee.emergencyContactPhone || '—'}</Descriptions.Item>
                        </Descriptions>

                        {(employee.alternateEmergencyContactName || employee.alternateEmergencyContactPhone) && (
                          <Descriptions title="Alternate Emergency Contact" bordered column={2}>
                            <Descriptions.Item label="Name">{employee.alternateEmergencyContactName || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Relationship">{employee.alternateEmergencyContactRelationship || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Phone" span={2}>{employee.alternateEmergencyContactPhone || '—'}</Descriptions.Item>
                          </Descriptions>
                        )}
                      </>
                    ) : (
                      <Empty description="No emergency contact information available" />
                    )}
                  </Space>
                ),
              },
              {
                key: '4',
                label: (
                  <span>
                    <GlobalOutlined /> Vendor/Client/Project
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {(employee.vendorId || employee.clientId || employee.projectId) ? (
                      <Descriptions title="Assignment Details" bordered column={2}>
                        {employee.vendorId && (
                          <Descriptions.Item label="Vendor" span={2}>
                            {employee.vendorName} ({employee.vendorCode})
                          </Descriptions.Item>
                        )}
                        {employee.clientId && (
                          <Descriptions.Item label="Client" span={2}>
                            {employee.clientName} ({employee.clientCode})
                          </Descriptions.Item>
                        )}
                        {employee.projectId && (
                          <Descriptions.Item label="Project" span={2}>
                            {employee.projectName} ({employee.projectCode})
                          </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Contract Start">
                          {employee.contractStartDate ? new Date(employee.contractStartDate).toLocaleDateString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Contract End">
                          {employee.contractEndDate ? new Date(employee.contractEndDate).toLocaleDateString() : '—'}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Empty description="Not assigned to any vendor, client, or project" />
                    )}

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
                              <Button size="small" onClick={openExtendProbationModal}>Extend</Button>
                              <Popconfirm
                                title="Complete probation?"
                                onConfirm={handleCompleteProbation}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button type="primary" size="small">Complete</Button>
                              </Popconfirm>
                              <Popconfirm
                                title="Terminate probation?"
                                onConfirm={handleTerminateProbation}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <Button danger size="small">Terminate</Button>
                              </Popconfirm>
                            </Space>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    )}
                  </Space>
                ),
              },
              {
                key: '5',
                label: (
                  <span>
                    <DollarOutlined /> Compensation & Bank
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {employee.basicSalary ? (
                      <Descriptions title="Compensation" bordered column={2}>
                        <Descriptions.Item label="Basic Salary">
                          {formatCurrency(employee.basicSalary, employee.currency)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Currency">{employee.currency || 'USD'}</Descriptions.Item>
                        <Descriptions.Item label="Pay Frequency" span={2}>{employee.payFrequency || '—'}</Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Alert message="No compensation information available" type="info" showIcon />
                    )}

                    {(employee.bankAccountNumber || employee.bankName) ? (
                      <Descriptions title="Bank Details" bordered column={2}>
                        <Descriptions.Item label="Account Number">{employee.bankAccountNumber || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Bank Name">{employee.bankName || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Branch">{employee.bankBranch || '—'}</Descriptions.Item>
                        <Descriptions.Item label="IFSC/Routing Code">{employee.ifscCode || '—'}</Descriptions.Item>
                        <Descriptions.Item label="SWIFT Code" span={2}>{employee.swiftCode || '—'}</Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Alert message="No bank details available" type="info" showIcon />
                    )}
                  </Space>
                ),
              },
              {
                key: '6',
                label: (
                  <span>
                    <SafetyCertificateOutlined /> Compliance & Legal
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Descriptions title="Tax Information" bordered column={2}>
                      <Descriptions.Item label="Tax ID" span={2}>{employee.taxIdentificationNumber || '—'}</Descriptions.Item>
                    </Descriptions>

                    {(employee.panNumber || employee.aadharNumber || employee.uanNumber) && (
                      <Descriptions title="India-Specific" bordered column={2}>
                        <Descriptions.Item label="PAN Number">{employee.panNumber || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Aadhar Number">{employee.aadharNumber || '—'}</Descriptions.Item>
                        <Descriptions.Item label="UAN Number" span={2}>{employee.uanNumber || '—'}</Descriptions.Item>
                      </Descriptions>
                    )}

                    {(employee.ssnNumber || employee.driversLicenseNumber) && (
                      <Descriptions title="USA-Specific" bordered column={2}>
                        <Descriptions.Item label="SSN">{employee.ssnNumber || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Driver's License">{employee.driversLicenseNumber || '—'}</Descriptions.Item>
                      </Descriptions>
                    )}

                    {employee.passportNumber && (
                      <Descriptions title="Travel Documents" bordered column={2}>
                        <Descriptions.Item label="Passport Number" span={2}>{employee.passportNumber}</Descriptions.Item>
                      </Descriptions>
                    )}

                    {(employee.linkedInProfile || employee.githubProfile) && (
                      <Descriptions title="Professional Profiles" bordered column={2}>
                        {employee.linkedInProfile && (
                          <Descriptions.Item label="LinkedIn">
                            <a href={employee.linkedInProfile} target="_blank" rel="noopener noreferrer">
                              View Profile
                            </a>
                          </Descriptions.Item>
                        )}
                        {employee.githubProfile && (
                          <Descriptions.Item label="GitHub">
                            <a href={employee.githubProfile} target="_blank" rel="noopener noreferrer">
                              View Profile
                            </a>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    )}
                  </Space>
                ),
              },
              {
                key: '7',
                label: (
                  <span>
                    <HistoryOutlined /> Exit & Audit
                  </span>
                ),
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {(employee.resignationDate || employee.lastWorkingDate) ? (
                      <Descriptions title="Exit Information" bordered column={2}>
                        <Descriptions.Item label="Resignation Date">
                          {employee.resignationDate ? new Date(employee.resignationDate).toLocaleDateString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Working Date">
                          {employee.lastWorkingDate ? new Date(employee.lastWorkingDate).toLocaleDateString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Exit Reason" span={2}>{employee.exitReason || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Exit Notes" span={2}>{employee.exitNotes || '—'}</Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Alert message="No exit information" type="success" showIcon />
                    )}

                    <Descriptions title="Audit Trail" bordered column={2}>
                      <Descriptions.Item label="Created At">
                        {new Date(employee.createdAt).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created By">{employee.createdByEmail || '—'}</Descriptions.Item>
                      <Descriptions.Item label="Last Updated">
                        {new Date(employee.updatedAt).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Updated By">{employee.updatedByEmail || '—'}</Descriptions.Item>
                      {employee.deletedAt && (
                        <>
                          <Descriptions.Item label="Deleted At">
                            {new Date(employee.deletedAt).toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Deleted By">{employee.deletedByEmail || '—'}</Descriptions.Item>
                        </>
                      )}
                    </Descriptions>
                  </Space>
                ),
              },
            ]}
          />
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
        <Input.Password
          placeholder="Enter new password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          size="large"
        />
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
        <Select
          mode="multiple"
          placeholder="Select roles"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          style={{ width: '100%' }}
          options={roles.map(role => ({ label: role.name, value: role.id }))}
          size="large"
        />
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
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>New End Date</label>
          <DatePicker
            value={newProbationEndDate}
            onChange={setNewProbationEndDate}
            style={{ width: '100%' }}
            size="large"
            placeholder="Select new end date"
            disabledDate={(current) => {
              if (!current) return false;
              if (current < dayjs().startOf('day')) return true;
              if (employee?.probationEndDate && current <= dayjs(employee.probationEndDate)) return true;
              return false;
            }}
          />
        </div>
      </Modal>

      {/* Request Document Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#52c41a' }} />
            <span>Request Document from {fullName}</span>
          </Space>
        }
        open={requestDocumentModalVisible}
        onOk={handleRequestDocument}
        onCancel={() => {
          setRequestDocumentModalVisible(false);
          setDocumentRequestMessage('');
        }}
        confirmLoading={actionLoading}
        okText="Send Request"
        okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="What document do you need?"
            description="The employee will receive this request and can upload the requested document."
            type="info"
            showIcon
          />
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Request Message *</label>
            <Input.TextArea
              placeholder="e.g., Please upload your ID proof, passport copy, or latest address proof"
              value={documentRequestMessage}
              onChange={(e) => setDocumentRequestMessage(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};
