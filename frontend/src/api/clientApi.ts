import http from './http';

export interface ClientListItem {
  id: string;
  name: string;
  clientCode: string;
  clientType: string;
  industry: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  relationshipStatus: string;
  relationshipStartDate: string;
  totalActiveProjects: number;
  totalActiveResources: number;
  isActive: boolean;
  isStrategic: boolean;
}

export interface ClientDetail {
  id: string;
  name: string;
  clientCode: string;
  clientType: string;
  industry: string;

  // Contact
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  // Business
  taxId: string;
  website: string;

  // Relationship
  relationshipStartDate: string;
  relationshipStatus: string;
  accountManagerId: string;
  accountManagerName: string;

  // Metrics
  totalActiveProjects: number;
  totalActiveResources: number;

  // Status
  isActive: boolean;
  isStrategic: boolean;

  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  clientCode?: string;
  clientType: string;
  industry?: string;

  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  taxId?: string;
  website?: string;

  relationshipStartDate?: string;
  accountManagerId?: string;
}

export interface UpdateClientRequest extends CreateClientRequest {
  relationshipStatus?: string;
  isActive?: boolean;
  isStrategic?: boolean;
}

export async function getAllClients(activeOnly?: boolean): Promise<ClientListItem[]> {
  const params = activeOnly ? { activeOnly: true } : {};
  const response = await http.get('/api/clients', { params });
  return response.data;
}

export async function getClientById(id: string): Promise<ClientDetail> {
  const response = await http.get(`/api/clients/${id}`);
  return response.data;
}

export async function createClient(data: CreateClientRequest): Promise<ClientDetail> {
  const response = await http.post('/api/clients', data);
  return response.data;
}

export async function updateClient(id: string, data: UpdateClientRequest): Promise<ClientDetail> {
  const response = await http.put(`/api/clients/${id}`, data);
  return response.data;
}

export async function deleteClient(id: string): Promise<void> {
  await http.delete(`/api/clients/${id}`);
}

export async function getNextClientCode(): Promise<string> {
  const response = await http.get('/api/clients/codes/next');
  return response.data;
}
