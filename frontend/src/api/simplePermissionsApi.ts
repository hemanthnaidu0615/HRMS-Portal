import http from './http';

export interface ResourcePermission {
  resource: string;
  label: string;
  description: string;
  canViewOwn: boolean;
  canEditOwn: boolean;
  canViewTeam: boolean;
  canEditTeam: boolean;
  canViewOrg: boolean;
  canEditOrg: boolean;
}

export interface EmployeePermissionsResponse {
  employeeId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  permissions: ResourcePermission[];
}

export interface EmployeePermissionsRequest {
  permissions: {
    resource: string;
    canViewOwn: boolean;
    canEditOwn: boolean;
    canViewTeam: boolean;
    canEditTeam: boolean;
    canViewOrg: boolean;
    canEditOrg: boolean;
  }[];
}

/**
 * Get employee's permissions in simple format
 */
export async function getEmployeeSimplePermissions(employeeId: string): Promise<EmployeePermissionsResponse> {
  const response = await http.get<EmployeePermissionsResponse>(`/api/permissions/employee/${employeeId}`);
  return response.data;
}

/**
 * Update employee's permissions using simple model
 */
export async function updateEmployeeSimplePermissions(
  employeeId: string,
  request: EmployeePermissionsRequest
): Promise<EmployeePermissionsResponse> {
  const response = await http.put<EmployeePermissionsResponse>(
    `/api/permissions/employee/${employeeId}`,
    request
  );
  return response.data;
}

/**
 * Get my own permissions
 */
export async function getMySimplePermissions(): Promise<EmployeePermissionsResponse> {
  const response = await http.get<EmployeePermissionsResponse>('/api/permissions/me');
  return response.data;
}
