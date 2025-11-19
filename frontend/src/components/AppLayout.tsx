import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Typography, Space, Button, Grid, Badge, Popover, List, Empty } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  SettingOutlined,
  MenuOutlined,
  DashboardOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { authApi } from '../api/authApi';
import { Breadcrumbs } from './Breadcrumbs';
import { QuickActionButton } from './QuickActionButton';
import { CommandPalette } from './CommandPalette';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles, user, hasPermission } = useAuth();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(!screens.lg);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore errors
    }
    navigate('/login');
  };

  // Mock notifications - in real app, fetch from API
  const notifications: any[] = [
    // { id: 1, title: 'Document request approved', time: '2 hours ago', type: 'success' },
    // { id: 2, title: 'New employee added', time: '5 hours ago', type: 'info' },
  ];

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        fontWeight: 600,
        fontSize: 16
      }}>
        Notifications
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.time}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: '32px 16px' }}
          />
        )}
      </div>
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <Button type="link" size="small">View all notifications</Button>
      </div>
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'email',
      label: (
        <Text strong style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {user?.email}
        </Text>
      ),
      disabled: true,
    },
    {
      key: 'roles',
      label: (
        <Text type="secondary" style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {roles.join(', ')}
        </Text>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const getMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    // Superadmin: Organizations (role-based, not permission-based)
    if (roles.includes('superadmin')) {
      items.push({
        key: '/superadmin/organizations',
        icon: <BankOutlined />,
        label: 'Organizations',
        onClick: () => navigate('/superadmin/organizations'),
      });
    }

    // Dashboard (for all employees)
    if (roles.includes('employee')) {
      items.push({
        key: '/employee/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/employee/dashboard'),
      });
    }

    // Employee Management (permission-based)
    if (hasPermission('employees:view:organization') ||
        hasPermission('employees:view:department') ||
        hasPermission('employees:view:team')) {
      items.push({
        key: 'employees',
        icon: <TeamOutlined />,
        label: 'Employees',
        children: [
          {
            key: '/admin/employees',
            label: 'All Employees',
            onClick: () => navigate('/admin/employees'),
          },
          {
            key: '/admin/employees/tree',
            label: 'Organization Chart',
            onClick: () => navigate('/admin/employees/tree'),
          },
        ],
      });
    }

    // Organization Structure (permission-based)
    if (hasPermission('departments:view:organization') ||
        hasPermission('positions:view:organization')) {
      const structureChildren = [];

      if (hasPermission('departments:view:organization')) {
        structureChildren.push({
          key: '/admin/structure/departments',
          label: 'Departments',
          onClick: () => navigate('/admin/structure/departments'),
        });
      }

      if (hasPermission('positions:view:organization')) {
        structureChildren.push({
          key: '/admin/structure/positions',
          label: 'Positions',
          onClick: () => navigate('/admin/structure/positions'),
        });
      }

      if (structureChildren.length > 0) {
        items.push({
          key: 'structure',
          icon: <ApartmentOutlined />,
          label: 'Organization Structure',
          children: structureChildren,
        });
      }
    }

    // Organization Documents (permission-based)
    if (hasPermission('documents:view:organization') ||
        hasPermission('documents:view:department') ||
        hasPermission('documents:view:team')) {
      const docChildren = [];

      docChildren.push({
        key: '/documents/org',
        label: 'Organization Documents',
        onClick: () => navigate('/documents/org'),
      });

      // Document Requests creation (permission-based)
      if (hasPermission('document-requests:create:organization') ||
          hasPermission('document-requests:create:department') ||
          hasPermission('document-requests:create:team')) {
        docChildren.push({
          key: '/document-requests/org',
          label: 'Document Requests',
          onClick: () => navigate('/document-requests/org'),
        });
      }

      items.push({
        key: 'documents',
        icon: <FileTextOutlined />,
        label: 'Documents',
        children: docChildren,
      });
    }

    // Access Control (permission-based)
    if (hasPermission('roles:view:organization')) {
      const accessChildren = [];

      if (hasPermission('roles:view:organization')) {
        accessChildren.push({
          key: '/admin/roles',
          label: 'Roles',
          onClick: () => navigate('/admin/roles'),
        });
      }

      accessChildren.push({
        key: '/admin/permissions/groups',
        label: 'Permission Groups',
        onClick: () => navigate('/admin/permissions/groups'),
      });

      items.push({
        key: 'access-control',
        icon: <SafetyCertificateOutlined />,
        label: 'Access Control',
        children: accessChildren,
      });
    }

    // My Documents (for regular employees or those without org-level access)
    if (hasPermission('documents:view:own') &&
        !hasPermission('documents:view:organization')) {
      items.push({
        key: '/documents/me',
        icon: <FileTextOutlined />,
        label: 'My Documents',
        onClick: () => navigate('/documents/me'),
      });
    }

    // Document Requests (for regular employees)
    if (hasPermission('document-requests:view:own')) {
      items.push({
        key: 'my-requests',
        icon: <FileTextOutlined />,
        label: 'Document Requests',
        children: [
          {
            key: '/document-requests/me',
            label: 'Requests for Me',
            onClick: () => navigate('/document-requests/me'),
          },
          {
            key: '/document-requests/my',
            label: 'Requests I Sent',
            onClick: () => navigate('/document-requests/my'),
          },
        ],
      });
    }

    return items;
  };

  const selectedKeys = [location.pathname];

  // Determine which submenu to keep open based on current path
  const getOpenKeys = () => {
    if (location.pathname.startsWith('/admin/employees')) return ['employees'];
    if (location.pathname.startsWith('/admin/structure')) return ['structure'];
    if (location.pathname.startsWith('/admin/roles') || location.pathname.startsWith('/admin/permissions')) return ['access-control'];
    if (location.pathname.startsWith('/documents')) return ['documents'];
    if (location.pathname.startsWith('/document-requests')) return ['my-requests'];
    return [];
  };

  const openKeys = getOpenKeys();

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-4 lg:px-6" style={{ background: '#0a0d54' }}>
        <div className="flex items-center gap-4">
          {screens.lg === false && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#fff' }}
            />
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Text strong style={{ color: '#0a0d54', fontSize: '16px' }}>HR</Text>
            </div>
            <Text strong style={{ color: '#fff', fontSize: screens.xs ? '16px' : '20px' }}>
              Enterprise HRMS
            </Text>
          </div>
        </div>
        <Space size={16}>
          {/* Help Button */}
          <Button
            type="text"
            icon={<QuestionCircleOutlined style={{ fontSize: 20, color: '#fff' }} />}
            onClick={() => window.open('https://docs.example.com/hrms', '_blank')}
            style={{
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              height: 'auto',
              padding: '4px 8px'
            }}
            title="Help & Documentation"
          />

          {/* Notifications */}
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            open={notificationsVisible}
            onOpenChange={setNotificationsVisible}
          >
            <Badge count={notifications.length} overflowCount={9} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20, color: '#fff' }} />}
                style={{
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  height: 'auto',
                  padding: '4px 8px'
                }}
              />
            </Badge>
          </Popover>

          {/* User Menu */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#15195c' }} />
            {screens.sm && (
              <Text
                style={{
                  color: '#fff',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email?.split('@')[0]}
              </Text>
            )}
            </Space>
          </Dropdown>
        </Space>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={screens.xs ? 0 : 80}
          width={240}
          style={{ background: '#fff' }}
          trigger={screens.lg ? undefined : null}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={getMenuItems()}
            style={{ height: '100%', borderRight: 0, paddingTop: 8 }}
          />
        </Sider>
        <Content style={{ background: '#dde4eb', minHeight: 'calc(100vh - 64px)' }}>
          <Breadcrumbs />
          <div className="p-4 lg:p-6">
            {children}
          </div>
          <QuickActionButton />
          <CommandPalette />
        </Content>
      </Layout>
    </Layout>
  );
};
