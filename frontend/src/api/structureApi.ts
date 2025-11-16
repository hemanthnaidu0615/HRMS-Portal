import http from "./http";

export interface DepartmentResponse {
  id: string;
  name: string;
}

export interface PositionResponse {
  id: string;
  name: string;
  seniorityLevel: number;
}

export async function getDepartments() {
  const response = await http.get<DepartmentResponse[]>("/api/orgadmin/structure/departments");
  return response.data;
}

export async function createDepartment(name: string) {
  const response = await http.post<DepartmentResponse>("/api/orgadmin/structure/departments", { name });
  return response.data;
}

export async function updateDepartment(id: string, name: string) {
  const response = await http.put<DepartmentResponse>(`/api/orgadmin/structure/departments/${id}`, { name });
  return response.data;
}

export async function deleteDepartment(id: string) {
  await http.delete(`/api/orgadmin/structure/departments/${id}`);
}

export async function getPositions() {
  const response = await http.get<PositionResponse[]>("/api/orgadmin/structure/positions");
  return response.data;
}

export async function createPosition(name: string, seniorityLevel: number) {
  const response = await http.post<PositionResponse>("/api/orgadmin/structure/positions", { name, seniorityLevel });
  return response.data;
}

export async function updatePosition(id: string, name: string, seniorityLevel: number) {
  const response = await http.put<PositionResponse>(`/api/orgadmin/structure/positions/${id}`, { name, seniorityLevel });
  return response.data;
}

export async function deletePosition(id: string) {
  await http.delete(`/api/orgadmin/structure/positions/${id}`);
}
