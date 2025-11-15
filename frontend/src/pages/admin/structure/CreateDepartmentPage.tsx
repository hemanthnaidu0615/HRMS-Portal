import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { createDepartment } from '../../../api/structureApi';

export const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Name is required' });
      return;
    }

    try {
      setLoading(true);
      await createDepartment(name);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Department created' });
      setTimeout(() => navigate('/admin/structure/departments'), 1000);
    } catch (err: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create department' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Toast ref={toast} />
      <Card title="Create Department">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Department Name
            </label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Enter department name"
            />
          </div>
          <div className="flex gap-2">
            <Button
              label="Save"
              icon="pi pi-check"
              type="submit"
              loading={loading}
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              type="button"
              onClick={() => navigate('/admin/structure/departments')}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
