import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { getEmployeeHistory, EmployeeHistoryResponse } from '../../../api/employeeManagementApi';

export const EmployeeHistoryPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<EmployeeHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadHistory();
    }
  }, [employeeId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeHistory(employeeId!);
      setHistory(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const changedAtTemplate = (rowData: EmployeeHistoryResponse) => {
    return new Date(rowData.changedAt).toLocaleString();
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Employee History</h2>
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        onClick={() => navigate(`/admin/employees/${employeeId}`)}
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
          <Skeleton height="400px" />
        ) : (
          <DataTable
            value={history}
            emptyMessage="No history found"
            className="p-datatable-sm"
            paginator
            rows={20}
          >
            <Column field="changedField" header="Field" sortable />
            <Column field="oldValue" header="Old Value" />
            <Column field="newValue" header="New Value" />
            <Column field="changedByEmail" header="Changed By" />
            <Column field="changedAt" header="Changed At" body={changedAtTemplate} sortable />
          </DataTable>
        )}
      </Card>
    </div>
  );
};
