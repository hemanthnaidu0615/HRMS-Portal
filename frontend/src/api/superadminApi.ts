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
};
