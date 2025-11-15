import http from "./http";

export interface EmployeePermissionGroupResponse {
  groupId: string;
  name: string;
  description: string | null;
}

export interface EmployeePermissionOverviewResponse {
  employeeId: string;
  email: string;
  assignedGroups: EmployeePermissionGroupResponse[];
  effectivePermissions: string[];
}

export interface PermissionGroupResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    id: string;
    code: string;
    description: string | null;
  }>;
}

export async function getEmployeePermissions(employeeId: string): Promise<EmployeePermissionOverviewResponse> {
  const response = await http.get<EmployeePermissionOverviewResponse>(`/api/orgadmin/employees/${employeeId}/permissions`);
  return response.data;
}

export async function updateEmployeePermissionGroups(employeeId: string, groupIds: string[]): Promise<EmployeePermissionOverviewResponse> {
  const response = await http.put<EmployeePermissionOverviewResponse>(
    `/api/orgadmin/employees/${employeeId}/permission-groups`,
    { groupIds }
  );
  return response.data;
}

export async function getAllPermissionGroups(): Promise<PermissionGroupResponse[]> {
  const response = await http.get<PermissionGroupResponse[]>("/api/orgadmin/permissions/groups");
  return response.data;
}
