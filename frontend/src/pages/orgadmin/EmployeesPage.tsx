import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { orgadminApi, Employee } from '../../api/orgadminApi';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await orgadminApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button
          label="Create Employee"
          icon="pi pi-plus"
          onClick={() => navigate('/orgadmin/create-employee')}
        />
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <DataTable
        value={employees}
        loading={loading}
        emptyMessage="No employees found"
        className="p-datatable-sm"
      >
        <Column field="email" header="Email" sortable />
      </DataTable>
    </div>
  );
};
