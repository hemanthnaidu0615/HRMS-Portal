import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { superadminApi, Organization } from '../../api/superadminApi';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await superadminApi.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (rowData: Organization) => {
    return (
      <Button
        label="Add Org Admin"
        icon="pi pi-user-plus"
        size="small"
        onClick={() => navigate(`/superadmin/orgadmin/${rowData.id}`)}
      />
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Button
          label="Create Organization"
          icon="pi pi-plus"
          onClick={() => navigate('/superadmin/create-organization')}
        />
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <DataTable
        value={organizations}
        loading={loading}
        emptyMessage="No organizations found"
        className="p-datatable-sm"
      >
        <Column field="name" header="Organization Name" sortable />
        <Column
          field="createdAt"
          header="Created At"
          sortable
          body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
        />
        <Column header="Actions" body={actionBodyTemplate} />
      </DataTable>
    </div>
  );
};
