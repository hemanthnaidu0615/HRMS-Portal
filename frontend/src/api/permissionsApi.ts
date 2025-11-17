import http from "./http";

export interface PermissionResponse {
  id: string;
  code: string;
  description: string | null;
}

export interface PermissionGroupResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionResponse[];
}

export async function getPermissionGroups() {
  const response = await http.get<PermissionGroupResponse[]>("/api/orgadmin/permissions/groups");
  return response.data;
}

export async function getPermissionGroup(id: string) {
  const response = await http.get<PermissionGroupResponse>(`/api/orgadmin/permissions/groups/${id}`);
  return response.data;
}

export async function getMyPermissions() {
  const res = await http.get<string[]>('/api/me/permissions');
  return res.data;
}
