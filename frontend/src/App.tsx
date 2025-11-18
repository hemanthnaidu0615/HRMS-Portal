import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './auth/useAuth';
import { getMenuItemsByRole } from './config/navigation';

// Auth Pages
import { LoginPage, SetPasswordPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth';

// SuperAdmin Pages
import { OrganizationsPage } from './pages/superadmin/OrganizationsPage';
import { CreateOrganizationPage } from './pages/superadmin/CreateOrganizationPage';
import { CreateOrgAdminPage } from './pages/superadmin/CreateOrgAdminPage';

// OrgAdmin Pages (Legacy - being phased out)
import { CreateEmployeePage } from './pages/orgadmin/CreateEmployeePage';
import { EmployeePermissionsPage } from './pages/orgadmin/EmployeePermissionsPage';

// Employee Pages
import { DashboardPage } from './pages/employee/DashboardPage';

// Dashboard Pages
import { EmployeeDashboardPage } from './pages/dashboards/EmployeeDashboardPage';
import { AdminDashboardPage } from './pages/dashboards/AdminDashboardPage';
import { SuperAdminDashboardPage } from './pages/dashboards/SuperAdminDashboardPage';

// Profile Pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { PermissionsPage } from './pages/profile/PermissionsPage';

// Document Pages
import { MyDocumentsPage } from './pages/documents/MyDocumentsPage';
import { UploadMyDocumentPage } from './pages/documents/UploadMyDocumentPage';
import { UploadEmployeeDocumentPage } from './pages/documents/UploadEmployeeDocumentPage';
import { OrgDocumentsPage } from './pages/documents/OrgDocumentsPage';

// Document Request Pages
import { MyIncomingRequestsPage } from './pages/documentRequests/MyIncomingRequestsPage';
import { MyOutgoingRequestsPage } from './pages/documentRequests/MyOutgoingRequestsPage';
import { OrgDocumentRequestsPage } from './pages/documentRequests/OrgDocumentRequestsPage';

// Admin Pages - Structure
import { DepartmentsPage } from './pages/admin/structure/DepartmentsPage';
import { CreateDepartmentPage } from './pages/admin/structure/CreateDepartmentPage';
import { PositionsPage } from './pages/admin/structure/PositionsPage';
import { CreatePositionPage } from './pages/admin/structure/CreatePositionPage';

// Admin Pages - Employees
import { EmployeeListPage } from './pages/admin/employees/EmployeeListPage';
import { EmployeeDetailPage } from './pages/admin/employees/EmployeeDetailPage';
import { EmployeeAssignmentPage } from './pages/admin/employees/EmployeeAssignmentPage';
import { EmployeeHistoryPage } from './pages/admin/employees/EmployeeHistoryPage';
import { EmployeeTreePage } from './pages/admin/employees/EmployeeTreePage';
import { BulkImportPage } from './pages/admin/employees/BulkImportPage';

// Admin Pages - Permissions
import { PermissionGroupsPage } from './pages/admin/permissions/PermissionGroupsPage';
import { PermissionGroupDetailPage } from './pages/admin/permissions/PermissionGroupDetailPage';
import { SimplePermissionsPage } from './pages/admin/permissions/SimplePermissionsPage';

// Admin Pages - Roles
import { RolesPage } from './pages/admin/roles/RolesPage';
import { CreateRolePage } from './pages/admin/roles/CreateRolePage';
import { EditRolePage } from './pages/admin/roles/EditRolePage';

// Admin Pages - Audit Logs
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Admin Pages - Vendors
import { VendorListPage } from './pages/admin/vendors/VendorListPage';
import { VendorFormPage } from './pages/admin/vendors/VendorFormPage';

// Admin Pages - Clients
import { ClientListPage } from './pages/admin/clients/ClientListPage';
import { ClientFormPage } from './pages/admin/clients/ClientFormPage';

// Admin Pages - Projects
import { ProjectListPage } from './pages/admin/projects/ProjectListPage';
import { ProjectFormPage } from './pages/admin/projects/ProjectFormPage';

/**
 * Layout Wrapper Component
 * Wraps authenticated routes with AppLayout and role-based navigation
 */
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const menuItems = getMenuItemsByRole(roles);

  return <AppLayout menuItems={menuItems}>{children}</AppLayout>;
};

/**
 * Premium HRMS Application
 * Complete redesign with modern Ant Design UI
 */
function App() {
  return (
    <div>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes with AppLayout */}
        {/* SuperAdmin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <LayoutWrapper>
                <SuperAdminDashboardPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/organizations"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <LayoutWrapper>
                <OrganizationsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/create-organization"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <LayoutWrapper>
                <CreateOrganizationPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/orgadmin/:orgId"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <LayoutWrapper>
                <CreateOrgAdminPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* OrgAdmin Routes (Legacy - redirecting to new admin routes) */}
        <Route path="/orgadmin/employees" element={<Navigate to="/admin/employees" replace />} />
        <Route path="/orgadmin/create-employee" element={<Navigate to="/admin/employees/create" replace />} />
        <Route
          path="/orgadmin/employees/:employeeId/permissions"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeePermissionsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <LayoutWrapper>
                <EmployeeDashboardPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <AdminDashboardPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <ProfilePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PermissionsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Document Routes */}
        <Route
          path="/documents/me"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MyDocumentsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/upload"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <UploadMyDocumentPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/employee/:employeeId/upload"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <UploadEmployeeDocumentPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/org"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <OrgDocumentsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Document Request Routes */}
        <Route
          path="/document-requests/incoming"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MyIncomingRequestsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-requests/outgoing"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MyOutgoingRequestsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        {/* Legacy redirects */}
        <Route path="/document-requests/me" element={<Navigate to="/document-requests/incoming" replace />} />
        <Route path="/document-requests/my" element={<Navigate to="/document-requests/outgoing" replace />} />
        <Route
          path="/document-requests/org"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <OrgDocumentRequestsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Organization Structure Routes */}
        <Route
          path="/admin/structure/departments"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <DepartmentsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/departments/new"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <CreateDepartmentPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/positions"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <PositionsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/positions/new"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <CreatePositionPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Employee Management Routes */}
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeeListPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/create"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <CreateEmployeePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/import"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <BulkImportPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/tree"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeeTreePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeeDetailPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId/assignment"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeeAssignmentPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId/history"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeeHistoryPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Permission Management Routes */}
        <Route
          path="/admin/permissions/employee/:employeeId"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <SimplePermissionsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions/groups"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <PermissionGroupsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions/groups/:groupId"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <PermissionGroupDetailPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Role Management Routes */}
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <RolesPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/create"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <CreateRolePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/:roleId/edit"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EditRolePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Audit Logs Route */}
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <AuditLogsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Vendor Management Routes */}
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <VendorListPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/create"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <VendorFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/:id/edit"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <VendorFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Client Management Routes */}
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ClientListPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/create"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ClientFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:id/edit"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ClientFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Project Management Routes */}
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ProjectListPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects/create"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ProjectFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects/:id/edit"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <ProjectFormPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
