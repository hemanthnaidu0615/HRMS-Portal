import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import {
  getEmployeePermissions,
  updateEmployeePermissionGroups,
  getAllPermissionGroups,
  EmployeePermissionOverviewResponse,
  PermissionGroupResponse,
} from '../../api/employeePermissionsApi';

export const EmployeePermissionsPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overview, setOverview] = useState<EmployeePermissionOverviewResponse | null>(null);
  const [allGroups, setAllGroups] = useState<PermissionGroupResponse[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, groupsData] = await Promise.all([
        getEmployeePermissions(employeeId!),
        getAllPermissionGroups(),
      ]);
      setOverview(permissionsData);
      setAllGroups(groupsData);
      setSelectedGroupIds(permissionsData.assignedGroups.map((g) => g.groupId));
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load employee permissions',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateEmployeePermissionGroups(employeeId!, selectedGroupIds);
      setOverview(updated);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Permission groups updated successfully',
        life: 3000,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update permission groups',
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = allGroups.map((g) => ({
    label: g.name,
    value: g.id,
  }));

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Toast ref={toast} />

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Employee Permissions</h2>
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            text
            onClick={() => navigate(`/admin/employees/${employeeId}`)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton height="2rem" />
            <Skeleton height="3rem" />
            <Skeleton height="8rem" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Employee</label>
              <div className="text-lg font-semibold">{overview?.email}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Assigned Permission Groups</label>
              <MultiSelect
                value={selectedGroupIds}
                options={groupOptions}
                onChange={(e) => setSelectedGroupIds(e.value)}
                placeholder="Select permission groups"
                className="w-full"
                display="chip"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Effective Permissions</label>
              <div className="flex flex-wrap gap-2">
                {overview?.effectivePermissions && overview.effectivePermissions.length > 0 ? (
                  overview.effectivePermissions.map((perm) => (
                    <Tag key={perm} severity="info" value={perm} />
                  ))
                ) : (
                  <span className="text-gray-500">No permissions assigned</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                label="Save"
                icon="pi pi-save"
                onClick={handleSave}
                loading={saving}
                disabled={saving}
              />
              <Button
                label="Cancel"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => navigate(`/admin/employees/${employeeId}`)}
                disabled={saving}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
