import http from './http';

export interface Permission {
  id: string;
  code: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  systemRole: boolean;
  createdAt: string;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export const roleApi = {
  /**
   * Get all roles (system + organization roles)
   */
  getAllRoles: async (): Promise<Role[]> => {
    const response = await http.get('/api/orgadmin/roles');
    return response.data;
  },

  /**
   * Get role details with permissions
   */
  getRoleDetail: async (roleId: number): Promise<RoleDetail> => {
    const response = await http.get(`/api/orgadmin/roles/${roleId}`);
    return response.data;
  },

  /**
   * Create a new custom role
   */
  createRole: async (data: CreateRoleRequest): Promise<RoleDetail> => {
    const response = await http.post('/api/orgadmin/roles', data);
    return response.data;
  },

  /**
   * Update an existing role
   */
  updateRole: async (roleId: number, data: UpdateRoleRequest): Promise<RoleDetail> => {
    const response = await http.put(`/api/orgadmin/roles/${roleId}`, data);
    return response.data;
  },

  /**
   * Delete a custom role
   */
  deleteRole: async (roleId: number): Promise<void> => {
    await http.delete(`/api/orgadmin/roles/${roleId}`);
  },

  /**
   * Get all available system permissions for role creation
   * Fetches from permission groups endpoint
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await http.get('/api/orgadmin/permissions/groups');
    const groups = response.data as Array<{
      id: string;
      name: string;
      description?: string;
      permissions: Permission[];
    }>;

    // Flatten all permissions from all groups
    const allPermissions: Permission[] = [];
    groups.forEach(group => {
      allPermissions.push(...group.permissions);
    });

    return allPermissions;
  },
};

/**
 * Generate human-readable description from permission code
 * Example: "employees:view:team" -> "View team employees"
 */
function getPermissionDescription(code: string): string {
  const [resource, action, scope] = code.split(':');
  
  const actionLabels: Record<string, string> = {
    view: 'View',
    edit: 'Edit',
    create: 'Create',
    delete: 'Delete',
    approve: 'Approve',
    submit: 'Submit',
    run: 'Run',
    assign: 'Assign',
    request: 'Request',
    upload: 'Upload',
    cancel: 'Cancel',
  };

  const scopeLabels: Record<string, string> = {
    own: 'own',
    team: 'team',
    department: 'department',
    organization: 'organization',
  };

  const resourceLabels: Record<string, string> = {
    employees: 'employees',
    documents: 'documents',
    departments: 'departments',
    positions: 'positions',
    roles: 'roles',
    leaves: 'leave requests',
    timesheets: 'timesheets',
    payroll: 'payroll',
  };

  const actionLabel = actionLabels[action] || action;
  const scopeLabel = scopeLabels[scope] || scope;
  const resourceLabel = resourceLabels[resource] || resource;

  return `${actionLabel} ${scopeLabel} ${resourceLabel}`;
}
