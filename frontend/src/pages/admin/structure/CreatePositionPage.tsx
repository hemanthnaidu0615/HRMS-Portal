import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { createPosition } from '../../../api/structureApi';

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState<number | null>(1);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Name is required' });
      return;
    }

    if (!seniorityLevel || seniorityLevel < 1) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Valid seniority level is required' });
      return;
    }

    try {
      setLoading(true);
      await createPosition(name, seniorityLevel);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Position created' });
      setTimeout(() => navigate('/admin/structure/positions'), 1000);
    } catch (err: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create position' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Toast ref={toast} />
      <Card title="Create Position">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Position Name
            </label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Enter position name"
            />
          </div>
          <div>
            <label htmlFor="seniorityLevel" className="block text-sm font-medium mb-2">
              Seniority Level
            </label>
            <InputNumber
              id="seniorityLevel"
              value={seniorityLevel}
              onValueChange={(e) => setSeniorityLevel(e.value)}
              className="w-full"
              min={1}
              placeholder="Enter seniority level"
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
              onClick={() => navigate('/admin/structure/positions')}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
