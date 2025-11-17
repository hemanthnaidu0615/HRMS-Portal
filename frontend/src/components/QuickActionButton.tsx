import { useState } from 'react';
import { FloatButton, Modal } from 'antd';
import {
  PlusOutlined,
  UserAddOutlined,
  FileTextOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/**
 * Floating Action Button for Quick Actions
 * Shows context-sensitive quick actions based on user role and current page
 */
export const QuickActionButton = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [open, setOpen] = useState(false);

  const isOrgAdmin = roles.includes('orgadmin');
  const isSuperAdmin = roles.includes('superadmin');

  // Don't show FAB on login or public pages
  if (location.pathname.includes('/login') || location.pathname === '/') {
    return null;
  }

  const handleAction = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        open={open}
        onOpenChange={setOpen}
        style={{ right: 24, bottom: 24 }}
        icon={<PlusOutlined />}
        tooltip="Quick Actions"
      >
        {isOrgAdmin && (
          <>
            <FloatButton
              icon={<UserAddOutlined />}
              tooltip="Add Employee"
              onClick={() => handleAction('/admin/employees/create')}
            />
            <FloatButton
              icon={<FileTextOutlined />}
              tooltip="Document Requests"
              onClick={() => handleAction('/document-requests/org')}
            />
            <FloatButton
              icon={<ApartmentOutlined />}
              tooltip="Add Department"
              onClick={() => handleAction('/admin/structure/departments/new')}
            />
            <FloatButton
              icon={<SafetyCertificateOutlined />}
              tooltip="Create Role"
              onClick={() => handleAction('/admin/roles/create')}
            />
          </>
        )}

        {isSuperAdmin && (
          <>
            <FloatButton
              icon={<TeamOutlined />}
              tooltip="Create Organization"
              onClick={() => handleAction('/superadmin/create-organization')}
            />
          </>
        )}

        {!isOrgAdmin && !isSuperAdmin && (
          <>
            <FloatButton
              icon={<FileTextOutlined />}
              tooltip="Upload Document"
              onClick={() => handleAction('/documents/upload')}
            />
            <FloatButton
              icon={<UserAddOutlined />}
              tooltip="My Requests"
              onClick={() => handleAction('/document-requests/my')}
            />
          </>
        )}
      </FloatButton.Group>
    </>
  );
};
