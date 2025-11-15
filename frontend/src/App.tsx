import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SetPasswordPage } from './pages/SetPasswordPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OrganizationsPage } from './pages/superadmin/OrganizationsPage';
import { CreateOrganizationPage } from './pages/superadmin/CreateOrganizationPage';
import { CreateOrgAdminPage } from './pages/superadmin/CreateOrgAdminPage';
import { EmployeesPage } from './pages/orgadmin/EmployeesPage';
import { CreateEmployeePage } from './pages/orgadmin/CreateEmployeePage';
import { DashboardPage } from './pages/employee/DashboardPage';
import { MyDocumentsPage } from './pages/documents/MyDocumentsPage';
import { UploadMyDocumentPage } from './pages/documents/UploadMyDocumentPage';
import { UploadEmployeeDocumentPage } from './pages/documents/UploadEmployeeDocumentPage';
import { OrgDocumentsPage } from './pages/documents/OrgDocumentsPage';
import { MyIncomingRequestsPage } from './pages/documentRequests/MyIncomingRequestsPage';
import { MyOutgoingRequestsPage } from './pages/documentRequests/MyOutgoingRequestsPage';
import { OrgDocumentRequestsPage } from './pages/documentRequests/OrgDocumentRequestsPage';
import { DepartmentsPage } from './pages/admin/structure/DepartmentsPage';
import { CreateDepartmentPage } from './pages/admin/structure/CreateDepartmentPage';
import { PositionsPage } from './pages/admin/structure/PositionsPage';
import { CreatePositionPage } from './pages/admin/structure/CreatePositionPage';
import { EmployeeListPage } from './pages/admin/employees/EmployeeListPage';
import { EmployeeDetailPage } from './pages/admin/employees/EmployeeDetailPage';
import { EmployeeAssignmentPage } from './pages/admin/employees/EmployeeAssignmentPage';
import { EmployeeHistoryPage } from './pages/admin/employees/EmployeeHistoryPage';
import { EmployeeTreePage } from './pages/admin/employees/EmployeeTreePage';
import { PermissionGroupsPage } from './pages/admin/permissions/PermissionGroupsPage';
import { PermissionGroupDetailPage } from './pages/admin/permissions/PermissionGroupDetailPage';
import { EmployeePermissionsPage } from './pages/orgadmin/EmployeePermissionsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* SuperAdmin routes */}
        <Route
          path="/superadmin/organizations"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <OrganizationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/create-organization"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <CreateOrganizationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/orgadmin/:orgId"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <CreateOrgAdminPage />
            </ProtectedRoute>
          }
        />

        {/* OrgAdmin routes */}
        <Route
          path="/orgadmin/employees"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orgadmin/create-employee"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orgadmin/employees/:employeeId/permissions"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeePermissionsPage />
            </ProtectedRoute>
          }
        />

        {/* Employee routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Documents */}
        <Route
          path="/documents/me"
          element={
            <ProtectedRoute>
              <MyDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/upload"
          element={
            <ProtectedRoute>
              <UploadMyDocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/employee/:employeeId/upload"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <UploadEmployeeDocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/org"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <OrgDocumentsPage />
            </ProtectedRoute>
          }
        />

        {/* Document Requests */}
        <Route
          path="/document-requests/me"
          element={
            <ProtectedRoute>
              <MyIncomingRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-requests/my"
          element={
            <ProtectedRoute>
              <MyOutgoingRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-requests/org"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <OrgDocumentRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Org structure */}
        <Route
          path="/admin/structure/departments"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/departments/new"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <CreateDepartmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/positions"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <PositionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/structure/positions/new"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <CreatePositionPage />
            </ProtectedRoute>
          }
        />

        {/* Employees */}
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId/assignment"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeeAssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:employeeId/history"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeeHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/tree"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <EmployeeTreePage />
            </ProtectedRoute>
          }
        />

        {/* Permissions */}
        <Route
          path="/admin/permissions/groups"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <PermissionGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions/groups/:groupId"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <PermissionGroupDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
