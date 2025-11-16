import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuProps['items'];
}

/**
 * Premium App Layout Component
 * Modern sidebar + header layout with responsive design
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children, menuItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // Get selected menu key from current path
  const getSelectedKey = () => {
    const path = location.pathname;
    // Find the menu item that matches the current path
    return path;
  };

  // Handle menu click navigation
  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  // Desktop sidebar
  const DesktopSidebar = (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#ffffff',
        borderRight: '1px solid #e8edf2',
        boxShadow: '1px 0 4px rgba(0, 0, 0, 0.02)',
      }}
      className="hide-on-mobile"
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid #e8edf2',
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            HR
          </div>
        ) : (
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              HR
            </div>
            <Text
              strong
              style={{
                fontSize: 16,
                color: '#111111',
                letterSpacing: '-0.02em',
              }}
            >
              HRMS Portal
            </Text>
          </Space>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          padding: '12px 8px',
        }}
      />
    </Sider>
  );

  // Mobile drawer sidebar
  const MobileSidebar = (
    <Drawer
      placement="left"
      onClose={() => setMobileDrawerOpen(false)}
      open={mobileDrawerOpen}
      width={280}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #e8edf2',
        }}
      >
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            HR
          </div>
          <Text strong style={{ fontSize: 16, color: '#111111' }}>
            HRMS Portal
          </Text>
        </Space>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={(e) => {
          handleMenuClick(e);
          setMobileDrawerOpen(false);
        }}
        style={{
          border: 'none',
          padding: '12px 8px',
        }}
      />
    </Drawer>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {DesktopSidebar}

      {/* Mobile Drawer */}
      {MobileSidebar}

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: window.innerWidth < 768 ? 0 : collapsed ? 80 : 256,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            borderBottom: '1px solid #e8edf2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Left: Trigger Button */}
          <Space size={16}>
            {/* Desktop Toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hide-on-mobile"
              style={{
                fontSize: 16,
                width: 48,
                height: 48,
              }}
            />

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className="show-on-mobile"
              style={{
                fontSize: 16,
                width: 48,
                height: 48,
              }}
            />
          </Space>

          {/* Right: Actions */}
          <Space size={16}>
            {/* Notifications */}
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                fontSize: 18,
                width: 40,
                height: 40,
              }}
            />

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  size={36}
                  style={{
                    background: 'linear-gradient(135deg, #0a0d54 0%, #15195c 100%)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <div className="hide-on-mobile">
                  <Text strong style={{ display: 'block', fontSize: 14, color: '#111111' }}>
                    {user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user?.roles?.[0] || 'Employee'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px',
            padding: 0,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
          .show-on-mobile {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .show-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AppLayout;
