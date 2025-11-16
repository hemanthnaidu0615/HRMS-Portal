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
      label: <Text strong>{user?.email}</Text>,
      disabled: true,
    },
    {
      key: 'roles',
      label: <Text type="secondary">{roles.join(', ')}</Text>,
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
        key: 'organization',
        icon: <ApartmentOutlined />,
        label: 'Organization',
        children: [
          {
            key: '/admin/employees',
            label: 'Employees',
            icon: <TeamOutlined />,
            onClick: () => navigate('/admin/employees'),
          },
          {
            key: '/admin/employees/tree',
            label: 'Org Chart',
            icon: <ApartmentOutlined />,
            onClick: () => navigate('/admin/employees/tree'),
          },
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
        key: '/documents-requests',
        icon: <FileTextOutlined />,
        label: 'Documents & Requests',
        onClick: () => navigate('/documents-requests'),
      });

      if (hasPermission('VIEW_ORG_DOCS') || hasPermission('UPLOAD_FOR_OTHERS')) {
        items.push({
          key: 'admin',
          icon: <SettingOutlined />,
          label: 'Administration',
          children: [
            {
              key: '/admin/permissions/groups',
              label: 'Permission Groups',
              icon: <SafetyCertificateOutlined />,
              onClick: () => navigate('/admin/permissions/groups'),
            },
          ],
        });
      }
    } else if (roles.includes('employee')) {
      items.push({
        key: '/documents-requests',
        icon: <FileTextOutlined />,
        label: 'Documents & Requests',
        onClick: () => navigate('/documents-requests'),
      });
    }

    return items;
  };

  const selectedKeys = [location.pathname];
  const openKeys = location.pathname.startsWith('/admin') ? ['organization', 'admin'] : [];

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
            {screens.sm && <Text style={{ color: '#fff' }}>{user?.email?.split('@')[0]}</Text>}
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
