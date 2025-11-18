import http from "./http";

export interface EmployeeSummaryResponse {
  employeeId: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  departmentName: string | null;
  positionName: string | null;
  reportsToEmployeeId: string | null;
  reportsToEmail: string | null;
  employmentType: string | null;
  contractEndDate: string | null;
  isProbation: boolean;
  probationEndDate: string | null;
  probationStatus: string | null;
}

export interface EmployeeDetailResponse {
  // Basic IDs
  employeeId: string;
  userId: string;
  email: string;
  organizationId: string;

  // Employee Code
  employeeCode: string | null;

  // Personal Details
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  bloodGroup: string | null;

  // Contact Information
  personalEmail: string | null;
  phoneNumber: string | null;
  workPhone: string | null;
  alternatePhone: string | null;

  // Current Address
  currentAddressLine1: string | null;
  currentAddressLine2: string | null;
  currentCity: string | null;
  currentState: string | null;
  currentCountry: string | null;
  currentPostalCode: string | null;

  // Permanent Address
  sameAsCurrentAddress: boolean | null;
  permanentAddressLine1: string | null;
  permanentAddressLine2: string | null;
  permanentCity: string | null;
  permanentState: string | null;
  permanentCountry: string | null;
  permanentPostalCode: string | null;

  // Emergency Contacts
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  alternateEmergencyContactName: string | null;
  alternateEmergencyContactRelationship: string | null;
  alternateEmergencyContactPhone: string | null;

  // Employment Details
  joiningDate: string | null;
  employmentStatus: string | null;
  employmentType: string | null;

  // Department
  departmentId: string | null;
  departmentName: string | null;
  departmentCode: string | null;

  // Position
  positionId: string | null;
  positionName: string | null;

  // Reporting
  reportsToEmployeeId: string | null;
  reportsToEmail: string | null;
  reportsToFirstName: string | null;
  reportsToLastName: string | null;

  // Vendor/Client/Project
  vendorId: string | null;
  vendorName: string | null;
  vendorCode: string | null;
  clientId: string | null;
  clientName: string | null;
  clientCode: string | null;
  projectId: string | null;
  projectName: string | null;
  projectCode: string | null;

  // Contract
  contractStartDate: string | null;
  contractEndDate: string | null;

  // Probation
  isProbation: boolean;
  probationStartDate: string | null;
  probationEndDate: string | null;
  probationStatus: string | null;

  // Compensation
  basicSalary: number | null;
  currency: string | null;
  payFrequency: string | null;

  // Bank Details
  bankAccountNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  ifscCode: string | null;
  swiftCode: string | null;

  // Tax & Legal
  taxIdentificationNumber: string | null;

  // India-Specific
  panNumber: string | null;
  aadharNumber: string | null;
  uanNumber: string | null;

  // USA-Specific
  ssnNumber: string | null;
  driversLicenseNumber: string | null;
  passportNumber: string | null;

  // Resignation/Exit
  resignationDate: string | null;
  lastWorkingDate: string | null;
  exitReason: string | null;
  exitNotes: string | null;

  // Additional Info
  linkedInProfile: string | null;
  githubProfile: string | null;

  // Audit
  createdAt: string;
  createdByEmail: string | null;
  updatedAt: string;
  updatedByEmail: string | null;
  deletedAt?: string | null;
  deletedByEmail?: string | null;
}

export interface EmployeeAssignmentUpdateRequest {
  departmentId?: string | null;
  positionId?: string | null;
  reportsToEmployeeId?: string | null;
  employmentType?: string | null;
  clientName?: string | null;
  projectId?: string | null;
  contractEndDate?: string | null;
}

export interface EmployeeHistoryResponse {
  id: string;
  changedField: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
  changedByEmail: string | null;
}

export interface EmployeeTreeNodeResponse {
  employeeId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  positionName: string | null;
  departmentName: string | null;
  reports?: EmployeeTreeNodeResponse[];
}

export async function getEmployees() {
  const response = await http.get<{ content: EmployeeSummaryResponse[] }>("/api/orgadmin/employees");
  return response.data.content || [];
}

export async function getEmployeeDetails(employeeId: string) {
  const response = await http.get<EmployeeDetailResponse>(`/api/orgadmin/employees/${employeeId}`);
  return response.data;
}

export async function updateEmployeeAssignment(employeeId: string, payload: EmployeeAssignmentUpdateRequest) {
  const response = await http.patch<EmployeeDetailResponse>(`/api/orgadmin/employees/${employeeId}/assignment`, payload);
  return response.data;
}

export async function getEmployeeHistory(employeeId: string) {
  const response = await http.get<EmployeeHistoryResponse[]>(`/api/orgadmin/employees/${employeeId}/history`);
  return response.data;
}

export async function getEmployeeTree() {
  const response = await http.get<EmployeeTreeNodeResponse[]>(`/api/orgadmin/employees/tree`);
  return response.data;
}

export interface CreateEmployeeRequest {
  email: string;
  temporaryPassword: string;
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  positionId?: string;
  reportsToId?: string;
  employmentType?: string;
  clientName?: string;
  projectId?: string;
  contractEndDate?: string;
  isProbation?: boolean;
  probationStartDate?: string;
  probationEndDate?: string;
  probationStatus?: string;
  permissionGroupIds?: string[];
}
