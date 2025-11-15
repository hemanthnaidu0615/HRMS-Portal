import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { getEmployeeDetails, EmployeeDetailResponse } from '../../../api/employeeManagementApi';

export const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeDetails(employeeId!);
      setEmployee(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Employee Details</h2>
      <div className="flex gap-2">
        <Button
          label="Edit Assignment"
          icon="pi pi-pencil"
          onClick={() => navigate(`/admin/employees/${employeeId}/assignment`)}
        />
        <Button
          label="View History"
          icon="pi pi-history"
          severity="secondary"
          onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
        />
        <Button
          label="Manage Permissions"
          icon="pi pi-shield"
          onClick={() => navigate(`/orgadmin/employees/${employeeId}/permissions`)}
        />
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          severity="info"
          onClick={() => navigate('/admin/employees')}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Card header={header}>
          <Skeleton height="300px" />
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Card header={header}>
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || 'Employee not found'}
          </div>
        </Card>
      </div>
    );
  }

  const employmentTypeColor: Record<string, any> = {
    internal: 'success',
    client: 'info',
    contract: 'warning',
    bench: 'danger'
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card header={header}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-lg">{employee.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              {employee.employmentType ? (
                <Tag value={employee.employmentType} severity={employmentTypeColor[employee.employmentType] || 'secondary'} />
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {employee.departmentName ? (
                <Tag value={employee.departmentName} severity="info" />
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              {employee.positionName ? (
                <Tag value={employee.positionName} severity="success" />
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
              <p>{employee.reportsToEmail || '—'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <p>{employee.clientId || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
              <p>{employee.projectId || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
              <p>{employee.contractEndDate || '—'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
