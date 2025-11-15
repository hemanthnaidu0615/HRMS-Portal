import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { superadminApi } from '../../api/superadminApi';

export const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await superadminApi.createOrganization({ name });
      navigate('/superadmin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Organization</h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Organization Name
            </label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              label="Create"
              loading={loading}
              disabled={loading}
            />
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              onClick={() => navigate('/superadmin/organizations')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
