import { useState, useEffect } from 'react';
import {
  Card, List, Progress, Tag, Button, Space, Typography, Alert, Checkbox, Divider, Statistic, Row, Col, message
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  TeamOutlined, SafetyCertificateOutlined, BankOutlined, IdcardOutlined,
  PhoneOutlined, UploadOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

interface ChecklistItem {
  id: number;
  checklistItemName: string;
  checklistItemType: string;
  description?: string;
  status: string;
  isMandatory: boolean;
  dueDate?: string;
  completedAt?: string;
  displayOrder: number;
}

interface OnboardingStatus {
  totalItems: number;
  completedItems: number;
  mandatoryItems: number;
  mandatoryCompleted: number;
  completionPercentage: number;
  allMandatoryComplete: boolean;
}

export const OnboardingChecklistPage = () => {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checklistRes, statusRes] = await Promise.all([
        axios.get('/api/documents/onboarding/checklist', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/documents/onboarding/status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      setChecklist(checklistRes.data || []);
      setStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to load onboarding data:', err);
      message.error('Failed to load onboarding checklist');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    const icons: Record<string, any> = {
      UPLOAD_PHOTO: <TeamOutlined />,
      UPLOAD_ID_PROOF: <IdcardOutlined />,
      UPLOAD_ADDRESS_PROOF: <FileTextOutlined />,
      SIGN_OFFER_LETTER: <EditOutlined />,
      SIGN_CONTRACT: <EditOutlined />,
      SIGN_NDA: <SafetyCertificateOutlined />,
      SIGN_HANDBOOK: <FileTextOutlined />,
      SIGN_CODE_OF_CONDUCT: <SafetyCertificateOutlined />,
      COMPLETE_TAX_FORM: <FileTextOutlined />,
      ENROLL_BENEFITS: <BankOutlined />,
      SETUP_DIRECT_DEPOSIT: <BankOutlined />,
      EMERGENCY_CONTACT_INFO: <PhoneOutlined />,
      CUSTOM: <FileTextOutlined />,
    };
    return icons[type] || <FileTextOutlined />;
  };

  const getStatusTag = (item: ChecklistItem) => {
    if (item.status === 'COMPLETED') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
    }
    if (item.status === 'IN_PROGRESS') {
      return <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>;
    }
    if (item.status === 'SKIPPED') {
      return <Tag color="default">Skipped</Tag>;
    }
    if (item.status === 'NA') {
      return <Tag color="default">N/A</Tag>;
    }
    return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending</Tag>;
  };

  const getActionButton = (item: ChecklistItem) => {
    if (item.status === 'COMPLETED') {
      return null;
    }

    const actionMap: Record<string, { text: string; route: string }> = {
      UPLOAD_PHOTO: { text: 'Upload Photo', route: '/employee/profile/edit' },
      UPLOAD_ID_PROOF: { text: 'Upload Document', route: '/documents/upload' },
      UPLOAD_ADDRESS_PROOF: { text: 'Upload Document', route: '/documents/upload' },
      SIGN_OFFER_LETTER: { text: 'Sign Document', route: '/documents/me' },
      SIGN_CONTRACT: { text: 'Sign Document', route: '/documents/me' },
      SIGN_NDA: { text: 'Sign Document', route: '/documents/me' },
      SIGN_HANDBOOK: { text: 'Sign Document', route: '/documents/me' },
      SIGN_CODE_OF_CONDUCT: { text: 'Sign Document', route: '/documents/me' },
      COMPLETE_TAX_FORM: { text: 'Complete Form', route: '/employee/tax-forms' },
      ENROLL_BENEFITS: { text: 'Enroll Now', route: '/employee/benefits' },
      SETUP_DIRECT_DEPOSIT: { text: 'Setup', route: '/employee/payroll' },
      EMERGENCY_CONTACT_INFO: { text: 'Add Contact', route: '/employee/profile/edit' },
    };

    const action = actionMap[item.checklistItemType];
    if (!action) return null;

    return (
      <Button
        type="primary"
        size="small"
        onClick={() => navigate(action.route)}
      >
        {action.text}
      </Button>
    );
  };

  const pendingItems = checklist.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS');
  const completedItems = checklist.filter(i => i.status === 'COMPLETED');

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>
                <CheckCircleOutlined style={{ marginRight: 12, color: '#52c41a' }} />
                Welcome to Your Onboarding!
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Complete the following tasks to finish your onboarding process
              </Text>
            </div>
          </Card>

          {status && (
            <Card>
              <Row gutter={24}>
                <Col span={6}>
                  <Statistic
                    title="Overall Progress"
                    value={status.completionPercentage}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Completed"
                    value={status.completedItems}
                    suffix={`/ ${status.totalItems}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Mandatory Completed"
                    value={status.mandatoryCompleted}
                    suffix={`/ ${status.mandatoryItems}`}
                    valueStyle={{ color: status.allMandatoryComplete ? '#52c41a' : '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Status"
                    value={status.allMandatoryComplete ? 'Complete' : 'In Progress'}
                    valueStyle={{ color: status.allMandatoryComplete ? '#52c41a' : '#1890ff' }}
                  />
                </Col>
              </Row>

              <Divider />

              <Progress
                percent={status.completionPercentage}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                style={{ marginBottom: 8 }}
              />
              <Text type="secondary">
                {status.allMandatoryComplete
                  ? 'All mandatory tasks completed! Great job!'
                  : `${status.mandatoryItems - status.mandatoryCompleted} mandatory task(s) remaining`}
              </Text>
            </Card>
          )}

          {!status?.allMandatoryComplete && pendingItems.length > 0 && (
            <Alert
              message="Action Required"
              description={`You have ${pendingItems.filter(i => i.isMandatory).length} mandatory task(s) to complete before your onboarding is finished.`}
              type="warning"
              showIcon
              icon={<ClockCircleOutlined />}
            />
          )}

          {status?.allMandatoryComplete && (
            <Alert
              message="Onboarding Complete!"
              description="Congratulations! You've completed all mandatory onboarding tasks. You're all set!"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}

          {/* Pending Tasks */}
          {pendingItems.length > 0 && (
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>Pending Tasks ({pendingItems.length})</span>
                </Space>
              }
            >
              <List
                dataSource={pendingItems}
                loading={loading}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[getActionButton(item)]}
                  >
                    <List.Item.Meta
                      avatar={getItemIcon(item.checklistItemType)}
                      title={
                        <Space>
                          <span>{item.checklistItemName}</span>
                          {item.isMandatory && <Tag color="red">Mandatory</Tag>}
                          {getStatusTag(item)}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          {item.description && <Text type="secondary">{item.description}</Text>}
                          {item.dueDate && (
                            <Text type="secondary">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Completed Tasks */}
          {completedItems.length > 0 && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Completed Tasks ({completedItems.length})</span>
                </Space>
              }
            >
              <List
                dataSource={completedItems}
                loading={loading}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={getItemIcon(item.checklistItemType)}
                      title={
                        <Space>
                          <span style={{ textDecoration: 'line-through', color: '#999' }}>
                            {item.checklistItemName}
                          </span>
                          {getStatusTag(item)}
                        </Space>
                      }
                      description={
                        item.completedAt && (
                          <Text type="secondary">
                            Completed on {new Date(item.completedAt).toLocaleDateString()}
                          </Text>
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Space>
      </div>
    </div>
  );
};
