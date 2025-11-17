import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Typography, Space, Button, Grid } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { authApi } from '../api/authApi';
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore errors
    }
    navigate('/login');
  };

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

    if (roles.includes('superadmin')) {
      items.push({
        key: '/superadmin/organizations',
        icon: <BankOutlined />,
        label: 'Organizations',
        onClick: () => navigate('/superadmin/organizations'),
      });
    }

    if (roles.includes('employee')) {
      items.push({
        key: '/employee/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/employee/dashboard'),
      });
    }

    if (roles.includes('orgadmin')) {
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

      items.push({
        key: 'structure',
        icon: <ApartmentOutlined />,
        label: 'Organization Structure',
        children: [
          {
            key: '/admin/structure/departments',
            label: 'Departments',
            onClick: () => navigate('/admin/structure/departments'),
          },
          {
            key: '/admin/structure/positions',
            label: 'Positions',
            onClick: () => navigate('/admin/structure/positions'),
          },
        ],
      });

      items.push({
        key: 'documents',
        icon: <FileTextOutlined />,
        label: 'Documents',
        children: [
          {
            key: '/documents/org',
            label: 'Organization Documents',
            onClick: () => navigate('/documents/org'),
          },
          {
            key: '/document-requests/org',
            label: 'Document Requests',
            onClick: () => navigate('/document-requests/org'),
          },
        ],
      });

      items.push({
        key: 'access-control',
        icon: <SafetyCertificateOutlined />,
        label: 'Access Control',
        children: [
          {
            key: '/admin/roles',
            label: 'Roles',
            onClick: () => navigate('/admin/roles'),
          },
          {
            key: '/admin/permissions/groups',
            label: 'Permission Groups',
            onClick: () => navigate('/admin/permissions/groups'),
          },
        ],
      });
    } else if (roles.includes('employee')) {
      items.push({
        key: '/documents/me',
        icon: <FileTextOutlined />,
        label: 'My Documents',
        onClick: () => navigate('/documents/me'),
      });

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
        <Content className="p-4 lg:p-6" style={{ background: '#dde4eb', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
