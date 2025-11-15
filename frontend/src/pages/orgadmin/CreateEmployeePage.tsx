import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { orgadminApi } from '../../api/orgadminApi';

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await orgadminApi.createEmployee({ email, temporaryPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/orgadmin/employees');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Employee</h1>

        {success ? (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Employee created successfully! Email sent with credentials. Redirecting...
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Temporary Password
                </label>
                <Password
                  id="password"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  feedback={false}
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
                  onClick={() => navigate('/orgadmin/employees')}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
