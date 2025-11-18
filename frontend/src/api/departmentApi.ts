import http from "./http";

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  departmentCode?: string;
  isActive?: boolean;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  departmentCode?: string;
  description?: string;
  isActive?: boolean;
}

export async function createDepartment(data: CreateDepartmentRequest): Promise<DepartmentResponse> {
  // For now, only send fields the backend supports
  const response = await http.post<DepartmentResponse>("/api/orgadmin/structure/departments", {
    name: data.name,
    // Note: departmentCode, description, isActive will be added to backend later
  });
  return response.data;
}

export async function getDepartments(): Promise<DepartmentResponse[]> {
  const response = await http.get<DepartmentResponse[]>("/api/orgadmin/structure/departments");
  return response.data;
}
