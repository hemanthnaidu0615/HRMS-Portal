import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { getEmployees, EmployeeSummaryResponse } from '../../../api/employeeManagementApi';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const departmentTemplate = (rowData: EmployeeSummaryResponse) => {
    return rowData.departmentName ? <Tag value={rowData.departmentName} severity="info" /> : <span>—</span>;
  };

  const positionTemplate = (rowData: EmployeeSummaryResponse) => {
    return rowData.positionName ? <Tag value={rowData.positionName} severity="success" /> : <span>—</span>;
  };

  const employmentTypeTemplate = (rowData: EmployeeSummaryResponse) => {
    if (!rowData.employmentType) return <span>—</span>;

    const severityMap: Record<string, any> = {
      internal: 'success',
      client: 'info',
      contract: 'warning',
      bench: 'danger'
    };

    return <Tag value={rowData.employmentType} severity={severityMap[rowData.employmentType] || 'secondary'} />;
  };

  const contractEndTemplate = (rowData: EmployeeSummaryResponse) => {
    return rowData.contractEndDate || '—';
  };

  const actionsTemplate = (rowData: EmployeeSummaryResponse) => {
    return (
      <div className="flex gap-2">
        <Button
          label="Details"
          icon="pi pi-eye"
          size="small"
          onClick={() => navigate(`/admin/employees/${rowData.employeeId}`)}
        />
        <Button
          label="Assignment"
          icon="pi pi-pencil"
          size="small"
          severity="secondary"
          onClick={() => navigate(`/admin/employees/${rowData.employeeId}/assignment`)}
        />
        <Button
          label="History"
          icon="pi pi-history"
          size="small"
          severity="info"
          onClick={() => navigate(`/admin/employees/${rowData.employeeId}/history`)}
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Employees</h2>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Card header={header}>
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <Skeleton height="400px" />
        ) : (
          <DataTable
            value={employees}
            emptyMessage="No employees found"
            className="p-datatable-sm"
            paginator
            rows={10}
          >
            <Column field="email" header="Email" sortable />
            <Column header="Department" body={departmentTemplate} />
            <Column header="Position" body={positionTemplate} />
            <Column header="Employment Type" body={employmentTypeTemplate} />
            <Column header="Contract End" body={contractEndTemplate} />
            <Column header="Actions" body={actionsTemplate} />
          </DataTable>
        )}
      </Card>
    </div>
  );
};
