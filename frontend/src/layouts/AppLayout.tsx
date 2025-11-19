import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Button,
  Drawer,
  Breadcrumb,
  Badge,
  Input,
  List,
  Divider,
  Switch,
  Tooltip,
  Tag,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MenuOutlined,
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  SwapOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DownOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuProps["items"];
}

/**
 * Premium App Layout Component
 * Modern sidebar + header layout with glass morphism, animations, and premium UX
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  menuItems,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle header shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Fallback to empty array
        setNotifications([]);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        setUnreadCount(0);
      }
    };

    if (user) {
      fetchNotifications();
      fetchUnreadCount();

      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAVE_REQUEST':
        return <CalendarOutlined style={{ color: "#52c41a" }} />;
      case 'TIMESHEET_APPROVAL':
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case 'PAYROLL_UPDATE':
        return <FileTextOutlined style={{ color: "#1890ff" }} />;
      case 'DOCUMENT_REQUEST':
        return <FileTextOutlined style={{ color: "#722ed1" }} />;
      default:
        return <BellOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Quick actions data
  const quickActions = [
    {
      key: "new-leave",
      icon: <CalendarOutlined style={{ color: "#1890ff" }} />,
      label: "Request Leave",
      onClick: () => navigate("/employee/leave/request"),
    },
    {
      key: "new-timesheet",
      icon: <ClockCircleOutlined style={{ color: "#52c41a" }} />,
      label: "Submit Timesheet",
      onClick: () => navigate("/employee/timesheet/new"),
    },
    {
      key: "upload-document",
      icon: <FileTextOutlined style={{ color: "#722ed1" }} />,
      label: "Upload Document",
      onClick: () => navigate("/employee/documents/upload"),
    },
    {
      key: "view-payslip",
      icon: <GlobalOutlined style={{ color: "#fa8c16" }} />,
      label: "View Payslip",
      onClick: () => navigate("/employee/payroll/payslips"),
    },
  ];

  // User dropdown menu
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "my-documents",
      icon: <FileTextOutlined />,
      label: "My Documents",
      onClick: () => navigate("/employee/documents/me"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => setSettingsDrawerOpen(true),
    },
    {
      type: "divider",
    },
    {
      key: "switch-org",
      icon: <SwapOutlined />,
      label: "Switch Organization",
      onClick: () => {
        // Mock organization switcher
        console.log("Switch organization clicked");
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  // Get selected menu key from current path
  const getSelectedKey = () => {
    const path = location.pathname;
    // Find the menu item that matches the current path
    return path;
  };

  const handleMenuClick = (e: { key: string }) => {
  navigate(e.key);
};

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);

    // Path name mappings for better display
    const pathNameMap: Record<string, string> = {
      'admin': 'Admin',
      'superadmin': 'Super Admin',
      'employee': 'Employee',
      'employees': 'Employees',
      'create': 'Create',
      'import': 'Import',
      'tree': 'Organization Chart',
      'assignment': 'Assignment',
      'history': 'History',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'permissions': 'Permissions',
      'documents': 'Documents',
      'me': 'My Documents',
      'org': 'Organization',
      'upload': 'Upload',
      'document-requests': 'Document Requests',
      'my': 'My Requests',
      'structure': 'Structure',
      'departments': 'Departments',
      'positions': 'Positions',
      'new': 'New',
      'groups': 'Groups',
      'roles': 'Roles',
      'edit': 'Edit',
      'organizations': 'Organizations',
    };

    const breadcrumbItems = [
      {
        title: (
          <a onClick={() => navigate('/')}>
            <HomeOutlined />
          </a>
        ),
      },
    ];

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSnippets.length - 1;

      // Skip UUIDs and other technical IDs
      if (snippet.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return;
      }

      const title = pathNameMap[snippet] || snippet.charAt(0).toUpperCase() + snippet.slice(1);

      breadcrumbItems.push({
        title: isLast ? (
          <span>{title}</span>
        ) : (
          <a onClick={() => navigate(url)}>{title}</a>
        ),
      });
    });

    return breadcrumbItems;
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
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: "#ffffff",
        borderRight: "1px solid #e8edf2",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="hide-on-mobile premium-sidebar"
    >
      {/* Logo with hover animation */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 24px",
          borderBottom: "1px solid #e8edf2",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
        className="logo-container"
      >
        {collapsed ? (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0a0d54 0%, #15195c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 16,
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(10, 13, 84, 0.2)",
            }}
            className="logo-icon"
          >
            HR
          </div>
        ) : (
          <Space size={12}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0a0d54 0%, #15195c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(10, 13, 84, 0.2)",
              }}
              className="logo-icon"
            >
              HR
            </div>
            <Text
              strong
              style={{
                fontSize: 17,
                color: "#111111",
                letterSpacing: "-0.03em",
                fontWeight: 700,
              }}
            >
              HRMS Portal
            </Text>
          </Space>
        )}
      </div>

      {/* Menu with scrollable container */}
      <div
        style={{
          height: "calc(100vh - 128px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        className="menu-scroll-container"
      >
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: "none",
            padding: "12px 8px",
          }}
          className="premium-menu"
        />
      </div>

      {/* Sidebar Footer with version */}
      <div
        style={{
          height: 64,
          borderTop: "1px solid #e8edf2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: collapsed ? "0" : "0 24px",
          background: "#fafbfc",
          transition: "all 0.3s",
        }}
      >
        {collapsed ? (
          <Tooltip title="v1.0.0" placement="right">
            <AppstoreOutlined style={{ fontSize: 18, color: "#8c8c8c" }} />
          </Tooltip>
        ) : (
          <Space direction="vertical" size={0} style={{ width: "100%" }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>
              HRMS Portal
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Version 1.0.0
            </Text>
          </Space>
        )}
      </div>
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
        header: { display: "none" },
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: "1px solid #e8edf2",
        }}
      >
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0a0d54 0%, #15195c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            HR
          </div>
          <Text strong style={{ fontSize: 16, color: "#111111" }}>
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
          border: "none",
          padding: "12px 8px",
        }}
      />
    </Drawer>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {DesktopSidebar}

      {/* Mobile Drawer */}
      {MobileSidebar}

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: window.innerWidth < 768 ? 0 : collapsed ? 80 : 256,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Premium Header with Glass Morphism */}
        <Header
          style={{
            padding: "0 24px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: headerScrolled
              ? "1px solid transparent"
              : "1px solid #e8edf2",
            backgroundImage: headerScrolled
              ? "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95))"
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: headerScrolled
              ? "0 4px 20px rgba(0, 0, 0, 0.08)"
              : "0 1px 4px rgba(0, 0, 0, 0.02)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="premium-header"
        >
          {/* Left: Trigger Button & Search */}
          <Space size={16} style={{ flex: 1 }}>
            {/* Desktop Toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hide-on-mobile premium-icon-button"
              style={{
                fontSize: 16,
                width: 48,
                height: 48,
                borderRadius: 10,
                transition: "all 0.3s ease",
              }}
            />

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className="show-on-mobile premium-icon-button"
              style={{
                fontSize: 16,
                width: 48,
                height: 48,
                borderRadius: 10,
              }}
            />

            {/* Global Search Bar */}
            <Input
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search anything... (⌘K)"
              className="hide-on-mobile premium-search"
              style={{
                width: 320,
                height: 40,
                borderRadius: 10,
                border: "1px solid #e8edf2",
                background: "#fafbfc",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#1890ff";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "#fafbfc";
                e.currentTarget.style.borderColor = "#e8edf2";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Space>

          {/* Right: Actions */}
          <Space size={8}>
            {/* Quick Actions */}
            <Dropdown
              open={quickActionsOpen}
              onOpenChange={setQuickActionsOpen}
              dropdownRender={() => (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
                    padding: "12px",
                    minWidth: 280,
                  }}
                >
                  <div style={{ padding: "8px 12px" }}>
                    <Text strong style={{ fontSize: 14 }}>
                      Quick Actions
                    </Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <List
                    dataSource={quickActions}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderRadius: 8,
                          transition: "all 0.2s",
                        }}
                        onClick={() => {
                          item.onClick();
                          setQuickActionsOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f5f7fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Space>
                          {item.icon}
                          <Text>{item.label}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Tooltip title="Quick Actions">
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  className="premium-icon-button hide-on-mobile"
                  style={{
                    fontSize: 16,
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid #e8edf2",
                    transition: "all 0.3s ease",
                  }}
                />
              </Tooltip>
            </Dropdown>

            {/* Theme Toggle */}
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <Button
                type="text"
                icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setDarkMode(!darkMode)}
                className="premium-icon-button hide-on-mobile"
                style={{
                  fontSize: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  transition: "all 0.3s ease",
                }}
              />
            </Tooltip>

            {/* Notifications with Badge */}
            <Dropdown
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
              dropdownRender={() => (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 12,
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
                    padding: "12px",
                    minWidth: 360,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong style={{ fontSize: 14 }}>
                      Notifications
                    </Text>
                    <Badge count={unreadCount} />
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                      <BellOutlined style={{ fontSize: 32, color: "#d9d9d9", marginBottom: 8 }} />
                      <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                        No new notifications
                      </Text>
                    </div>
                  ) : (
                    <List
                      dataSource={notifications}
                      renderItem={(item: any) => (
                        <List.Item
                          style={{
                            padding: "12px",
                            cursor: "pointer",
                            borderRadius: 8,
                            transition: "all 0.2s",
                            background: !item.isRead ? "#f0f5ff" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f5f7fa";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = !item.isRead ? "#f0f5ff" : "transparent";
                          }}
                          onClick={() => {
                            if (item.actionUrl) {
                              navigate(item.actionUrl);
                            }
                            setNotificationsOpen(false);
                          }}
                        >
                          <List.Item.Meta
                            avatar={getNotificationIcon(item.type)}
                            title={
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Text strong style={{ fontSize: 13 }}>
                                  {item.title}
                                </Text>
                                {!item.isRead && (
                                  <span style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#1890ff",
                                  }} />
                                )}
                              </div>
                            }
                            description={
                              <>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {item.message}
                                </Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 11, marginTop: 4 }}
                                >
                                  {formatNotificationTime(item.createdAt)}
                                </Text>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                  <Divider style={{ margin: "8px 0" }} />
                  <Button
                    type="link"
                    block
                    style={{ height: 36 }}
                    onClick={() => {
                      navigate("/notifications");
                      setNotificationsOpen(false);
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Badge count={unreadCount} offset={[-4, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="premium-icon-button"
                  style={{
                    fontSize: 18,
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    transition: "all 0.3s ease",
                  }}
                />
              </Badge>
            </Dropdown>

            {/* User Menu with Avatar */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: 10,
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                }}
                className="user-dropdown-trigger"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e8edf2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <Avatar
                  size={38}
                  style={{
                    background:
                      "linear-gradient(135deg, #0a0d54 0%, #15195c 100%)",
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(10, 13, 84, 0.15)",
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <div className="hide-on-mobile">
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: 14,
                      color: "#111111",
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.email?.split("@")[0] || "User"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user?.roles?.[0] || "Employee"}
                  </Text>
                </div>
                <DownOutlined
                  className="hide-on-mobile"
                  style={{ fontSize: 10, color: "#8c8c8c" }}
                />
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Breadcrumb */}
        {location.pathname !== '/' && location.pathname !== '/login' && (
          <div
            style={{
              padding: "16px 24px",
              background: "#ffffff",
              borderBottom: "1px solid #e8edf2",
            }}
          >
            <Breadcrumb items={generateBreadcrumbs()} />
          </div>
        )}

        {/* Content */}
        <Content
          style={{
            margin: "24px",
            padding: 0,
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined />
            <Text strong>Settings</Text>
          </Space>
        }
        placement="right"
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        width={360}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Theme Settings */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Appearance
            </Text>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#fafbfc",
                borderRadius: 8,
              }}
            >
              <Space>
                {darkMode ? <MoonOutlined /> : <SunOutlined />}
                <Text>Dark Mode</Text>
              </Space>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Notifications
            </Text>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#fafbfc",
                  borderRadius: 8,
                }}
              >
                <Text>Email Notifications</Text>
                <Switch defaultChecked />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#fafbfc",
                  borderRadius: 8,
                }}
              >
                <Text>Push Notifications</Text>
                <Switch defaultChecked />
              </div>
            </Space>
          </div>

          {/* Language Settings */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Language & Region
            </Text>
            <div
              style={{
                padding: "12px 16px",
                background: "#fafbfc",
                borderRadius: 8,
              }}
            >
              <Space>
                <GlobalOutlined />
                <Text>English (US)</Text>
              </Space>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Account
            </Text>
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fafbfc",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Email
                </Text>
                <br />
                <Text strong>{user?.email || "user@example.com"}</Text>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fafbfc",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Role
                </Text>
                <br />
                <Tag color="blue">{user?.roles?.[0] || "Employee"}</Tag>
              </div>
            </Space>
          </div>
        </Space>
      </Drawer>

      {/* Premium CSS Animations */}
      <style>{`
        /* Responsive Classes */
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

        /* Premium Sidebar Animations */
        .premium-sidebar .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
        }

        /* Logo Hover Animation */
        .logo-container:hover .logo-icon {
          transform: scale(1.08) rotate(5deg);
          box-shadow: 0 4px 12px rgba(10, 13, 84, 0.3) !important;
        }

        /* Menu Scroll Container */
        .menu-scroll-container::-webkit-scrollbar {
          width: 6px;
        }

        .menu-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .menu-scroll-container::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 3px;
        }

        .menu-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #bfbfbf;
        }

        /* Premium Menu Item Animations */
        .premium-menu .ant-menu-item,
        .premium-menu .ant-menu-submenu-title {
          margin: 4px 0;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-menu .ant-menu-item:hover,
        .premium-menu .ant-menu-submenu-title:hover {
          transform: translateX(4px);
          background: #f5f7fa !important;
        }

        .premium-menu .ant-menu-item-selected {
          background: linear-gradient(90deg, #e6f7ff 0%, #f0f5ff 100%) !important;
          border-right: 3px solid #1890ff;
          font-weight: 600;
          color: #1890ff !important;
        }

        .premium-menu .ant-menu-item-selected::after {
          display: none;
        }

        /* Active Menu Item Slide-in Animation */
        .premium-menu .ant-menu-item-selected {
          animation: slideInFromLeft 0.3s ease;
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-10px);
            opacity: 0.5;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Icon Rotation on Submenu */
        .premium-menu .ant-menu-submenu-open > .ant-menu-submenu-title .ant-menu-submenu-arrow {
          transform: rotate(180deg);
        }

        .premium-menu .ant-menu-submenu-title .ant-menu-submenu-arrow {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Premium Icon Button Hover */
        .premium-icon-button:hover {
          background: #f5f7fa !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .premium-icon-button:active {
          transform: translateY(0);
        }

        /* Search Bar Focus Animation */
        .premium-search:focus {
          transform: translateY(-1px);
        }

        /* Header Scroll Animation */
        .premium-header {
          animation: fadeInDown 0.3s ease;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* User Dropdown Hover */
        .user-dropdown-trigger:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        /* Dropdown Animation */
        .ant-dropdown {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Notification Badge Pulse */
        .ant-badge-count {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
        }

        /* Gradient Border Bottom */
        .premium-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #1890ff 20%,
            #722ed1 50%,
            #fa8c16 80%,
            transparent 100%
          );
          opacity: 0.3;
        }

        /* Sidebar Collapse Toggle Animation */
        .ant-layout-sider-trigger {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Content Fade In */
        .ant-layout-content {
          animation: contentFadeIn 0.4s ease;
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Breadcrumb Animation */
        .ant-breadcrumb {
          animation: fadeIn 0.3s ease;
        }

        /* Menu Icon Colors (matching module themes) */
        .premium-menu .ant-menu-item .anticon {
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .premium-menu .ant-menu-item:hover .anticon {
          transform: scale(1.1);
        }

        /* Drawer Animation */
        .ant-drawer-content-wrapper {
          animation: slideInFromRight 0.3s ease;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        /* List Item Hover in Dropdowns */
        .ant-list-item {
          transition: all 0.2s ease;
        }

        /* Smooth Page Transitions */
        .ant-layout-content > * {
          animation: pageTransition 0.3s ease;
        }

        @keyframes pageTransition {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Glass Morphism Enhancement */
        @supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
          .premium-header {
            background: rgba(255, 255, 255, 0.7) !important;
          }
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) {
          .premium-search {
            width: 240px !important;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .premium-header {
            padding: 0 16px !important;
          }
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .premium-header {
            background: #ffffff !important;
            backdrop-filter: none !important;
          }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AppLayout;
