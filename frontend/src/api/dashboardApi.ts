import http from './http';

export interface EmployeeDashboardStats {
  stats: {
    totalDocuments: number;
    pendingDocumentRequests: number;
    completedDocumentRequests: number;
    myPendingRequests: number;
  };
  employeeInfo: {
    email: string;
    department: string;
    position: string;
  };
}

export interface AdminDashboardStats {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalDocuments: number;
    pendingDocumentRequests: number;
    completedDocumentRequests: number;
    newEmployeesLast30Days: number;
  };
  organizationInfo: {
    name: string;
    createdAt: string;
  };
}

export interface SuperAdminDashboardStats {
  stats: {
    totalOrganizations: number;
    activeOrganizations: number;
    inactiveOrganizations: number;
    totalEmployees: number;
    newOrganizationsLast30Days: number;
  };
}

export async function getEmployeeDashboard() {
  const res = await http.get<EmployeeDashboardStats>('/api/dashboard/employee');
  return res.data;
}

export async function getAdminDashboard() {
  const res = await http.get<AdminDashboardStats>('/api/dashboard/admin');
  return res.data;
}

export async function getSuperAdminDashboard() {
  const res = await http.get<SuperAdminDashboardStats>('/api/dashboard/superadmin');
  return res.data;
}
