import http from './http';

export interface AuditLogEntry {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  status: 'SUCCESS' | 'FAILED';
  performedAt: string;
  ipAddress?: string;
  metadata?: string;
  oldValue?: string;
  newValue?: string;
  errorMessage?: string;
  performedBy?: {
    id: string;
    email: string;
  };
}

export interface AuditLogsResponse {
  content: AuditLogEntry[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface EntityAuditLogsResponse {
  content: AuditLogEntry[];
  totalElements: number;
  entityType: string;
  entityId: string;
}

export const auditLogApi = {
  /**
   * Get audit logs with filters and pagination
   */
  getAuditLogs: async (
    page: number = 0,
    size: number = 50,
    actionType?: string,
    entityType?: string
  ): Promise<AuditLogsResponse> => {
    const params: any = { page, size };
    if (actionType) params.actionType = actionType;
    if (entityType) params.entityType = entityType;

    const response = await http.get<AuditLogsResponse>('/api/admin/audit-logs', { params });
    return response.data;
  },

  /**
   * Get audit logs for a specific entity
   */
  getAuditLogsForEntity: async (
    entityType: string,
    entityId: string,
    page: number = 0,
    size: number = 20
  ): Promise<EntityAuditLogsResponse> => {
    const response = await http.get<EntityAuditLogsResponse>(
      `/api/admin/audit-logs/entity/${entityType}/${entityId}`,
      { params: { page, size } }
    );
    return response.data;
  },

  /**
   * Get available action types for filtering
   */
  getActionTypes: async (): Promise<string[]> => {
    const response = await http.get<string[]>('/api/admin/audit-logs/action-types');
    return response.data;
  },

  /**
   * Get available entity types for filtering
   */
  getEntityTypes: async (): Promise<string[]> => {
    const response = await http.get<string[]>('/api/admin/audit-logs/entity-types');
    return response.data;
  },
};
