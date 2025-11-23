import http from './http';

// ==================== EMPLOYEE ENDPOINTS ====================

export interface DocumentToSign {
  id: string;
  documentName: string;
  documentType: string;
  description?: string;
  status: 'DRAFT' | 'PENDING' | 'SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  expiryDate?: string;
  employeeSignatureData?: string;
  employerSignatureRequired?: boolean;
  reminderSentCount?: number;
  declineReason?: string;
}

export interface OnboardingChecklistItem {
  id: number;
  checklistItemName: string;
  checklistItemType: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'NA';
  isMandatory: boolean;
  dueDate?: string;
  completedAt?: string;
  displayOrder: number;
}

export interface OnboardingStatus {
  totalItems: number;
  completedItems: number;
  mandatoryItems: number;
  mandatoryCompleted: number;
  completionPercentage: number;
  allMandatoryComplete: boolean;
}

// Get pending documents for employee
export async function getPendingDocuments() {
  const res = await http.get('/api/documents/pending');
  return res.data as DocumentToSign[];
}

// Get all documents for employee
export async function getMyDocuments() {
  const res = await http.get('/api/documents/my-documents');
  return res.data as DocumentToSign[];
}

// Get specific document
export async function getDocument(documentId: string) {
  const res = await http.get(`/api/documents/${documentId}`);
  return res.data as DocumentToSign;
}

// Mark document as viewed
export async function viewDocument(documentId: string) {
  const res = await http.post(`/api/documents/${documentId}/view`);
  return res.data as DocumentToSign;
}

// Sign document
export async function signDocument(documentId: string, signatureData: string) {
  const res = await http.post(`/api/documents/${documentId}/sign`, { signatureData });
  return res.data as DocumentToSign;
}

// Decline document
export async function declineDocument(documentId: string, reason: string) {
  const res = await http.post(`/api/documents/${documentId}/decline`, { reason });
  return res.data as DocumentToSign;
}

// Get onboarding checklist
export async function getOnboardingChecklist() {
  const res = await http.get('/api/documents/onboarding/checklist');
  return res.data as OnboardingChecklistItem[];
}

// Get onboarding status
export async function getOnboardingStatus() {
  const res = await http.get('/api/documents/onboarding/status');
  return res.data as OnboardingStatus;
}

// ==================== ADMIN ENDPOINTS ====================

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  templateContent?: string;
  fileStoragePath?: string;
  fileType?: string;
  requiresSignature: boolean;
  signatureRequiredFrom: 'EMPLOYEE' | 'EMPLOYER' | 'BOTH' | 'MULTIPLE';
  autoSendOnHire: boolean;
  sendOrder: number;
  isActive: boolean;
}

export interface SendDocumentRequest {
  employeeId: string;
  templateId: string;
}

export interface UploadDocumentRequest {
  employeeId: string;
  documentName: string;
  documentType: string;
  description?: string;
  fileStoragePath: string;
  fileType: string;
  fileSizeKb?: number;
  expiryDate?: string;
  employerSignatureRequired?: boolean;
}

// Send document to employee (Admin)
export async function sendDocumentToEmployee(request: SendDocumentRequest) {
  const res = await http.post('/api/documents/admin/send', request);
  return res.data as DocumentToSign;
}

// Get all organization documents (Admin)
export async function getOrganizationDocuments() {
  const res = await http.get('/api/documents/admin/organization');
  return res.data as DocumentToSign[];
}

// Get documents by status (Admin)
export async function getDocumentsByStatus(statuses: string[]) {
  const res = await http.get('/api/documents/admin/organization/by-status', {
    params: { statuses },
  });
  return res.data as DocumentToSign[];
}

// Get pending count (Admin)
export async function getPendingCount() {
  const res = await http.get('/api/documents/admin/organization/pending-count');
  return res.data as { count: number };
}

// Upload and send custom document (Admin)
export async function uploadAndSendDocument(request: UploadDocumentRequest) {
  const res = await http.post('/api/documents/admin/upload-and-send', request);
  return res.data as DocumentToSign;
}

// ==================== DOCUMENT TEMPLATE ENDPOINTS ====================

// Get all templates
export async function getDocumentTemplates() {
  const res = await http.get('/api/admin/document-templates');
  return res.data as DocumentTemplate[];
}

// Get active templates only
export async function getActiveTemplates() {
  const res = await http.get('/api/admin/document-templates/active');
  return res.data as DocumentTemplate[];
}

// Get specific template
export async function getDocumentTemplate(templateId: string) {
  const res = await http.get(`/api/admin/document-templates/${templateId}`);
  return res.data as DocumentTemplate;
}

// Create template
export async function createDocumentTemplate(template: Partial<DocumentTemplate>) {
  const res = await http.post('/api/admin/document-templates', template);
  return res.data as DocumentTemplate;
}

// Update template
export async function updateDocumentTemplate(templateId: string, template: Partial<DocumentTemplate>) {
  const res = await http.put(`/api/admin/document-templates/${templateId}`, template);
  return res.data as DocumentTemplate;
}

// Delete template
export async function deleteDocumentTemplate(templateId: string) {
  await http.delete(`/api/admin/document-templates/${templateId}`);
}

// Toggle template active status
export async function toggleTemplateActive(templateId: string) {
  const res = await http.patch(`/api/admin/document-templates/${templateId}/toggle-active`);
  return res.data as DocumentTemplate;
}
