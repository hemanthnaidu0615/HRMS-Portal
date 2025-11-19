import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Typography, Switch, Button, Row, Col, message, Space, Spin,
  Alert, Modal, InputNumber, DatePicker, Tooltip, Badge, Divider
} from 'antd';
import {
  ClockCircleOutlined, CalendarOutlined, FieldTimeOutlined, DollarOutlined,
  TrophyOutlined, TeamOutlined, LaptopOutlined, WalletOutlined, ProjectOutlined,
  ArrowLeftOutlined, SaveOutlined, ExclamationCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { superadminApi, OrganizationModule, UpdateModulesRequest } from '../../api/superadminApi';

const { Title, Text, Paragraph } = Typography;

interface ModuleConfig {
  name: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  ATTENDANCE: {
    name: 'ATTENDANCE',
    displayName: 'Attendance',
    icon: <ClockCircleOutlined style={{ fontSize: 32 }} />,
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    description: 'Track employee attendance, check-ins, and check-outs'
  },
  LEAVE: {
    name: 'LEAVE',
    displayName: 'Leave Management',
    icon: <CalendarOutlined style={{ fontSize: 32 }} />,
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    description: 'Manage leave requests, approvals, and balances'
  },
  TIMESHEET: {
    name: 'TIMESHEET',
    displayName: 'Timesheet',
    icon: <FieldTimeOutlined style={{ fontSize: 32 }} />,
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    description: 'Record and manage employee work hours'
  },
  PAYROLL: {
    name: 'PAYROLL',
    displayName: 'Payroll',
    icon: <DollarOutlined style={{ fontSize: 32 }} />,
    color: '#faad14',
    gradient: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    description: 'Process payroll, salaries, and compensation'
  },
  PERFORMANCE: {
    name: 'PERFORMANCE',
    displayName: 'Performance',
    icon: <TrophyOutlined style={{ fontSize: 32 }} />,
    color: '#eb2f96',
    gradient: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)',
    description: 'Performance reviews, goals, and evaluations'
  },
  RECRUITMENT: {
    name: 'RECRUITMENT',
    displayName: 'Recruitment',
    icon: <TeamOutlined style={{ fontSize: 32 }} />,
    color: '#13c2c2',
    gradient: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)',
    description: 'Manage job postings, candidates, and hiring'
  },
  ASSETS: {
    name: 'ASSETS',
    displayName: 'Asset Management',
    icon: <LaptopOutlined style={{ fontSize: 32 }} />,
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
    description: 'Track and manage company assets and equipment'
  },
  EXPENSES: {
    name: 'EXPENSES',
    displayName: 'Expense Management',
    icon: <WalletOutlined style={{ fontSize: 32 }} />,
    color: '#f5222d',
    gradient: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
    description: 'Manage employee expenses and reimbursements'
  },
  PROJECTS: {
    name: 'PROJECTS',
    displayName: 'Project Management',
    icon: <ProjectOutlined style={{ fontSize: 32 }} />,
    color: '#2f54eb',
    gradient: 'linear-gradient(135deg, #2f54eb 0%, #1d39c4 100%)',
    description: 'Track projects, tasks, and deliverables'
  }
};

export const OrganizationModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [modules, setModules] = useState<OrganizationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (orgId) {
      loadModules();
    }
  }, [orgId]);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await superadminApi.getOrganizationModules(orgId!);
      setModules(data);
      setHasChanges(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load modules';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = (moduleName: string, enabled: boolean) => {
    // Show confirmation modal when disabling
    if (!enabled) {
      // Show confirmation modal when disabling
      Modal.confirm({
        title: 'Disable Module',
        content: (
          <div>
            <Paragraph>
              Are you sure you want to disable <strong>{MODULE_CONFIGS[moduleName]?.displayName}</strong>?
            </Paragraph>
            <Alert
              message="Warning"
              description="Users will lose access to this module and its data. This action can be reversed by re-enabling the module."
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
            />
          </div>
        ),
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        okText: 'Yes, Disable',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        onOk: () => {
          updateModuleStatus(moduleName, enabled);
        }
      });
    } else {
      updateModuleStatus(moduleName, enabled);
    }
  };

  const updateModuleStatus = (moduleName: string, enabled: boolean) => {
    const updatedModules = modules.map(module =>
      module.moduleName === moduleName
        ? { ...module, isEnabled: enabled }
        : module
    );
    setModules(updatedModules);
    setHasChanges(true);

    if (enabled) {
      message.success(`${MODULE_CONFIGS[moduleName]?.displayName} enabled`);
    }
  };

  const handleUpdateUserLimit = (moduleName: string, userLimit: number | null) => {
    const updatedModules = modules.map(module =>
      module.moduleName === moduleName
        ? { ...module, userLimit: userLimit || undefined }
        : module
    );
    setModules(updatedModules);
    setHasChanges(true);
  };

  const handleUpdateExpiryDate = (moduleName: string, date: dayjs.Dayjs | null) => {
    const updatedModules = modules.map(module =>
      module.moduleName === moduleName
        ? { ...module, expiryDate: date ? date.format('YYYY-MM-DD') : undefined }
        : module
    );
    setModules(updatedModules);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      // Prepare update request
      const updateRequest: UpdateModulesRequest[] = modules.map(module => ({
        moduleName: module.moduleName,
        isEnabled: module.isEnabled,
        userLimit: module.userLimit,
        expiryDate: module.expiryDate
      }));

      await superadminApi.updateOrganizationModules(orgId!, updateRequest);

      message.success({
        content: 'Modules updated successfully!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });

      setHasChanges(false);
      await loadModules();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update modules';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = modules.filter(m => m.isEnabled).length;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Spin size="large" tip="Loading modules..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/superadmin/organizations')}
            style={{ marginBottom: 16 }}
            size="large"
          >
            Back to Organizations
          </Button>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                Module Subscriptions
              </Title>
              <Space size="large">
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Manage module access for this organization
                </Text>
                <Badge
                  count={`${enabledCount} / ${modules.length} Enabled`}
                  style={{
                    backgroundColor: '#52c41a',
                    fontSize: 14,
                    height: 28,
                    lineHeight: '28px',
                    borderRadius: 14,
                    padding: '0 16px'
                  }}
                />
              </Space>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSaveChanges}
              loading={saving}
              disabled={!hasChanges}
              style={{
                height: 48,
                fontSize: 16,
                borderRadius: 8,
                boxShadow: hasChanges ? '0 4px 12px rgba(24, 144, 255, 0.3)' : 'none'
              }}
            >
              Save Changes
            </Button>
          </div>

          {hasChanges && (
            <Alert
              message="Unsaved Changes"
              description="You have unsaved changes. Click 'Save Changes' to apply them."
              type="warning"
              showIcon
              closable
              style={{ marginTop: 16 }}
            />
          )}

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginTop: 16 }}
            />
          )}
        </div>

        {/* Module Cards */}
        <Row gutter={[24, 24]}>
          {modules.map((module) => {
            const config = MODULE_CONFIGS[module.moduleName];
            if (!config) return null;

            return (
              <Col key={module.moduleName} xs={24} sm={24} md={12} lg={8}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: module.isEnabled ? `2px solid ${config.color}` : '1px solid #f0f0f0',
                    boxShadow: module.isEnabled
                      ? `0 8px 24px ${config.color}40`
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Background gradient overlay when enabled */}
                  {module.isEnabled && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: config.gradient,
                      }}
                    />
                  )}

                  <div style={{ paddingTop: module.isEnabled ? 6 : 0 }}>
                    {/* Module Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 20
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 12,
                            background: module.isEnabled ? config.gradient : '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: module.isEnabled ? 'white' : '#999',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                            {config.displayName}
                          </Title>
                          <Badge
                            status={module.isEnabled ? 'success' : 'default'}
                            text={module.isEnabled ? 'Enabled' : 'Disabled'}
                            style={{
                              fontSize: 13,
                              fontWeight: 500
                            }}
                          />
                        </div>
                      </div>

                      <Tooltip title={module.isEnabled ? 'Disable module' : 'Enable module'}>
                        <Switch
                          checked={module.isEnabled}
                          onChange={(checked) => handleToggleModule(module.moduleName, checked)}
                          style={{
                            backgroundColor: module.isEnabled ? config.color : undefined
                          }}
                          size="default"
                        />
                      </Tooltip>
                    </div>

                    {/* Module Description */}
                    <Paragraph
                      type="secondary"
                      style={{
                        marginBottom: 20,
                        fontSize: 14,
                        minHeight: 40
                      }}
                    >
                      {config.description}
                    </Paragraph>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Module Configuration */}
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                      {/* User Limit */}
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                          User Limit
                        </Text>
                        <InputNumber
                          value={module.userLimit}
                          onChange={(value) => handleUpdateUserLimit(module.moduleName, value)}
                          placeholder="Unlimited"
                          min={1}
                          max={10000}
                          disabled={!module.isEnabled}
                          style={{ width: '100%' }}
                          formatter={value => value ? `${value} users` : ''}
                          parser={value => value ? parseInt(value.replace(/[^\d]/g, '')) : 0}
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                          Subscription Expiry
                        </Text>
                        <DatePicker
                          value={module.expiryDate ? dayjs(module.expiryDate) : null}
                          onChange={(date) => handleUpdateExpiryDate(module.moduleName, date)}
                          placeholder="No expiry"
                          disabled={!module.isEnabled}
                          style={{ width: '100%' }}
                          format="MMM DD, YYYY"
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                      </div>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Footer Info */}
        <Card
          style={{
            marginTop: 32,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white'
          }}
        >
          <Space direction="vertical" size={8}>
            <Title level={5} style={{ color: 'white', margin: 0 }}>
              Module Management Tips
            </Title>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.9)' }}>
              <li>Core features (Employee Management, Documents) work independently of modules</li>
              <li>Modules control additional HR features (Leave, Attendance, Payroll, etc.)</li>
              <li>User limits control how many users can access each module</li>
              <li>Set expiry dates for time-limited subscriptions</li>
            </ul>
          </Space>
        </Card>
      </div>
    </div>
  );
};
