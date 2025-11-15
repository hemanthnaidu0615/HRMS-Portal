import http from "./http";

export interface EmployeeSummaryResponse {
  employeeId: string;
  userId: string;
  email: string;
  departmentName: string | null;
  positionName: string | null;
  reportsToEmployeeId: string | null;
  reportsToEmail: string | null;
  employmentType: string | null;
  contractEndDate: string | null;
}

export interface EmployeeDetailResponse {
  employeeId: string;
  userId: string;
  email: string;
  departmentId: string | null;
  departmentName: string | null;
  positionId: string | null;
  positionName: string | null;
  reportsToEmployeeId: string | null;
  reportsToEmail: string | null;
  employmentType: string | null;
  clientId: string | null;
  projectId: string | null;
  contractEndDate: string | null;
}

export interface EmployeeAssignmentUpdateRequest {
  departmentId?: string | null;
  positionId?: string | null;
  reportsToEmployeeId?: string | null;
  employmentType?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  contractEndDate?: string | null;
}

export interface EmployeeHistoryResponse {
  id: string;
  changedField: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
  changedByEmail: string | null;
}

export interface EmployeeTreeNodeResponse {
  employeeId: string;
  email: string;
  positionName: string | null;
  departmentName: string | null;
  reports?: EmployeeTreeNodeResponse[];
}

export async function getEmployees() {
  const response = await http.get<EmployeeSummaryResponse[]>("/api/orgadmin/employees");
  return response.data;
}

export async function getEmployeeDetails(employeeId: string) {
  const response = await http.get<EmployeeDetailResponse>(`/api/orgadmin/employees/${employeeId}`);
  return response.data;
}

export async function updateEmployeeAssignment(employeeId: string, payload: EmployeeAssignmentUpdateRequest) {
  const response = await http.patch<EmployeeDetailResponse>(`/api/orgadmin/employees/${employeeId}/assignment`, payload);
  return response.data;
}

export async function getEmployeeHistory(employeeId: string) {
  const response = await http.get<EmployeeHistoryResponse[]>(`/api/orgadmin/employees/${employeeId}/history`);
  return response.data;
}

export async function getEmployeeTree() {
  const response = await http.get<EmployeeTreeNodeResponse[]>(`/api/orgadmin/employees/tree`);
  return response.data;
}
