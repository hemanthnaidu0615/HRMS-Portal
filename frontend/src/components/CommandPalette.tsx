import { useState, useEffect } from 'react';
import { Modal, Input, List, Space, Typography } from 'antd';
import {
  SearchOutlined,
  TeamOutlined,
  FileTextOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  BankOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const { Text } = Typography;

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'action';
}

/**
 * Command Palette (Ctrl+K) for Quick Navigation and Actions
 * Allows users to quickly navigate and perform actions using keyboard
 */
export const CommandPalette = () => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { roles } = useAuth();

  const isOrgAdmin = roles.includes('orgadmin');
  const isSuperAdmin = roles.includes('superadmin');
  const isEmployee = roles.includes('employee');

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setVisible(true);
      }
      // Close on Escape
      if (e.key === 'Escape') {
        setVisible(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createCommands = (): Command[] => {
    const commands: Command[] = [];

    // Common commands
    commands.push(
      {
        id: 'profile',
        title: 'Go to Profile',
        description: 'View your profile settings',
        icon: <UserOutlined />,
        action: () => navigate('/profile'),
        keywords: ['profile', 'settings', 'account'],
        category: 'navigation',
      },
      {
        id: 'permissions',
        title: 'My Permissions',
        description: 'View your permissions',
        icon: <SafetyCertificateOutlined />,
        action: () => navigate('/permissions'),
        keywords: ['permissions', 'access', 'rights'],
        category: 'navigation',
      }
    );

    // SuperAdmin commands
    if (isSuperAdmin) {
      commands.push(
        {
          id: 'sa-dashboard',
          title: 'SuperAdmin Dashboard',
          icon: <DashboardOutlined />,
          action: () => navigate('/superadmin/dashboard'),
          keywords: ['dashboard', 'home', 'superadmin'],
          category: 'navigation',
        },
        {
          id: 'organizations',
          title: 'View Organizations',
          description: 'Manage all organizations',
          icon: <BankOutlined />,
          action: () => navigate('/superadmin/organizations'),
          keywords: ['organizations', 'companies', 'tenants'],
          category: 'navigation',
        },
        {
          id: 'create-org',
          title: 'Create Organization',
          description: 'Add a new organization',
          icon: <BankOutlined />,
          action: () => navigate('/superadmin/create-organization'),
          keywords: ['create', 'organization', 'new', 'add'],
          category: 'action',
        }
      );
    }

    // OrgAdmin commands
    if (isOrgAdmin) {
      commands.push(
        {
          id: 'admin-dashboard',
          title: 'Admin Dashboard',
          icon: <DashboardOutlined />,
          action: () => navigate('/admin/dashboard'),
          keywords: ['dashboard', 'home', 'admin'],
          category: 'navigation',
        },
        {
          id: 'employees',
          title: 'View Employees',
          description: 'Manage all employees',
          icon: <TeamOutlined />,
          action: () => navigate('/admin/employees'),
          keywords: ['employees', 'staff', 'team', 'people'],
          category: 'navigation',
        },
        {
          id: 'add-employee',
          title: 'Add Employee',
          description: 'Create a new employee',
          icon: <TeamOutlined />,
          action: () => navigate('/admin/employees/create'),
          keywords: ['add', 'create', 'employee', 'new', 'hire'],
          category: 'action',
        },
        {
          id: 'org-chart',
          title: 'Organization Chart',
          description: 'View organization structure',
          icon: <ApartmentOutlined />,
          action: () => navigate('/admin/employees/tree'),
          keywords: ['org', 'chart', 'tree', 'hierarchy', 'structure'],
          category: 'navigation',
        },
        {
          id: 'departments',
          title: 'Departments',
          description: 'Manage departments',
          icon: <ApartmentOutlined />,
          action: () => navigate('/admin/structure/departments'),
          keywords: ['departments', 'structure', 'divisions'],
          category: 'navigation',
        },
        {
          id: 'positions',
          title: 'Positions',
          description: 'Manage positions',
          icon: <ApartmentOutlined />,
          action: () => navigate('/admin/structure/positions'),
          keywords: ['positions', 'roles', 'jobs', 'titles'],
          category: 'navigation',
        },
        {
          id: 'roles',
          title: 'Roles',
          description: 'Manage roles and permissions',
          icon: <SafetyCertificateOutlined />,
          action: () => navigate('/admin/roles'),
          keywords: ['roles', 'permissions', 'access control'],
          category: 'navigation',
        },
        {
          id: 'doc-requests',
          title: 'Document Requests',
          description: 'View document requests',
          icon: <FileTextOutlined />,
          action: () => navigate('/document-requests/org'),
          keywords: ['documents', 'requests', 'files'],
          category: 'navigation',
        },
        {
          id: 'org-docs',
          title: 'Organization Documents',
          description: 'View shared documents',
          icon: <FolderOutlined />,
          action: () => navigate('/documents/org'),
          keywords: ['documents', 'files', 'shared', 'organization'],
          category: 'navigation',
        }
      );
    }

    // Employee commands
    if (isEmployee && !isOrgAdmin) {
      commands.push(
        {
          id: 'emp-dashboard',
          title: 'Employee Dashboard',
          icon: <DashboardOutlined />,
          action: () => navigate('/employee/dashboard'),
          keywords: ['dashboard', 'home'],
          category: 'navigation',
        },
        {
          id: 'my-docs',
          title: 'My Documents',
          description: 'View your documents',
          icon: <FolderOutlined />,
          action: () => navigate('/documents/me'),
          keywords: ['documents', 'files', 'my'],
          category: 'navigation',
        },
        {
          id: 'upload-doc',
          title: 'Upload Document',
          description: 'Upload a new document',
          icon: <FileTextOutlined />,
          action: () => navigate('/documents/upload'),
          keywords: ['upload', 'document', 'file', 'add'],
          category: 'action',
        },
        {
          id: 'incoming-requests',
          title: 'Incoming Document Requests',
          description: 'Requests from others',
          icon: <FileTextOutlined />,
          action: () => navigate('/document-requests/me'),
          keywords: ['requests', 'incoming', 'documents'],
          category: 'navigation',
        }
      );
    }

    return commands;
  };

  const commands = createCommands();

  const filteredCommands = commands.filter(cmd => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(kw => kw.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (command: Command) => {
    command.action();
    setVisible(false);
    setSearch('');
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={() => {
        setVisible(false);
        setSearch('');
      }}
      footer={null}
      width={600}
      styles={{
        body: { padding: 0 },
      }}
      closeIcon={null}
    >
      <div>
        {/* Search Input */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            autoFocus
            style={{
              border: 'none',
              boxShadow: 'none',
              fontSize: 16
            }}
            suffix={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Press ESC to close
              </Text>
            }
          />
        </div>

        {/* Commands List */}
        <div style={{
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          {filteredCommands.length > 0 ? (
            <List
              dataSource={filteredCommands}
              renderItem={(cmd, index) => (
                <List.Item
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderBottom: index === filteredCommands.length - 1 ? 'none' : '1px solid #f5f5f5'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f8ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Space>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: '#f0f5ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1890ff',
                      fontSize: 16
                    }}>
                      {cmd.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{cmd.title}</div>
                      {cmd.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {cmd.description}
                        </Text>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#999'
            }}>
              No commands found for "{search}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Use ↑↓ to navigate
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Press <kbd style={{ padding: '2px 6px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 3 }}>Ctrl</kbd> + <kbd style={{ padding: '2px 6px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 3 }}>K</kbd> to open
          </Text>
        </div>
      </div>
    </Modal>
  );
};
