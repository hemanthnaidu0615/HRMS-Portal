import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './auth/useAuth';
import { getMenuItemsByRole } from './config/navigation';
import { premiumTheme } from './theme/premiumTheme';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth Pages
import { LoginPage, SetPasswordPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth';

// SuperAdmin Pages
import { OrganizationsPage } from './pages/superadmin/OrganizationsPage';
import { CreateOrganizationPage } from './pages/superadmin/CreateOrganizationPage';
import { CreateOrgAdminPage } from './pages/superadmin/CreateOrgAdminPage';
import { OrganizationModulesPage } from './pages/superadmin/OrganizationModulesPage';

// OrgAdmin Pages (Legacy - being phased out)
import { CreateEmployeePage } from './pages/orgadmin/CreateEmployeePage';
import { EmployeePermissionsPage } from './pages/orgadmin/EmployeePermissionsPage';

// Dashboard Pages
import { EmployeeDashboardPage } from './pages/dashboards/EmployeeDashboardPage';
import { EnhancedAdminDashboard } from './pages/dashboards/EnhancedAdminDashboard';
import { SuperAdminDashboardPage } from './pages/dashboards/SuperAdminDashboardPage';

// Profile Pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { PermissionsPage } from './pages/profile/PermissionsPage';

// Notification Pages
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationPreferencesPage from './pages/notifications/NotificationPreferencesPage';

// Document Pages
import { MyDocumentsPage } from './pages/documents/MyDocumentsPage';
import { UploadMyDocumentPage } from './pages/documents/UploadMyDocumentPage';
import { UploadEmployeeDocumentPage } from './pages/documents/UploadEmployeeDocumentPage';
import { OrgDocumentsPage } from './pages/documents/OrgDocumentsPage';

// Document Signing Pages
import { MyDocumentsPage as MyDocumentsSigningPage } from './pages/employee/MyDocumentsPage';
import { OnboardingChecklistPage } from './pages/employee/OnboardingChecklistPage';
import { DocumentManagementPage } from './pages/orgadmin/DocumentManagementPage';

// Document Request Pages
import { MyIncomingRequestsPage } from './pages/documentRequests/MyIncomingRequestsPage';
import { MyOutgoingRequestsPage } from './pages/documentRequests/MyOutgoingRequestsPage';
import { OrgDocumentRequestsPage } from './pages/documentRequests/OrgDocumentRequestsPage';
import { RequestDocumentPage } from './pages/documentRequests/RequestDocumentPage';

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

// Attendance Pages
import AttendanceRecordsListPage from './pages/admin/attendance/records';
import AttendanceRecordsFormPage from './pages/admin/attendance/records/FormPage';
import RegularizationListPage from './pages/admin/attendance/regularization';
import RegularizationFormPage from './pages/admin/attendance/regularization/FormPage';
import ShiftsListPage from './pages/admin/attendance/shifts';
import ShiftsFormPage from './pages/admin/attendance/shifts/FormPage';

// Leave Pages
import LeaveApplicationsListPage from './pages/admin/leave/applications';
import LeaveApplicationsFormPage from './pages/admin/leave/applications/FormPage';
import LeaveBalancesListPage from './pages/admin/leave/balances';
import LeaveTypesListPage from './pages/admin/leave/types';
import LeaveTypesFormPage from './pages/admin/leave/types/FormPage';

// Timesheet Pages
import TimesheetEntriesListPage from './pages/admin/timesheet/entries';
import TimesheetEntriesFormPage from './pages/admin/timesheet/entries/FormPage';
import TimesheetApprovalsListPage from './pages/admin/timesheet/approvals';
import TimesheetApprovalsFormPage from './pages/admin/timesheet/approvals/FormPage';

// Payroll Pages
import PayrollRunsListPage from './pages/admin/payroll/runs';
import PayrollRunsFormPage from './pages/admin/payroll/runs/FormPage';
import PayslipsListPage from './pages/admin/payroll/payslips';
import PayslipsFormPage from './pages/admin/payroll/payslips/FormPage';
import SalaryComponentsListPage from './pages/admin/payroll/components';
import SalaryComponentsFormPage from './pages/admin/payroll/components/FormPage';

// Performance Pages
import PerformanceReviewsListPage from './pages/admin/performance/reviews';
import PerformanceReviewsFormPage from './pages/admin/performance/reviews/FormPage';
import EmployeeGoalsListPage from './pages/admin/performance/goals';
import EmployeeGoalsFormPage from './pages/admin/performance/goals/FormPage';
import ReviewCyclesListPage from './pages/admin/performance/cycles';
import ReviewCyclesFormPage from './pages/admin/performance/cycles/FormPage';

// Recruitment Pages
import JobPostingsListPage from './pages/admin/recruitment/jobs';
import JobPostingsFormPage from './pages/admin/recruitment/jobs/FormPage';
import JobApplicationsListPage from './pages/admin/recruitment/applications';
import JobApplicationsFormPage from './pages/admin/recruitment/applications/FormPage';
import InterviewSchedulesListPage from './pages/admin/recruitment/interviews';
import InterviewSchedulesFormPage from './pages/admin/recruitment/interviews/FormPage';

// Assets Pages
import AssetsListPage from './pages/admin/assets/assets';
import AssetsFormPage from './pages/admin/assets/assets/FormPage';
import AssetAssignmentsListPage from './pages/admin/assets/assignments';
import AssetAssignmentsFormPage from './pages/admin/assets/assignments/FormPage';
import AssetCategoriesListPage from './pages/admin/assets/categories';
import AssetCategoriesFormPage from './pages/admin/assets/categories/FormPage';

// Expenses Pages
import ExpenseClaimsListPage from './pages/admin/expenses/claims';
import ExpenseClaimsFormPage from './pages/admin/expenses/claims/FormPage';
import ExpenseCategoriesListPage from './pages/admin/expenses/categories';
import ExpenseCategoriesFormPage from './pages/admin/expenses/categories/FormPage';

// Projects Pages (New Structure)
import ProjectsListPage from './pages/admin/projects/projects';
import ProjectsFormPage from './pages/admin/projects/projects/FormPage';
import ProjectTasksListPage from './pages/admin/projects/tasks';
import ProjectTasksFormPage from './pages/admin/projects/tasks/FormPage';

// Error Pages
import { NotFoundPage } from './pages/NotFoundPage';

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
    <ErrorBoundary>
      <ConfigProvider theme={premiumTheme}>
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
        <Route
          path="/superadmin/organizations/:orgId/modules"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <LayoutWrapper>
                <OrganizationModulesPage />
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
        <Route
          path="/employee/documents"
          element={
            <ProtectedRoute requiredRole="employee">
              <LayoutWrapper>
                <MyDocumentsSigningPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/onboarding"
          element={
            <ProtectedRoute requiredRole="employee">
              <LayoutWrapper>
                <OnboardingChecklistPage />
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
                <EnhancedAdminDashboard />
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

        {/* Notification Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <NotificationsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/preferences"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <NotificationPreferencesPage />
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
        <Route
          path="/admin/documents/manage"
          element={
            <ProtectedRoute requiredRole="orgadmin">
              <LayoutWrapper>
                <DocumentManagementPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Document Request Routes */}
        <Route
          path="/document-requests/create"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <RequestDocumentPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
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

        {/* Attendance Module Routes */}
        <Route path="/admin/attendance/records" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AttendanceRecordsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/records/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AttendanceRecordsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/records/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AttendanceRecordsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/regularization" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><RegularizationListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/regularization/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><RegularizationFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/regularization/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><RegularizationFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/shifts" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ShiftsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/shifts/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ShiftsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/attendance/shifts/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ShiftsFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Leave Module Routes */}
        <Route path="/admin/leave/applications" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveApplicationsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/applications/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveApplicationsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/applications/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveApplicationsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/balances" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveBalancesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/types" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveTypesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/types/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveTypesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/leave/types/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><LeaveTypesFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Timesheet Module Routes */}
        <Route path="/admin/timesheet/entries" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><TimesheetEntriesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/timesheet/entries/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><TimesheetEntriesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/timesheet/entries/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><TimesheetEntriesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/timesheet/approvals" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><TimesheetApprovalsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/timesheet/approvals/:id" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><TimesheetApprovalsFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Payroll Module Routes */}
        <Route path="/admin/payroll/runs" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayrollRunsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/runs/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayrollRunsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/runs/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayrollRunsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/payslips" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayslipsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/payslips/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayslipsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/payslips/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PayslipsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/components" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><SalaryComponentsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/components/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><SalaryComponentsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/payroll/components/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><SalaryComponentsFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Performance Module Routes */}
        <Route path="/admin/performance/reviews" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PerformanceReviewsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/reviews/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PerformanceReviewsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/reviews/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><PerformanceReviewsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/goals" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><EmployeeGoalsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/goals/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><EmployeeGoalsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/goals/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><EmployeeGoalsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/cycles" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ReviewCyclesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/cycles/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ReviewCyclesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/performance/cycles/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ReviewCyclesFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Recruitment Module Routes */}
        <Route path="/admin/recruitment/jobs" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobPostingsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/jobs/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobPostingsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/jobs/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobPostingsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/applications" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobApplicationsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/applications/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobApplicationsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/applications/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><JobApplicationsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/interviews" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><InterviewSchedulesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/interviews/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><InterviewSchedulesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/recruitment/interviews/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><InterviewSchedulesFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Assets Module Routes */}
        <Route path="/admin/assets/assets" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/assets/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/assets/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/assignments" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetAssignmentsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/assignments/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetAssignmentsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/assignments/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetAssignmentsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/categories" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetCategoriesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/categories/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetCategoriesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/assets/categories/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><AssetCategoriesFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Expenses Module Routes */}
        <Route path="/admin/expenses/claims" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseClaimsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/expenses/claims/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseClaimsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/expenses/claims/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseClaimsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/expenses/categories" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseCategoriesListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/expenses/categories/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseCategoriesFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/expenses/categories/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ExpenseCategoriesFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Projects Module Routes (New Structure) */}
        <Route path="/admin/projects/projects" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectsListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/projects/projects/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/projects/projects/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectsFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/projects/tasks" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectTasksListPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/projects/tasks/create" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectTasksFormPage /></LayoutWrapper></ProtectedRoute>} />
        <Route path="/admin/projects/tasks/:id/edit" element={<ProtectedRoute requiredRole="orgadmin"><LayoutWrapper><ProjectTasksFormPage /></LayoutWrapper></ProtectedRoute>} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
