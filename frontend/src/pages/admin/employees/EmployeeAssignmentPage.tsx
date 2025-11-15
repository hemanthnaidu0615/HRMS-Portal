import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { getEmployeeDetails, updateEmployeeAssignment, getEmployees, EmployeeDetailResponse, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';
import { getDepartments, getPositions, DepartmentResponse, PositionResponse } from '../../../api/structureApi';

export const EmployeeAssignmentPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);
  const [reportsToEmployeeId, setReportsToEmployeeId] = useState<string | null>(null);
  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [contractEndDate, setContractEndDate] = useState<Date | null>(null);

  const employmentTypeOptions = [
    { label: 'Internal', value: 'internal' },
    { label: 'Client', value: 'client' },
    { label: 'Contract', value: 'contract' },
    { label: 'Bench', value: 'bench' }
  ];

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, deptData, posData, empListData] = await Promise.all([
        getEmployeeDetails(employeeId!),
        getDepartments(),
        getPositions(),
        getEmployees()
      ]);

      setEmployee(empData);
      setDepartments(deptData);
      setPositions(posData);
      setEmployees(empListData.filter(e => e.employeeId !== employeeId));

      setDepartmentId(empData.departmentId);
      setPositionId(empData.positionId);
      setReportsToEmployeeId(empData.reportsToEmployeeId);
      setEmploymentType(empData.employmentType);
      setClientId(empData.clientId || '');
      setProjectId(empData.projectId || '');
      setContractEndDate(empData.contractEndDate ? new Date(empData.contractEndDate) : null);

      setError('');
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateEmployeeAssignment(employeeId!, {
        departmentId: departmentId || null,
        positionId: positionId || null,
        reportsToEmployeeId: reportsToEmployeeId || null,
        employmentType: employmentType || null,
        clientId: clientId || null,
        projectId: projectId || null,
        contractEndDate: contractEndDate ? contractEndDate.toISOString().split('T')[0] : null
      });

      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Assignment updated' });
      setTimeout(() => navigate(`/admin/employees/${employeeId}`), 1000);
    } catch (err: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update assignment' });
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Edit Employee Assignment</h2>
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        onClick={() => navigate(`/admin/employees/${employeeId}`)}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Toast ref={toast} />
        <Card header={header}>
          <Skeleton height="500px" />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Toast ref={toast} />
        <Card header={header}>
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || 'Employee not found'}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Toast ref={toast} />
      <Card header={header}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Reporting</h3>
            <div>
              <label htmlFor="reportsTo" className="block text-sm font-medium mb-2">
                Reports To
              </label>
              <Dropdown
                id="reportsTo"
                value={reportsToEmployeeId}
                onChange={(e) => setReportsToEmployeeId(e.value)}
                options={employees}
                optionLabel={(emp) => `${emp.email} ${emp.positionName ? `(${emp.positionName})` : ''}`}
                optionValue="employeeId"
                placeholder="Select manager"
                className="w-full"
                showClear
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Structure</h3>
            <div>
              <label htmlFor="department" className="block text-sm font-medium mb-2">
                Department
              </label>
              <Dropdown
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.value)}
                options={departments}
                optionLabel="name"
                optionValue="id"
                placeholder="Select department"
                className="w-full"
                showClear
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium mb-2">
                Position
              </label>
              <Dropdown
                id="position"
                value={positionId}
                onChange={(e) => setPositionId(e.value)}
                options={positions}
                optionLabel="name"
                optionValue="id"
                placeholder="Select position"
                className="w-full"
                showClear
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Employment</h3>
            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium mb-2">
                Employment Type
              </label>
              <Dropdown
                id="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.value)}
                options={employmentTypeOptions}
                placeholder="Select employment type"
                className="w-full"
                showClear
              />
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium mb-2">
                Client ID
              </label>
              <InputText
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full"
                placeholder="Enter client ID"
              />
            </div>
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium mb-2">
                Project ID
              </label>
              <InputText
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full"
                placeholder="Enter project ID"
              />
            </div>
            <div>
              <label htmlFor="contractEndDate" className="block text-sm font-medium mb-2">
                Contract End Date
              </label>
              <Calendar
                id="contractEndDate"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.value as Date)}
                className="w-full"
                placeholder="Select date"
                showIcon
                dateFormat="yy-mm-dd"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              label="Save"
              icon="pi pi-check"
              type="submit"
              loading={saving}
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              type="button"
              onClick={() => navigate(`/admin/employees/${employeeId}`)}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
