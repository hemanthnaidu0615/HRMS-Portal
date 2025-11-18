#!/bin/bash
# Generate route imports and routes for all modules

cat << 'IMPORTS'
// Attendance Pages
import { AttendanceRecordsListPage } from './pages/admin/attendance/records';
import { AttendanceRecordsFormPage } from './pages/admin/attendance/records/FormPage';
import { RegularizationListPage } from './pages/admin/attendance/regularization';
import { RegularizationFormPage } from './pages/admin/attendance/regularization/FormPage';
import { ShiftsListPage } from './pages/admin/attendance/shifts';
import { ShiftsFormPage } from './pages/admin/attendance/shifts/FormPage';

// Leave Pages
import { LeaveApplicationsListPage } from './pages/admin/leave/applications';
import { LeaveApplicationsFormPage } from './pages/admin/leave/applications/FormPage';
import { LeaveBalancesListPage } from './pages/admin/leave/balances';
import { LeaveTypesListPage } from './pages/admin/leave/types';
import { LeaveTypesFormPage } from './pages/admin/leave/types/FormPage';

// Timesheet Pages
import { TimesheetEntriesListPage } from './pages/admin/timesheet/entries';
import { TimesheetEntriesFormPage } from './pages/admin/timesheet/entries/FormPage';
import { TimesheetApprovalsListPage } from './pages/admin/timesheet/approvals';
import { TimesheetApprovalsFormPage } from './pages/admin/timesheet/approvals/FormPage';

// Payroll Pages
import { PayrollRunsListPage } from './pages/admin/payroll/runs';
import { PayrollRunsFormPage } from './pages/admin/payroll/runs/FormPage';
import { PayslipsListPage } from './pages/admin/payroll/payslips';
import { PayslipsFormPage } from './pages/admin/payroll/payslips/FormPage';
import { SalaryComponentsListPage } from './pages/admin/payroll/components';
import { SalaryComponentsFormPage } from './pages/admin/payroll/components/FormPage';

// Performance Pages
import { PerformanceReviewsListPage } from './pages/admin/performance/reviews';
import { PerformanceReviewsFormPage } from './pages/admin/performance/reviews/FormPage';
import { EmployeeGoalsListPage } from './pages/admin/performance/goals';
import { EmployeeGoalsFormPage } from './pages/admin/performance/goals/FormPage';
import { ReviewCyclesListPage } from './pages/admin/performance/cycles';
import { ReviewCyclesFormPage } from './pages/admin/performance/cycles/FormPage';

// Recruitment Pages
import { JobPostingsListPage } from './pages/admin/recruitment/jobs';
import { JobPostingsFormPage } from './pages/admin/recruitment/jobs/FormPage';
import { JobApplicationsListPage } from './pages/admin/recruitment/applications';
import { JobApplicationsFormPage } from './pages/admin/recruitment/applications/FormPage';
import { InterviewSchedulesListPage } from './pages/admin/recruitment/interviews';
import { InterviewSchedulesFormPage } from './pages/admin/recruitment/interviews/FormPage';

// Assets Pages
import { AssetsListPage } from './pages/admin/assets/assets';
import { AssetsFormPage } from './pages/admin/assets/assets/FormPage';
import { AssetAssignmentsListPage } from './pages/admin/assets/assignments';
import { AssetAssignmentsFormPage } from './pages/admin/assets/assignments/FormPage';
import { AssetCategoriesListPage } from './pages/admin/assets/categories';
import { AssetCategoriesFormPage } from './pages/admin/assets/categories/FormPage';

// Expenses Pages
import { ExpenseClaimsListPage } from './pages/admin/expenses/claims';
import { ExpenseClaimsFormPage } from './pages/admin/expenses/claims/FormPage';
import { ExpenseCategoriesListPage } from './pages/admin/expenses/categories';
import { ExpenseCategoriesFormPage } from './pages/admin/expenses/categories/FormPage';

// Projects Pages (Updated)
import { ProjectsListPage } from './pages/admin/projects/projects';
import { ProjectsFormPage } from './pages/admin/projects/projects/FormPage';
import { ProjectTasksListPage } from './pages/admin/projects/tasks';
import { ProjectTasksFormPage } from './pages/admin/projects/tasks/FormPage';
IMPORTS

