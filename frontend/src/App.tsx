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

// OrgAdmin Pages
import { EmployeesPage } from './pages/orgadmin/EmployeesPage';
import { CreateEmployeePage } from './pages/orgadmin/CreateEmployeePage';
import { EmployeePermissionsPage } from './pages/orgadmin/EmployeePermissionsPage';

// Employee Pages
import { DashboardPage } from './pages/employee/DashboardPage';

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

// Admin Pages - Permissions
import { PermissionGroupsPage } from './pages/admin/permissions/PermissionGroupsPage';
import { PermissionGroupDetailPage } from './pages/admin/permissions/PermissionGroupDetailPage';

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

        {/* OrgAdmin Routes */}
        <Route
          path="/orgadmin/employees"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <EmployeesPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orgadmin/create-employee"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <CreateEmployeePage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
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
                <DashboardPage />
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
          path="/document-requests/me"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MyIncomingRequestsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-requests/my"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MyOutgoingRequestsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
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

        {/* Permission Management Routes */}
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

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
