import http from './http';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface CreateOrgAdminRequest {
  email: string;
  temporaryPassword: string;
}

export interface OrgAdminResponse {
  id: string;
  email: string;
  organizationId: string;
  mustChangePassword: boolean;
}

export interface OrganizationModule {
  id?: number;
  moduleName: string;
  isEnabled: boolean;
  userLimit?: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateModulesRequest {
  moduleName: string;
  isEnabled: boolean;
  userLimit?: number;
  expiryDate?: string;
}

export const superadminApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await http.get<Organization[]>('/api/superadmin/organizations');
    return response.data;
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await http.post<Organization>('/api/superadmin/organizations', data);
    return response.data;
  },

  createOrgAdmin: async (orgId: string, data: CreateOrgAdminRequest): Promise<OrgAdminResponse> => {
    const response = await http.post<OrgAdminResponse>(
      `/api/superadmin/organizations/${orgId}/orgadmin`,
      data
    );
    return response.data;
  },

  deleteOrganization: async (orgId: string): Promise<void> => {
    await http.delete(`/api/superadmin/organizations/${orgId}`);
  },

  reactivateOrganization: async (orgId: string): Promise<void> => {
    await http.post(`/api/superadmin/organizations/${orgId}/reactivate`);
  },

  // Module Management APIs
  getOrganizationModules: async (orgId: string): Promise<OrganizationModule[]> => {
    const response = await http.get<OrganizationModule[]>(
      `/api/superadmin/organizations/${orgId}/modules`
    );
    return response.data;
  },

  updateOrganizationModules: async (
    orgId: string,
    modules: UpdateModulesRequest[]
  ): Promise<void> => {
    await http.put(`/api/superadmin/organizations/${orgId}/modules`, modules);
  },

  getEnabledModulesCount: async (orgId: string): Promise<number> => {
    const response = await http.get<{ enabledModulesCount: number }>(
      `/api/superadmin/organizations/${orgId}/modules/count`
    );
    return response.data.enabledModulesCount;
  },
};
