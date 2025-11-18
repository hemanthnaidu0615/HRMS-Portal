import http from './http';

export interface ProjectListItem {
  id: string;
  projectName: string;
  projectCode: string;
  projectType: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  projectBudget: number;
  currency: string;
  totalAllocatedResources: number;
  projectManagerId: string;
  projectManagerName: string;
  isBillable: boolean;
  isActive: boolean;
}

export interface ProjectDetail {
  id: string;
  clientId: string;
  clientName: string;

  // Project Info
  projectName: string;
  projectCode: string;
  projectType: string;
  description: string;

  // Timeline
  startDate: string;
  endDate: string;
  estimatedDurationMonths: number;
  projectStatus: string;

  // Financial
  projectBudget: number;
  billingRateType: string;
  defaultBillingRate: number;
  currency: string;

  // Management
  projectManagerId: string;
  projectManagerName: string;

  // Metrics
  totalAllocatedResources: number;

  // Status
  isBillable: boolean;
  isActive: boolean;

  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  clientId: string;
  projectName: string;
  projectCode?: string;
  projectType: string;
  description?: string;

  // Timeline
  startDate?: string;
  endDate?: string;
  estimatedDurationMonths?: number;

  // Financial
  projectBudget?: number;
  billingRateType?: string;
  defaultBillingRate?: number;

  // Management
  projectManagerId?: string;

  // Status
  isBillable?: boolean;
}

export interface UpdateProjectRequest {
  projectName?: string;
  projectType?: string;
  description?: string;

  // Timeline
  startDate?: string;
  endDate?: string;
  estimatedDurationMonths?: number;
  projectStatus?: string;

  // Financial
  projectBudget?: number;
  billingRateType?: string;
  defaultBillingRate?: number;

  // Management
  projectManagerId?: string;

  // Status
  isBillable?: boolean;
  isActive?: boolean;
}

export async function getAllProjects(clientId?: string, activeOnly?: boolean): Promise<ProjectListItem[]> {
  const params: any = {};
  if (clientId) params.clientId = clientId;
  if (activeOnly !== undefined) params.activeOnly = activeOnly;

  const response = await http.get('/api/projects', { params });
  return response.data;
}

export async function getProjectById(id: string): Promise<ProjectDetail> {
  const response = await http.get(`/api/projects/${id}`);
  return response.data;
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectDetail> {
  const response = await http.post('/api/projects', data);
  return response.data;
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectDetail> {
  const response = await http.put(`/api/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id: string): Promise<void> {
  await http.delete(`/api/projects/${id}`);
}

export async function getNextProjectCode(clientId: string): Promise<string> {
  const response = await http.get('/api/projects/codes/next', {
    params: { clientId }
  });
  return response.data;
}
