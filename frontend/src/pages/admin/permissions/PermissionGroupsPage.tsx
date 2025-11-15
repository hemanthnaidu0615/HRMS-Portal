import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { getPermissionGroups, PermissionGroupResponse } from '../../../api/permissionsApi';

export const PermissionGroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PermissionGroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getPermissionGroups();
      setGroups(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load permission groups');
    } finally {
      setLoading(false);
    }
  };

  const nameTemplate = (rowData: PermissionGroupResponse) => {
    return <Tag value={rowData.name} severity="info" />;
  };

  const permissionCountTemplate = (rowData: PermissionGroupResponse) => {
    return <Tag value={`${rowData.permissions.length} permissions`} severity="success" />;
  };

  const actionsTemplate = (rowData: PermissionGroupResponse) => {
    return (
      <Button
        label="View"
        icon="pi pi-eye"
        size="small"
        onClick={() => navigate(`/admin/permissions/groups/${rowData.id}`)}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Permission Groups</h2>
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <Skeleton height="300px" />
        ) : (
          <DataTable
            value={groups}
            emptyMessage="No permission groups found"
            className="p-datatable-sm"
          >
            <Column field="name" header="Group Name" body={nameTemplate} />
            <Column field="description" header="Description" />
            <Column header="Permission Count" body={permissionCountTemplate} />
            <Column header="Actions" body={actionsTemplate} />
          </DataTable>
        )}
      </Card>
    </div>
  );
};
