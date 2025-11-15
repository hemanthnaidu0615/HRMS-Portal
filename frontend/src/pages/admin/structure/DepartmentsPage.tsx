import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { getDepartments, DepartmentResponse } from '../../../api/structureApi';

export const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Departments</h2>
      <Button
        label="Create Department"
        icon="pi pi-plus"
        onClick={() => navigate('/admin/structure/departments/new')}
      />
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
          <Skeleton height="200px" />
        ) : (
          <DataTable
            value={departments}
            emptyMessage="No departments found"
            className="p-datatable-sm"
          >
            <Column field="name" header="Name" sortable />
          </DataTable>
        )}
      </Card>
    </div>
  );
};
