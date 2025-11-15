import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { uploadEmployeeDocument } from '../../api/documentsApi';

export const UploadEmployeeDocumentPage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!employeeId) {
      setError('Invalid employee ID');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await uploadEmployeeDocument(employeeId, file);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/documents/employee/${employeeId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Employee Document</h1>
        <p className="mb-4 text-gray-600">Employee ID: {employeeId}</p>

        {success ? (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Document uploaded successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                Select File
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                label="Upload"
                loading={loading}
                disabled={loading}
              />
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                onClick={() => navigate('/documents/org')}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
