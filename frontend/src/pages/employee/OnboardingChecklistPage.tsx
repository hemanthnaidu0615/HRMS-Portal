import { useState, useEffect } from 'react';
import {
  Card, Progress, Tag, Button, Space, Typography, Alert, Divider, Statistic, Row, Col, message, Spin, Empty, Avatar, Steps, Tabs
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  TeamOutlined, SafetyCertificateOutlined, BankOutlined, IdcardOutlined,
  PhoneOutlined, EditOutlined, RocketOutlined, TrophyOutlined,
  DashboardOutlined, UnorderedListOutlined, HistoryOutlined,
  RightOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getOnboardingChecklist, 
  getOnboardingStatus, 
  type OnboardingChecklistItem, 
  type OnboardingStatus 
} from '../../api/documentSigningApi';
import './OnboardingChecklistPage.css';

const { Title, Text, Paragraph } = Typography;

export const OnboardingChecklistPage = () => {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<OnboardingChecklistItem[]>([]);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checklistData, statusData] = await Promise.all([
        getOnboardingChecklist(),
        getOnboardingStatus()
      ]);
      setChecklist(checklistData);
      setStatus(statusData);
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

  const getActionButton = (item: OnboardingChecklistItem) => {
    if (item.status === 'COMPLETED') return null;

    const actionMap: Record<string, { text: string; route: string }> = {
      UPLOAD_PHOTO: { text: 'Upload Photo', route: '/employee/profile/edit' },
      UPLOAD_ID_PROOF: { text: 'Upload Document', route: '/documents/upload' },
      UPLOAD_ADDRESS_PROOF: { text: 'Upload Document', route: '/documents/upload' },
      SIGN_OFFER_LETTER: { text: 'Sign Now', route: '/employee/documents' },
      SIGN_CONTRACT: { text: 'Sign Now', route: '/employee/documents' },
      SIGN_NDA: { text: 'Sign Now', route: '/employee/documents' },
      SIGN_HANDBOOK: { text: 'Sign Now', route: '/employee/documents' },
      SIGN_CODE_OF_CONDUCT: { text: 'Sign Now', route: '/employee/documents' },
      COMPLETE_TAX_FORM: { text: 'Complete Form', route: '/employee/tax-forms' },
      ENROLL_BENEFITS: { text: 'Enroll', route: '/employee/benefits' },
      SETUP_DIRECT_DEPOSIT: { text: 'Setup', route: '/employee/payroll' },
      EMERGENCY_CONTACT_INFO: { text: 'Add Info', route: '/employee/profile/edit' },
    };

    const action = actionMap[item.checklistItemType];
    if (!action) return null;

    return (
      <Button 
        type="primary" 
        shape="round"
        icon={<ArrowRightOutlined />}
        onClick={() => navigate(action.route)}
        className="action-button"
      >
        {action.text}
      </Button>
    );
  };

  const pendingItems = checklist.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS');
  const completedItems = checklist.filter(i => i.status === 'COMPLETED');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderSidebar = () => (
    <div className="onboarding-sidebar">
      <div className="sidebar-header">
        <RocketOutlined className="sidebar-logo" />
        <Title level={4} style={{ margin: 0, color: '#fff' }}>Onboarding</Title>
      </div>
      
      <div className="sidebar-menu">
        <div 
          className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <DashboardOutlined /> Overview
        </div>
        <div 
          className={`menu-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <ClockCircleOutlined /> Pending Tasks
          {pendingItems.length > 0 && <span className="badge">{pendingItems.length}</span>}
        </div>
        <div 
          className={`menu-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircleOutlined /> Completed
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="progress-mini">
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Completion</Text>
          <Progress 
            percent={status?.completionPercentage || 0} 
            size="small" 
            showInfo={false} 
            strokeColor="#52c41a" 
            trailColor="rgba(255,255,255,0.2)"
          />
          <Text style={{ color: '#fff', fontSize: 12 }}>{status?.completionPercentage}%</Text>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="overview-container"
    >
      <motion.div variants={itemVariants} className="welcome-section">
        <Title level={2}>Welcome to the Team!</Title>
        <Paragraph type="secondary">
          We're excited to have you on board. Please complete the following steps to get started.
        </Paragraph>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <motion.div variants={itemVariants}>
            <Card className="progress-card premium-card">
              <Row align="middle" gutter={24}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    percent={status?.completionPercentage} 
                    width={120}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                  />
                </Col>
                <Col span={16}>
                  <Title level={3} style={{ marginBottom: 8 }}>
                    {status?.allMandatoryComplete ? "You're All Set!" : "Keep Going!"}
                  </Title>
                  <Paragraph type="secondary">
                    {status?.allMandatoryComplete 
                      ? "You've completed all mandatory onboarding tasks. Great job!" 
                      : `You have ${status?.mandatoryItems! - status?.mandatoryCompleted!} mandatory tasks remaining.`}
                  </Paragraph>
                  {!status?.allMandatoryComplete && (
                    <Button type="primary" size="large" onClick={() => setActiveTab('pending')}>
                      Continue Onboarding
                    </Button>
                  )}
                </Col>
              </Row>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
            <Title level={4}>Up Next</Title>
            {pendingItems.slice(0, 3).map((item, index) => (
              <Card key={item.id} className="task-card-compact premium-card" style={{ marginBottom: 16 }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space>
                      <Avatar icon={getItemIcon(item.checklistItemType)} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />
                      <div>
                        <Text strong>{item.checklistItemName}</Text>
                        <div className="task-meta">
                          {item.isMandatory && <Tag color="red">Mandatory</Tag>}
                          {item.dueDate && <Text type="secondary" style={{ fontSize: 12 }}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>}
                        </div>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    {getActionButton(item)}
                  </Col>
                </Row>
              </Card>
            ))}
            {pendingItems.length === 0 && (
              <Empty description="No pending tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </motion.div>
        </Col>

        <Col span={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card className="stats-card premium-card">
              <Statistic 
                title="Mandatory Tasks" 
                value={status?.mandatoryCompleted} 
                suffix={`/ ${status?.mandatoryItems}`}
                prefix={<SafetyCertificateOutlined />} 
              />
              <Divider style={{ margin: '12px 0' }} />
              <Statistic 
                title="Total Tasks" 
                value={status?.completedItems} 
                suffix={`/ ${status?.totalItems}`}
                prefix={<UnorderedListOutlined />} 
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );

  const renderTaskList = (items: OnboardingChecklistItem[], emptyMsg: string) => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Title level={3}>{activeTab === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}</Title>
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col span={24} key={item.id}>
            <motion.div variants={itemVariants}>
              <Card className="task-card-detailed premium-card">
                <Row align="middle">
                  <Col flex="60px">
                    <div className={`icon-wrapper ${item.status === 'COMPLETED' ? 'completed' : 'pending'}`}>
                      {getItemIcon(item.checklistItemType)}
                    </div>
                  </Col>
                  <Col flex="auto">
                    <div className="task-content">
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Title level={5} style={{ margin: 0, textDecoration: item.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                            {item.checklistItemName}
                          </Title>
                          <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            {item.description || 'No description provided'}
                          </Paragraph>
                          <Space style={{ marginTop: 8 }}>
                            {item.isMandatory && <Tag color="red">Mandatory</Tag>}
                            {item.dueDate && (
                              <Tag icon={<ClockCircleOutlined />} color="warning">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </Tag>
                            )}
                            {item.completedAt && (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                Completed: {new Date(item.completedAt).toLocaleDateString()}
                              </Tag>
                            )}
                          </Space>
                        </Col>
                        <Col>
                          {getActionButton(item)}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
      {items.length === 0 && <Empty description={emptyMsg} />}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading your onboarding journey..." />
      </div>
    );
  }

  return (
    <div className="onboarding-page-layout">
      {renderSidebar()}
      <div className="onboarding-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'pending' && renderTaskList(pendingItems, "You're all caught up!")}
            {activeTab === 'completed' && renderTaskList(completedItems, "No completed tasks yet.")}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
