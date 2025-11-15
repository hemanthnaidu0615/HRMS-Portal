import http from './http';

export interface Employee {
  employeeId: string;
  userId: string;
  email: string;
  departmentName?: string;
  positionName?: string;
  reportsToEmployeeId?: string;
  reportsToEmail?: string;
  employmentType?: string;
  contractEndDate?: string;
}

export interface CreateEmployeeRequest {
  email: string;
  temporaryPassword: string;
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
};
