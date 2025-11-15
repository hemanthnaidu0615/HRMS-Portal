import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { getPermissionGroup, PermissionGroupResponse, PermissionResponse } from '../../../api/permissionsApi';

export const PermissionGroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<PermissionGroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await getPermissionGroup(groupId!);
      setGroup(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load permission group');
    } finally {
      setLoading(false);
    }
  };

  const codeTemplate = (rowData: PermissionResponse) => {
    return <Tag value={rowData.code} severity="info" />;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Card>
          <Skeleton height="200px" />
        </Card>
        <Card>
          <Skeleton height="400px" />
        </Card>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Card>
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || 'Permission group not found'}
          </div>
          <div className="mt-4">
            <Button
              label="Back to Groups"
              icon="pi pi-arrow-left"
              onClick={() => navigate('/admin/permissions/groups')}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => navigate('/admin/permissions/groups')}
          />
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Description:</span> {group.description || '—'}
          </div>
          <div>
            <Tag value={`${group.permissions.length} permissions`} severity="success" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Permissions</h3>
        <DataTable
          value={group.permissions}
          emptyMessage="No permissions assigned to this group"
          className="p-datatable-sm"
        >
          <Column field="code" header="Permission Code" body={codeTemplate} />
          <Column field="description" header="Description" />
        </DataTable>
      </Card>
    </div>
  );
};
