import http from './http';

export interface Employee {
  employeeId: string;
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  departmentName?: string;
  positionName?: string;
  reportsToEmployeeId?: string;
  reportsToEmail?: string;
  employmentType?: string;
  contractEndDate?: string;
}

export interface CreateEmployeeRequest {
  // Account
  email: string;
  temporaryPassword: string;
  employeeCode?: string;

  // Personal Details
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  bloodGroup?: string | null;

  // Contact Information
  personalEmail?: string | null;
  phoneNumber?: string | null;
  workPhone?: string | null;
  alternatePhone?: string | null;

  // Current Address
  currentAddressLine1?: string | null;
  currentAddressLine2?: string | null;
  currentCity?: string | null;
  currentState?: string | null;
  currentCountry?: string | null;
  currentPostalCode?: string | null;

  // Permanent Address
  sameAsCurrentAddress?: boolean;
  permanentAddressLine1?: string | null;
  permanentAddressLine2?: string | null;
  permanentCity?: string | null;
  permanentState?: string | null;
  permanentCountry?: string | null;
  permanentPostalCode?: string | null;

  // Emergency Contact
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  alternateEmergencyContactName?: string | null;
  alternateEmergencyContactRelationship?: string | null;
  alternateEmergencyContactPhone?: string | null;

  // Employment Details
  joiningDate?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  reportsToId?: string | null;
  employmentType?: string | null;
  employmentStatus?: string | null;

  // Vendor/Client/Project Assignment
  vendorId?: string | null;
  clientId?: string | null;
  projectId?: string | null;

  // Probation
  isProbation?: boolean;
  probationStartDate?: string | null;
  probationEndDate?: string | null;
  probationStatus?: string | null;

  // Contract
  contractStartDate?: string | null;
  contractEndDate?: string | null;

  // Compensation
  basicSalary?: number | null;
  currency?: string | null;
  payFrequency?: string | null;

  // Bank Details
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  ifscCode?: string | null;
  swiftCode?: string | null;

  // Tax & Legal
  taxIdentificationNumber?: string | null;

  // India-Specific
  panNumber?: string | null;
  aadharNumber?: string | null;
  uanNumber?: string | null;

  // USA-Specific
  ssnNumber?: string | null;
  driversLicenseNumber?: string | null;
  passportNumber?: string | null;

  // Additional Info
  linkedInProfile?: string | null;
  githubProfile?: string | null;

  // Permission Groups
  permissionGroupIds?: string[];
}

export const orgadminApi = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await http.get<Employee[]>('/api/orgadmin/employees');
    return response.data;
  },

  createEmployee: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await http.post<Employee>('/api/orgadmin/employees', data);
    return response.data;
  },

  updateEmployeeRoles: async (employeeId: string, roleIds: string[]): Promise<void> => {
    await http.put(`/api/orgadmin/employees/${employeeId}/roles`, { roleIds });
  },

  deleteEmployee: async (employeeId: string): Promise<void> => {
    await http.delete(`/api/orgadmin/employees/${employeeId}`);
  },

  reactivateEmployee: async (employeeId: string): Promise<void> => {
    await http.post(`/api/orgadmin/employees/${employeeId}/reactivate`);
  },

  resetEmployeePassword: async (employeeId: string, newPassword: string): Promise<void> => {
    await http.post(`/api/orgadmin/employees/${employeeId}/reset-password`, { newPassword });
  },

  extendProbation: async (employeeId: string, newEndDate: string): Promise<void> => {
    await http.post(`/api/orgadmin/employees/${employeeId}/probation/extend`, {
      action: 'extend',
      newEndDate
    });
  },

  completeProbation: async (employeeId: string): Promise<void> => {
    await http.post(`/api/orgadmin/employees/${employeeId}/probation/complete`, {
      action: 'complete'
    });
  },

  terminateProbation: async (employeeId: string): Promise<void> => {
    await http.post(`/api/orgadmin/employees/${employeeId}/probation/terminate`, {
      action: 'terminate'
    });
  },
};
