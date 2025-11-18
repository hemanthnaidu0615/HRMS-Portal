import http from './http';

export interface VendorListItem {
  id: string;
  name: string;
  vendorCode: string;
  vendorType: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  contractStatus: string;
  contractStartDate: string;
  contractEndDate: string;
  defaultBillingRate: number;
  billingCurrency: string;
  totalResourcesSupplied: number;
  activeResourcesCount: number;
  isActive: boolean;
  isPreferred: boolean;
}

export interface VendorDetail {
  id: string;
  name: string;
  vendorCode: string;
  vendorType: string;

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
  businessRegistrationNumber: string;
  website: string;

  // Contract
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: string;

  // Billing
  billingType: string;
  defaultBillingRate: number;
  billingCurrency: string;
  paymentTerms: string;

  // Multi-tier
  parentVendorId: string;
  parentVendorName: string;
  tierLevel: number;

  // Metrics
  totalResourcesSupplied: number;
  activeResourcesCount: number;

  // Status
  isActive: boolean;
  isPreferred: boolean;

  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorRequest {
  name: string;
  vendorCode?: string;
  vendorType: string;

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
  businessRegistrationNumber?: string;
  website?: string;

  contractStartDate?: string;
  contractEndDate?: string;

  billingType?: string;
  defaultBillingRate?: number;
  paymentTerms?: string;

  parentVendorId?: string;
}

export interface UpdateVendorRequest extends CreateVendorRequest {
  contractStatus?: string;
  isActive?: boolean;
  isPreferred?: boolean;
}

export async function getAllVendors(activeOnly?: boolean): Promise<VendorListItem[]> {
  const params = activeOnly ? { activeOnly: true } : {};
  const response = await http.get('/api/vendors', { params });
  return response.data;
}

export async function getVendorById(id: string): Promise<VendorDetail> {
  const response = await http.get(`/api/vendors/${id}`);
  return response.data;
}

export async function createVendor(data: CreateVendorRequest): Promise<VendorDetail> {
  const response = await http.post('/api/vendors', data);
  return response.data;
}

export async function updateVendor(id: string, data: UpdateVendorRequest): Promise<VendorDetail> {
  const response = await http.put(`/api/vendors/${id}`, data);
  return response.data;
}

export async function deleteVendor(id: string): Promise<void> {
  await http.delete(`/api/vendors/${id}`);
}

export async function getNextVendorCode(): Promise<string> {
  const response = await http.get('/api/vendors/codes/next');
  return response.data;
}
