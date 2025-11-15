import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { getPositions, PositionResponse } from '../../../api/structureApi';

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositions();
      setPositions(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const seniorityTemplate = (rowData: PositionResponse) => {
    return <Tag value={`Level ${rowData.seniorityLevel}`} severity="info" />;
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Positions</h2>
      <Button
        label="Create Position"
        icon="pi pi-plus"
        onClick={() => navigate('/admin/structure/positions/new')}
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
            value={positions}
            emptyMessage="No positions found"
            className="p-datatable-sm"
          >
            <Column field="name" header="Name" sortable />
            <Column field="seniorityLevel" header="Seniority Level" body={seniorityTemplate} sortable />
          </DataTable>
        )}
      </Card>
    </div>
  );
};
